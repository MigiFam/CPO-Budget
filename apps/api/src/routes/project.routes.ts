import { Router, Request } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { getAccessibleProjectIds, hasProjectAccess } from '../middleware/permissions';
import { UserRole, ProjectType, ProjectStatus } from '@prisma/client';
import { createAuditLog } from '../lib/audit';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  facilityId: z.string().uuid(),
  fundingSourceId: z.string().uuid(),
  projectType: z.nativeEnum(ProjectType),
  projectManagerId: z.string().uuid().optional(),
  status: z.nativeEnum(ProjectStatus).default('PLANNING'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  baselineCost: z.number().min(0).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

// Helper to get auth user
function getAuthUser(req: Request): AuthRequest['user'] {
  return req.user as AuthRequest['user'];
}

// GET /api/projects - List all accessible projects
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { facilityId, fundingSourceId, status, projectType } = req.query;
    
    const accessibleIds = await getAccessibleProjectIds(user.id, user.organizationId, user.role);
    
    const where: any = {
      id: { in: accessibleIds },
    };
    
    if (facilityId) where.facilityId = facilityId as string;
    if (fundingSourceId) where.fundingSourceId = fundingSourceId as string;
    if (status) where.status = status as ProjectStatus;
    if (projectType) where.projectType = projectType as ProjectType;
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        facility: true,
        fundingSource: true,
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        budgets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            teams: true,
            comments: true,
            issues: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id - Get single project details
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    
    const hasAccess = await hasProjectAccess(user.id, id, user.role);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        facility: true,
        fundingSource: true,
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        budgets: {
          include: {
            budgetLines: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        projectBudgets: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get most recent
        },
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        issues: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// POST /api/projects - Create new project (Director/Finance only)
router.post('/', requireAuth, requireRole([UserRole.DIRECTOR, UserRole.FINANCE]), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const data = createProjectSchema.parse(req.body);
    
    const project = await prisma.project.create({
      data: {
        ...data,
        organizationId: user.organizationId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        facility: true,
        fundingSource: true,
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'Project',
      entityId: project.id,
      action: 'CREATE',
      diffJSON: { projectName: project.name },
    });
    
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
});

// PATCH /api/projects/:id - Update project
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    
    const hasAccess = await hasProjectAccess(user.id, id, user.role);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }
    
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const canEdit = 
      user.role === UserRole.DIRECTOR || 
      user.role === UserRole.FINANCE || 
      (user.role === UserRole.PROJECT_MANAGER && project.projectManagerId === user.id);
    
    if (!canEdit) {
      return res.status(403).json({ message: 'You do not have permission to edit this project' });
    }
    
    const data = updateProjectSchema.parse(req.body);
    
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        facility: true,
        fundingSource: true,
        projectManager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'Project',
      entityId: updated.id,
      action: 'UPDATE',
      diffJSON: { changes: data },
    });
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/projects/:id - Delete project (Director only)
router.delete('/:id', requireAuth, requireRole([UserRole.DIRECTOR]), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await prisma.project.delete({ where: { id } });
    
    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'Project',
      entityId: id,
      action: 'DELETE',
      diffJSON: { projectName: project.name },
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
