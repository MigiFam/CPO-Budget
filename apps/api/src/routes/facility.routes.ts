import { Router, Request } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { UserRole, FacilityType } from '@prisma/client';
import { createAuditLog } from '../lib/audit';

const router = Router();

// Validation schemas
const createFacilitySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.nativeEnum(FacilityType),
  address: z.string().optional(),
  squareFootage: z.number().min(0).optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  capacity: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

const updateFacilitySchema = createFacilitySchema.partial();

// Helper to get auth user
function getAuthUser(req: Request): AuthRequest['user'] {
  return req.user as AuthRequest['user'];
}

// GET /api/facilities - List all facilities (all authenticated users)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { type } = req.query;
    
    const where: any = {
      organizationId: user.organizationId,
    };
    
    if (type) where.type = type as FacilityType;
    
    const facilities = await prisma.facility.findMany({
      where,
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    res.json(facilities);
  } catch (error) {
    next(error);
  }
});

// GET /api/facilities/:id - Get single facility
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    
    const facility = await prisma.facility.findFirst({
      where: { 
        id,
        organizationId: user.organizationId,
      },
      include: {
        projects: {
          include: {
            projectManager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            budgets: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            projectBudgets: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.json(facility);
  } catch (error) {
    next(error);
  }
});

// POST /api/facilities - Create new facility (Director/Finance only)
router.post('/', requireAuth, requireRole([UserRole.DIRECTOR, UserRole.FINANCE]), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const data = createFacilitySchema.parse(req.body);
    
    // Check for duplicate code
    const existing = await prisma.facility.findFirst({
      where: {
        organizationId: user.organizationId,
        code: data.code,
      },
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Facility code already exists' });
    }
    
    const facility = await prisma.facility.create({
      data: {
        ...data,
        organizationId: user.organizationId,
      },
    });
    
    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'Facility',
      entityId: facility.id,
      action: 'CREATE',
      diffJSON: { facilityName: facility.name },
    });
    
    res.status(201).json(facility);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
});

// PATCH /api/facilities/:id - Update facility (Director/Finance only)
router.patch('/:id', requireAuth, requireRole([UserRole.DIRECTOR, UserRole.FINANCE]), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    const data = updateFacilitySchema.parse(req.body);
    
    const facility = await prisma.facility.findFirst({
      where: { 
        id,
        organizationId: user.organizationId,
      },
    });
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    // Check for duplicate code if code is being changed
    if (data.code && data.code !== facility.code) {
      const existing = await prisma.facility.findFirst({
        where: {
          organizationId: user.organizationId,
          code: data.code,
          id: { not: id },
        },
      });
      
      if (existing) {
        return res.status(400).json({ message: 'Facility code already exists' });
      }
    }
    
    const updated = await prisma.facility.update({
      where: { id },
      data,
    });
    
    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'Facility',
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

// DELETE /api/facilities/:id - Delete facility (Director only)
router.delete('/:id', requireAuth, requireRole([UserRole.DIRECTOR]), async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const { id } = req.params;
    
    const facility = await prisma.facility.findFirst({
      where: { 
        id,
        organizationId: user.organizationId,
      },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    if (facility._count.projects > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete facility with active projects',
        projectCount: facility._count.projects,
      });
    }
    
    await prisma.facility.delete({ where: { id } });
    
    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'Facility',
      entityId: id,
      action: 'DELETE',
      diffJSON: { facilityName: facility.name },
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
