import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { seedFromEmbedded } from '../../scripts/seed-from-embedded';

const router = Router();

/**
 * POST /api/admin/seed/embedded
 * Triggers the embedded data seed process
 * Restricted to Director and Admin roles only
 */
router.post(
  '/seed/embedded',
  requireAuth,
  requireRole([UserRole.DIRECTOR]),
  async (req, res, next) => {
    try {
      console.log('🎬 Starting embedded data seed via API...');
      
      // Optional: allow custom path from request body
      const seedPath = req.body.seedPath as string | undefined;
      
      // Run the seed function
      const summary = await seedFromEmbedded(seedPath);
      
      // Return success response with summary
      res.json({
        success: true,
        message: 'Embedded data seeded successfully',
        summary: {
          facilities: {
            created: summary.facilities.created,
            updated: summary.facilities.updated,
            total: summary.facilities.created + summary.facilities.updated,
          },
          projects: {
            created: summary.projects.created,
            updated: summary.projects.updated,
            total: summary.projects.created + summary.projects.updated,
          },
          budgets: {
            created: summary.budgets.created,
            updated: summary.budgets.updated,
            total: summary.budgets.created + summary.budgets.updated,
          },
          estimates: {
            created: summary.estimates.created,
            updated: summary.estimates.updated,
            total: summary.estimates.created + summary.estimates.updated,
          },
          attachments: {
            created: summary.attachments.created,
            updated: summary.attachments.updated,
            total: summary.attachments.created + summary.attachments.updated,
          },
        },
      });
    } catch (error) {
      console.error('❌ Seed via API failed:', error);
      next(error);
    }
  }
);

/**
 * GET /api/admin/seed/status
 * Check if seed data is available
 */
router.get(
  '/seed/status',
  requireAuth,
  requireRole([UserRole.DIRECTOR]),
  async (req, res, next) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const seedPath = process.env.SEED_PATH || path.join(__dirname, '..', '..', 'data', 'seed_bundle.json');
      const exists = fs.existsSync(seedPath);
      
      let fileInfo = null;
      if (exists) {
        const stats = fs.statSync(seedPath);
        fileInfo = {
          path: seedPath,
          size: stats.size,
          modified: stats.mtime,
        };
      }
      
      res.json({
        available: exists,
        file: fileInfo,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
