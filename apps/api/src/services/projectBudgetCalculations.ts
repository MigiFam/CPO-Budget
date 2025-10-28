/**
 * Project Budget Calculation Service
 * 
 * Pure functions for computing derived budget fields based on District-Wide budget format.
 * All calculations are server-side to ensure consistency and prevent client-side manipulation.
 * 
 * Formula Reference (from District Wide tab):
 * - Sales Tax Amount = (Base Bid + Alts + Change Orders) × (Sales Tax Rate % / 100)
 * - Construction Cost Subtotal = Base Bid + Alts + Change Orders + Sales Tax
 * - CPO Management Amount = Construction Cost Subtotal × (CPO Management Rate % / 100)
 * - Other Cost Subtotal = CPO Management + Tech Misc + Consultants
 * - Total Project Cost = Construction Cost Subtotal + Other Cost Subtotal
 * - Remainder = Approved Budget Total - Total Project Cost
 */

import { Decimal } from '@prisma/client/runtime/library';

export interface ProjectBudgetInputs {
  approvedBudgetTotal?: number | Decimal | null;
  baseBidPlusAlts?: number | Decimal | null;
  changeOrdersTotal?: number | Decimal | null;
  salesTaxRatePercent?: number | Decimal | null;
  cpoManagementRatePercent?: number | Decimal | null;
  techMisc?: number | Decimal | null;
  consultants?: number | Decimal | null;
}

export interface ProjectBudgetComputedFields {
  salesTaxAmount: number;
  constructionCostSubtotal: number;
  cpoManagementAmount: number;
  otherCostSubtotal: number;
  totalProjectCost: number;
  remainder: number;
}

/**
 * Convert Decimal or number to a plain number for calculations
 */
function toNumber(value: number | Decimal | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.toString());
}

/**
 * Round to 2 decimal places (currency precision)
 */
function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate sales tax amount
 * Formula: (Base Bid + Alts + Change Orders) × (Tax Rate % / 100)
 */
export function calculateSalesTaxAmount(
  baseBidPlusAlts: number | Decimal | null | undefined,
  changeOrdersTotal: number | Decimal | null | undefined,
  salesTaxRatePercent: number | Decimal | null | undefined
): number {
  const base = toNumber(baseBidPlusAlts);
  const changes = toNumber(changeOrdersTotal);
  const rate = toNumber(salesTaxRatePercent);
  
  const taxableAmount = base + changes;
  const taxAmount = taxableAmount * (rate / 100);
  
  return roundCurrency(taxAmount);
}

/**
 * Calculate construction cost subtotal
 * Formula: Base Bid + Alts + Change Orders + Sales Tax
 */
export function calculateConstructionCostSubtotal(
  baseBidPlusAlts: number | Decimal | null | undefined,
  changeOrdersTotal: number | Decimal | null | undefined,
  salesTaxAmount: number | Decimal | null | undefined
): number {
  const base = toNumber(baseBidPlusAlts);
  const changes = toNumber(changeOrdersTotal);
  const tax = toNumber(salesTaxAmount);
  
  return roundCurrency(base + changes + tax);
}

/**
 * Calculate CPO management amount
 * Formula: Construction Cost Subtotal × (CPO Management Rate % / 100)
 */
export function calculateCPOManagementAmount(
  constructionCostSubtotal: number | Decimal | null | undefined,
  cpoManagementRatePercent: number | Decimal | null | undefined
): number {
  const subtotal = toNumber(constructionCostSubtotal);
  const rate = toNumber(cpoManagementRatePercent);
  
  return roundCurrency(subtotal * (rate / 100));
}

/**
 * Calculate other cost subtotal
 * Formula: CPO Management + Tech Misc + Consultants
 */
export function calculateOtherCostSubtotal(
  cpoManagementAmount: number | Decimal | null | undefined,
  techMisc: number | Decimal | null | undefined,
  consultants: number | Decimal | null | undefined
): number {
  const cpo = toNumber(cpoManagementAmount);
  const tech = toNumber(techMisc);
  const consult = toNumber(consultants);
  
  return roundCurrency(cpo + tech + consult);
}

/**
 * Calculate total project cost
 * Formula: Construction Cost Subtotal + Other Cost Subtotal
 */
export function calculateTotalProjectCost(
  constructionCostSubtotal: number | Decimal | null | undefined,
  otherCostSubtotal: number | Decimal | null | undefined
): number {
  const construction = toNumber(constructionCostSubtotal);
  const other = toNumber(otherCostSubtotal);
  
  return roundCurrency(construction + other);
}

/**
 * Calculate remainder (budget surplus/deficit)
 * Formula: Approved Budget Total - Total Project Cost
 * Positive = under budget, Negative = over budget
 */
export function calculateRemainder(
  approvedBudgetTotal: number | Decimal | null | undefined,
  totalProjectCost: number | Decimal | null | undefined
): number {
  const approved = toNumber(approvedBudgetTotal);
  const total = toNumber(totalProjectCost);
  
  return roundCurrency(approved - total);
}

/**
 * Calculate variance between estimated and actual costs
 * Formula: Estimated - Actual
 * Positive = came in under estimate, Negative = over estimate
 */
export function calculateVariance(
  estimatedCost: number | Decimal | null | undefined,
  actualCost: number | Decimal | null | undefined
): number {
  const estimated = toNumber(estimatedCost);
  const actual = toNumber(actualCost);
  
  return roundCurrency(estimated - actual);
}

/**
 * Calculate all derived fields for a project budget
 * This is the main function used when creating/updating ProjectBudget records
 */
export function computeAllProjectBudgetFields(inputs: ProjectBudgetInputs): ProjectBudgetComputedFields {
  // Step 1: Calculate sales tax amount
  const salesTaxAmount = calculateSalesTaxAmount(
    inputs.baseBidPlusAlts,
    inputs.changeOrdersTotal,
    inputs.salesTaxRatePercent
  );
  
  // Step 2: Calculate construction cost subtotal
  const constructionCostSubtotal = calculateConstructionCostSubtotal(
    inputs.baseBidPlusAlts,
    inputs.changeOrdersTotal,
    salesTaxAmount
  );
  
  // Step 3: Calculate CPO management amount
  const cpoManagementAmount = calculateCPOManagementAmount(
    constructionCostSubtotal,
    inputs.cpoManagementRatePercent
  );
  
  // Step 4: Calculate other cost subtotal
  const otherCostSubtotal = calculateOtherCostSubtotal(
    cpoManagementAmount,
    inputs.techMisc,
    inputs.consultants
  );
  
  // Step 5: Calculate total project cost
  const totalProjectCost = calculateTotalProjectCost(
    constructionCostSubtotal,
    otherCostSubtotal
  );
  
  // Step 6: Calculate remainder
  const remainder = calculateRemainder(
    inputs.approvedBudgetTotal,
    totalProjectCost
  );
  
  return {
    salesTaxAmount,
    constructionCostSubtotal,
    cpoManagementAmount,
    otherCostSubtotal,
    totalProjectCost,
    remainder
  };
}

/**
 * Calculate percentage spent
 * Formula: (Total Project Cost / Approved Budget) × 100
 */
export function calculatePercentSpent(
  totalProjectCost: number | Decimal | null | undefined,
  approvedBudgetTotal: number | Decimal | null | undefined
): number {
  const total = toNumber(totalProjectCost);
  const approved = toNumber(approvedBudgetTotal);
  
  if (approved === 0) return 0;
  
  const percent = (total / approved) * 100;
  return roundCurrency(percent);
}

/**
 * Validate project budget inputs before saving
 * Returns array of validation error messages
 */
export function validateProjectBudgetInputs(inputs: ProjectBudgetInputs): string[] {
  const errors: string[] = [];
  
  // Check for negative values
  if (toNumber(inputs.baseBidPlusAlts) < 0) {
    errors.push('Base Bid Plus Alts cannot be negative');
  }
  
  if (toNumber(inputs.approvedBudgetTotal) < 0) {
    errors.push('Approved Budget Total cannot be negative');
  }
  
  // Check for reasonable percentage ranges
  const taxRate = toNumber(inputs.salesTaxRatePercent);
  if (taxRate < 0 || taxRate > 50) {
    errors.push('Sales Tax Rate must be between 0% and 50%');
  }
  
  const cpoRate = toNumber(inputs.cpoManagementRatePercent);
  if (cpoRate < 0 || cpoRate > 50) {
    errors.push('CPO Management Rate must be between 0% and 50%');
  }
  
  return errors;
}
