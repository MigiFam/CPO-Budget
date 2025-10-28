import { Router } from 'express';
import passport from 'passport';
import { prisma } from '../lib/prisma';
import { requireDirector } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(passport.authenticate('jwt', { session: false }));

// Get all users (Director only)
router.get('/', requireDirector, async (req, res) => {
  try {
    const user = req.user as any;
    
    const users = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

export default router;
