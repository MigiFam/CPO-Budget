import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

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

export default router;

