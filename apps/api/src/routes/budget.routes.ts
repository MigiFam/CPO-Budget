import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { Decimal } from '@prisma/client/runtime/library';

const router = Router();

// Helper function to round to 2 decimal places
const round2 = (num: number): number => Math.round(num * 100) / 100;

// Helper function to convert Decimal to number
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (value instanceof Decimal) return value.toNumber();
  return parseFloat(value.toString()) || 0;
};

// POST /api/budgets - Create a new budget
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      projectId,
      baselineAmount,
      revisedAmount,
      committedToDate,
      actualsToDate,
      variance,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const budget = await prisma.budget.create({
      data: {
        projectId,
        baselineAmount: new Decimal(toNumber(baselineAmount)),
        revisedAmount: new Decimal(toNumber(revisedAmount)),
        committedToDate: new Decimal(toNumber(committedToDate)),
        actualsToDate: new Decimal(toNumber(actualsToDate)),
        variance: new Decimal(toNumber(variance)),
      },
    });

    res.json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// POST /api/budgets/project-budgets - Create a new project budget
router.post('/project-budgets', requireAuth, async (req, res) => {
  try {
    const {
      projectId,
      approvedBudgetTotal,
      baseBidPlusAlts,
      changeOrdersTotal,
      salesTaxRatePercent,
      cpoManagementRatePercent,
      techMisc,
      consultants,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Calculate derived fields
    const baseBid = toNumber(baseBidPlusAlts) || 0;
    const changeOrders = toNumber(changeOrdersTotal) || 0;
    const salesTaxRate = toNumber(salesTaxRatePercent) || 0;
    const cpoRate = toNumber(cpoManagementRatePercent) || 0;
    const tech = toNumber(techMisc) || 0;
    const consult = toNumber(consultants) || 0;
    const approvedTotal = toNumber(approvedBudgetTotal) || 0;

    const salesTaxAmount = round2(baseBid * (salesTaxRate / 100));
    const constructionCostSubtotal = round2(baseBid + changeOrders + salesTaxAmount);
    const cpoManagementAmount = round2(constructionCostSubtotal * (cpoRate / 100));
    const otherCostSubtotal = round2(cpoManagementAmount + tech + consult);
    const totalProjectCost = round2(constructionCostSubtotal + otherCostSubtotal);
    const remainder = round2(approvedTotal - totalProjectCost);

    const budget = await prisma.projectBudget.create({
      data: {
        projectId,
        approvedBudgetTotal: new Decimal(approvedTotal),
        baseBidPlusAlts: new Decimal(baseBid),
        changeOrdersTotal: new Decimal(changeOrders),
        salesTaxRatePercent: new Decimal(salesTaxRate),
        salesTaxAmount: new Decimal(salesTaxAmount),
        constructionCostSubtotal: new Decimal(constructionCostSubtotal),
        cpoManagementRatePercent: new Decimal(cpoRate),
        cpoManagementAmount: new Decimal(cpoManagementAmount),
        techMisc: new Decimal(tech),
        consultants: new Decimal(consult),
        otherCostSubtotal: new Decimal(otherCostSubtotal),
        totalProjectCost: new Decimal(totalProjectCost),
        remainder: new Decimal(remainder),
        asOfDate: new Date(),
      },
    });

    res.json(budget);
  } catch (error) {
    console.error('Error creating project budget:', error);
    res.status(500).json({ error: 'Failed to create project budget' });
  }
});

// PATCH /api/budgets/project-budgets/:id - Update a project budget
router.patch('/project-budgets/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      approvedBudgetTotal,
      baseBidPlusAlts,
      changeOrdersTotal,
      salesTaxRatePercent,
      cpoManagementRatePercent,
      techMisc,
      consultants,
    } = req.body;

    // Calculate derived fields
    const baseBid = toNumber(baseBidPlusAlts) || 0;
    const changeOrders = toNumber(changeOrdersTotal) || 0;
    const salesTaxRate = toNumber(salesTaxRatePercent) || 0;
    const cpoRate = toNumber(cpoManagementRatePercent) || 0;
    const tech = toNumber(techMisc) || 0;
    const consult = toNumber(consultants) || 0;
    const approvedTotal = toNumber(approvedBudgetTotal) || 0;

    const salesTaxAmount = round2(baseBid * (salesTaxRate / 100));
    const constructionCostSubtotal = round2(baseBid + changeOrders + salesTaxAmount);
    const cpoManagementAmount = round2(constructionCostSubtotal * (cpoRate / 100));
    const otherCostSubtotal = round2(cpoManagementAmount + tech + consult);
    const totalProjectCost = round2(constructionCostSubtotal + otherCostSubtotal);
    const remainder = round2(approvedTotal - totalProjectCost);

    const budget = await prisma.projectBudget.update({
      where: { id },
      data: {
        approvedBudgetTotal: new Decimal(approvedTotal),
        baseBidPlusAlts: new Decimal(baseBid),
        changeOrdersTotal: new Decimal(changeOrders),
        salesTaxRatePercent: new Decimal(salesTaxRate),
        salesTaxAmount: new Decimal(salesTaxAmount),
        constructionCostSubtotal: new Decimal(constructionCostSubtotal),
        cpoManagementRatePercent: new Decimal(cpoRate),
        cpoManagementAmount: new Decimal(cpoManagementAmount),
        techMisc: new Decimal(tech),
        consultants: new Decimal(consult),
        otherCostSubtotal: new Decimal(otherCostSubtotal),
        totalProjectCost: new Decimal(totalProjectCost),
        remainder: new Decimal(remainder),
        asOfDate: new Date(),
      },
    });

    res.json(budget);
  } catch (error) {
    console.error('Error updating project budget:', error);
    res.status(500).json({ error: 'Failed to update project budget' });
  }
});

// PATCH /api/budgets/:id - Update budget progress (committedToDate, actualsToDate)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { committedToDate, actualsToDate } = req.body;

    const updateData: any = {};
    
    if (committedToDate !== undefined) {
      updateData.committedToDate = new Decimal(toNumber(committedToDate));
    }
    
    if (actualsToDate !== undefined) {
      updateData.actualsToDate = new Decimal(toNumber(actualsToDate));
      
      // Recalculate variance if actuals changed
      const budget = await prisma.budget.findUnique({ where: { id } });
      if (budget) {
        const baseline = toNumber(budget.baselineAmount);
        const actuals = toNumber(actualsToDate);
        updateData.variance = new Decimal(round2(baseline - actuals));
      }
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
    });

    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

export default router;
