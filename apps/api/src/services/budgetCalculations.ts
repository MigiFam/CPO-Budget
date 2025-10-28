import { prisma } from '../lib/prisma';
import { CostEventType, CostEventStatus } from '@prisma/client';

/**
 * Budget Calculation Service
 * Handles all budget math and recalculations
 */

export interface BudgetCalculations {
  baselineCost: number;
  revisedCost: number;
  committedCost: number;
  actualCost: number;
  forecastAtCompletion: number;
  variance: number;
  percentComplete: number;
  percentCommitted: number;
}

/**
 * Calculate total committed costs (approved POs and contracts)
 */
export async function calculateCommitted(budgetId: string): Promise<number> {
  const result = await prisma.costEvent.aggregate({
    where: {
      budgetLineId: {
        in: await prisma.budgetLine.findMany({
          where: { budgetId },
          select: { id: true },
        }).then(lines => lines.map(l => l.id)),
      },
      type: {
        in: [CostEventType.PURCHASE_ORDER, CostEventType.CONTRACT],
      },
      status: CostEventStatus.APPROVED,
    },
    _sum: {
      amount: true,
    },
  });
  
  return result._sum.amount || 0;
}

/**
 * Calculate total actual costs (approved invoices and payments)
 */
export async function calculateActuals(budgetId: string): Promise<number> {
  const result = await prisma.costEvent.aggregate({
    where: {
      budgetLineId: {
        in: await prisma.budgetLine.findMany({
          where: { budgetId },
          select: { id: true },
        }).then(lines => lines.map(l => l.id)),
      },
      type: {
        in: [CostEventType.INVOICE, CostEventType.PAYMENT],
      },
      status: CostEventStatus.APPROVED,
    },
    _sum: {
      amount: true,
    },
  });
  
  return result._sum.amount || 0;
}

/**
 * Calculate pending change orders (not yet approved)
 */
export async function calculatePendingChanges(budgetId: string): Promise<number> {
  const result = await prisma.costEvent.aggregate({
    where: {
      budgetLineId: {
        in: await prisma.budgetLine.findMany({
          where: { budgetId },
          select: { id: true },
        }).then(lines => lines.map(l => l.id)),
      },
      type: CostEventType.CHANGE_ORDER,
      status: {
        in: [CostEventStatus.DRAFT, CostEventStatus.PENDING_APPROVAL],
      },
    },
    _sum: {
      amount: true,
    },
  });
  
  return result._sum.amount || 0;
}

/**
 * Calculate approved change orders
 */
export async function calculateApprovedChanges(budgetId: string): Promise<number> {
  const result = await prisma.costEvent.aggregate({
    where: {
      budgetLineId: {
        in: await prisma.budgetLine.findMany({
          where: { budgetId },
          select: { id: true },
        }).then(lines => lines.map(l => l.id)),
      },
      type: CostEventType.CHANGE_ORDER,
      status: CostEventStatus.APPROVED,
    },
    _sum: {
      amount: true,
    },
  });
  
  return result._sum.amount || 0;
}

/**
 * Calculate Forecast at Completion (FAC)
 * FAC = Revised Budget + Pending Change Orders
 */
export async function calculateForecastAtCompletion(budgetId: string): Promise<number> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    select: { revisedCost: true },
  });
  
  if (!budget) return 0;
  
  const pendingChanges = await calculatePendingChanges(budgetId);
  return budget.revisedCost + pendingChanges;
}

/**
 * Calculate variance (Budget - Actuals)
 * Positive variance = under budget
 * Negative variance = over budget
 */
export function calculateVariance(revisedCost: number, actualCost: number): number {
  return revisedCost - actualCost;
}

/**
 * Calculate percent complete based on actuals vs revised budget
 */
export function calculatePercentComplete(actualCost: number, revisedCost: number): number {
  if (revisedCost === 0) return 0;
  return Math.min(Math.round((actualCost / revisedCost) * 100), 100);
}

/**
 * Calculate percent committed
 */
export function calculatePercentCommitted(committedCost: number, revisedCost: number): number {
  if (revisedCost === 0) return 0;
  return Math.min(Math.round((committedCost / revisedCost) * 100), 100);
}

/**
 * Recalculate and update all budget calculations
 * This should be called whenever cost events are approved
 */
export async function recalculateBudget(budgetId: string): Promise<BudgetCalculations> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    select: { 
      baselineCost: true,
      revisedCost: true,
    },
  });
  
  if (!budget) {
    throw new Error('Budget not found');
  }
  
  // Calculate all values
  const committedCost = await calculateCommitted(budgetId);
  const actualCost = await calculateActuals(budgetId);
  const approvedChanges = await calculateApprovedChanges(budgetId);
  const forecastAtCompletion = await calculateForecastAtCompletion(budgetId);
  
  // Revised cost = baseline + approved changes
  const revisedCost = budget.baselineCost + approvedChanges;
  
  const variance = calculateVariance(revisedCost, actualCost);
  const percentComplete = calculatePercentComplete(actualCost, revisedCost);
  const percentCommitted = calculatePercentCommitted(committedCost, revisedCost);
  
  // Update budget in database
  await prisma.budget.update({
    where: { id: budgetId },
    data: {
      revisedCost,
      committedCost,
      actualCost,
      forecastAtCompletion,
      variance,
    },
  });
  
  return {
    baselineCost: budget.baselineCost,
    revisedCost,
    committedCost,
    actualCost,
    forecastAtCompletion,
    variance,
    percentComplete,
    percentCommitted,
  };
}

/**
 * Recalculate budget line totals
 */
export async function recalculateBudgetLine(budgetLineId: string): Promise<void> {
  const committed = await prisma.costEvent.aggregate({
    where: {
      budgetLineId,
      type: {
        in: [CostEventType.PURCHASE_ORDER, CostEventType.CONTRACT],
      },
      status: CostEventStatus.APPROVED,
    },
    _sum: { amount: true },
  });
  
  const actual = await prisma.costEvent.aggregate({
    where: {
      budgetLineId,
      type: {
        in: [CostEventType.INVOICE, CostEventType.PAYMENT],
      },
      status: CostEventStatus.APPROVED,
    },
    _sum: { amount: true },
  });
  
  const budgetLine = await prisma.budgetLine.findUnique({
    where: { id: budgetLineId },
    select: { budgetedAmount: true },
  });
  
  if (!budgetLine) return;
  
  const committedCost = committed._sum.amount || 0;
  const actualCost = actual._sum.amount || 0;
  const variance = budgetLine.budgetedAmount - actualCost;
  
  await prisma.budgetLine.update({
    where: { id: budgetLineId },
    data: {
      committedCost,
      actualCost,
      variance,
    },
  });
}

/**
 * Get budget summary with all calculations
 */
export async function getBudgetSummary(budgetId: string): Promise<BudgetCalculations | null> {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    select: {
      baselineCost: true,
      revisedCost: true,
      committedCost: true,
      actualCost: true,
      forecastAtCompletion: true,
      variance: true,
    },
  });
  
  if (!budget) return null;
  
  const percentComplete = calculatePercentComplete(budget.actualCost, budget.revisedCost);
  const percentCommitted = calculatePercentCommitted(budget.committedCost, budget.revisedCost);
  
  return {
    ...budget,
    percentComplete,
    percentCommitted,
  };
}
