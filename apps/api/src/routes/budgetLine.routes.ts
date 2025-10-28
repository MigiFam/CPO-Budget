import { Router, Request } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { hasProjectAccess } from '../middleware/permissions';
import { prisma } from '../lib/prisma';
import { createAuditLog } from '../lib/audit';

const router = Router();

// Helper to get auth user
function getAuthUser(req: Request): AuthRequest['user'] {
  return req.user as AuthRequest['user'];
}

// Get all budget lines for a budget
router.get('/budgets/:budgetId/budget-lines', requireAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const user = getAuthUser(req as AuthRequest);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // First check if user has access to the project
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { project: true },
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const access = await hasProjectAccess(
      user.id,
      budget.project.id,
      user.role
    );

    if (!access) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const budgetLines = await prisma.budgetLine.findMany({
      where: { budgetId },
      orderBy: { costCode: 'asc' },
    });

    return res.json(budgetLines);
  } catch (error) {
    console.error('Error fetching budget lines:', error);
    return res.status(500).json({ message: 'Failed to fetch budget lines' });
  }
});

// Get single budget line
router.get('/budget-lines/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = getAuthUser(req as AuthRequest);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const budgetLine = await prisma.budgetLine.findUnique({
      where: { id },
      include: {
        budget: {
          include: { project: true },
        },
      },
    });

    if (!budgetLine) {
      return res.status(404).json({ message: 'Budget line not found' });
    }

    const access = await hasProjectAccess(
      user.id,
      budgetLine.budget.project.id,
      user.role
    );

    if (!access) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(budgetLine);
  } catch (error) {
    console.error('Error fetching budget line:', error);
    return res.status(500).json({ message: 'Failed to fetch budget line' });
  }
});

// Create budget line
router.post('/budgets/:budgetId/budget-lines', requireAuth, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { costCode, category, description, baselineAmount } = req.body;
    const user = getAuthUser(req as AuthRequest);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Check access to project
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { project: true },
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const access = await hasProjectAccess(
      user.id,
      budget.project.id,
      user.role
    );

    if (!access) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only Director, Finance, and assigned PM can create budget lines
    if (
      user.role !== 'DIRECTOR' &&
      user.role !== 'FINANCE_MANAGER' &&
      budget.project.projectManagerId !== user.id
    ) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Check for duplicate cost code within budget
    const existing = await prisma.budgetLine.findFirst({
      where: {
        budgetId,
        costCode,
      },
    });

    if (existing) {
      return res.status(400).json({ 
        message: `Cost code ${costCode} already exists in this budget` 
      });
    }

    const budgetLine = await prisma.budgetLine.create({
      data: {
        budgetId,
        costCode,
        category,
        description,
        baselineAmount,
        committedToDate: 0,
        actualsToDate: 0,
        variance: baselineAmount,
      },
    });

    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'BUDGET_LINE',
      entityId: budgetLine.id,
      action: 'CREATE',
      diffJSON: { costCode, category, baselineAmount },
    });

    return res.status(201).json(budgetLine);
  } catch (error) {
    console.error('Error creating budget line:', error);
    return res.status(500).json({ message: 'Failed to create budget line' });
  }
});

// Update budget line
router.patch('/budget-lines/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { costCode, category, description, baselineAmount } = req.body;
    const user = getAuthUser(req as AuthRequest);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const budgetLine = await prisma.budgetLine.findUnique({
      where: { id },
      include: {
        budget: {
          include: { project: true },
        },
      },
    });

    if (!budgetLine) {
      return res.status(404).json({ message: 'Budget line not found' });
    }

    const access = await hasProjectAccess(
      user.id,
      budgetLine.budget.project.id,
      user.role
    );

    if (!access) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only Director, Finance, and assigned PM can edit budget lines
    if (
      user.role !== 'DIRECTOR' &&
      user.role !== 'FINANCE_MANAGER' &&
      budgetLine.budget.project.projectManagerId !== user.id
    ) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Check for duplicate cost code if changing it
    if (costCode && costCode !== budgetLine.costCode) {
      const existing = await prisma.budgetLine.findFirst({
        where: {
          budgetId: budgetLine.budgetId,
          costCode,
          id: { not: id },
        },
      });

      if (existing) {
        return res.status(400).json({ 
          message: `Cost code ${costCode} already exists in this budget` 
        });
      }
    }

    const updateData: any = {};
    if (costCode !== undefined) updateData.costCode = costCode;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (baselineAmount !== undefined) {
      updateData.baselineAmount = baselineAmount;
      // Recalculate variance
      updateData.variance = baselineAmount - Number(budgetLine.actualsToDate);
    }

    const updated = await prisma.budgetLine.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'BUDGET_LINE',
      entityId: id,
      action: 'UPDATE',
      diffJSON: updateData,
    });

    return res.json(updated);
  } catch (error) {
    console.error('Error updating budget line:', error);
    return res.status(500).json({ message: 'Failed to update budget line' });
  }
});

// Delete budget line
router.delete('/budget-lines/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = getAuthUser(req as AuthRequest);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const budgetLine = await prisma.budgetLine.findUnique({
      where: { id },
      include: {
        budget: {
          include: { project: true },
        },
      },
    });

    if (!budgetLine) {
      return res.status(404).json({ message: 'Budget line not found' });
    }

    // Only Director can delete budget lines
    if (user.role !== 'DIRECTOR') {
      return res.status(403).json({ 
        message: 'Only Directors can delete budget lines' 
      });
    }

    await prisma.budgetLine.delete({
      where: { id },
    });

    await createAuditLog({
      organizationId: user.organizationId,
      actorId: user.id,
      entity: 'BUDGET_LINE',
      entityId: id,
      action: 'DELETE',
      diffJSON: { costCode: budgetLine.costCode },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting budget line:', error);
    return res.status(500).json({ message: 'Failed to delete budget line' });
  }
});

export default router;
