import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@cpo/types';
import { z } from 'zod';

const router = Router();

// GET /api/funding-sources - List all funding sources
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    const fundingSources = await prisma.fundingSource.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    res.json(fundingSources);
  } catch (error) {
    console.error('Error fetching funding sources:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch funding sources' });
  }
});

// GET /api/funding-sources/:id - Get single funding source
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    const fundingSource = await prisma.fundingSource.findFirst({
      where: {
        id: req.params.id,
        organizationId: user.organizationId,
      },
      include: {
        projects: {
          include: {
            facility: true,
            budgets: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
    
    if (!fundingSource) {
      return res.status(404).json({ success: false, error: 'Funding source not found' });
    }
    
    res.json(fundingSource);
  } catch (error) {
    console.error('Error fetching funding source:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch funding source' });
  }
});

// POST /api/funding-sources - Create new funding source (Director/Finance only)
router.post('/', requireAuth, requireRole([UserRole.DIRECTOR, UserRole.FINANCE]), async (req, res, next) => {
  try {
    const user = req.user as any;
    
    const fundingSourceSchema = z.object({
      name: z.string().min(1),
      code: z.string().optional(),
      type: z.enum(['BOND', 'LEVY', 'GRANT', 'OTHER']),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });
    
    const data = fundingSourceSchema.parse(req.body);
    
    const fundingSource = await prisma.fundingSource.create({
      data: {
        ...data,
        organizationId: user.organizationId,
      },
    });
    
    res.status(201).json(fundingSource);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/funding-sources/:id - Update funding source (Director/Finance only)
router.patch('/:id', requireAuth, requireRole([UserRole.DIRECTOR, UserRole.FINANCE]), async (req, res, next) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    
    const fundingSourceSchema = z.object({
      name: z.string().min(1).optional(),
      code: z.string().optional(),
      type: z.enum(['BOND', 'LEVY', 'GRANT', 'OTHER']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });
    
    const data = fundingSourceSchema.parse(req.body);
    
    // Check if funding source exists and belongs to user's organization
    const existing = await prisma.fundingSource.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Funding source not found' });
    }
    
    const fundingSource = await prisma.fundingSource.update({
      where: { id },
      data,
    });
    
    res.json(fundingSource);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/funding-sources/:id - Delete funding source (Director only)
router.delete('/:id', requireAuth, requireRole([UserRole.DIRECTOR]), async (req, res, next) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    
    // Check if funding source exists and belongs to user's organization
    const existing = await prisma.fundingSource.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Funding source not found' });
    }
    
    // Don't allow deletion if there are active projects
    if (existing._count.projects > 0) {
      return res.status(400).json({
        error: 'Cannot delete funding source with active projects',
        message: 'Cannot delete funding source with active projects',
      });
    }
    
    await prisma.fundingSource.delete({ where: { id } });
    
    res.json({ success: true, message: 'Funding source deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

