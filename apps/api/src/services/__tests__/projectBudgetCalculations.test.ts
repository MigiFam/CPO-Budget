/**
 * Project Budget Calculations Unit Tests
 * 
 * Tests for all derived calculation functions with edge cases:
 * - Zero values
 * - Null/undefined values
 * - Negative change orders
 * - High tax rates
 * - Decimal precision
 * - Rounding behavior
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSalesTaxAmount,
  calculateConstructionCostSubtotal,
  calculateCPOManagementAmount,
  calculateOtherCostSubtotal,
  calculateTotalProjectCost,
  calculateRemainder,
  calculateVariance,
  computeAllProjectBudgetFields,
  calculatePercentSpent,
  validateProjectBudgetInputs,
  type ProjectBudgetInputs
} from '../projectBudgetCalculations';

describe('Project Budget Calculations', () => {
  describe('calculateSalesTaxAmount', () => {
    it('should calculate sales tax correctly with standard inputs', () => {
      const result = calculateSalesTaxAmount(100000, 5000, 10.6);
      expect(result).toBe(11130); // (100000 + 5000) * 0.106 = 11130
    });

    it('should handle zero tax rate', () => {
      const result = calculateSalesTaxAmount(100000, 5000, 0);
      expect(result).toBe(0);
    });

    it('should handle zero base bid', () => {
      const result = calculateSalesTaxAmount(0, 5000, 10.6);
      expect(result).toBe(530); // 5000 * 0.106 = 530
    });

    it('should handle negative change orders', () => {
      const result = calculateSalesTaxAmount(100000, -5000, 10.6);
      expect(result).toBe(10070); // (100000 - 5000) * 0.106 = 10070
    });

    it('should handle null/undefined values as zero', () => {
      const result = calculateSalesTaxAmount(null, undefined, 10.6);
      expect(result).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const result = calculateSalesTaxAmount(100000, 5000, 10.65);
      expect(result).toBe(11182.5); // (105000 * 0.1065) = 11182.5
    });
  });

  describe('calculateConstructionCostSubtotal', () => {
    it('should sum base bid, change orders, and sales tax', () => {
      const result = calculateConstructionCostSubtotal(100000, 5000, 11130);
      expect(result).toBe(116130);
    });

    it('should handle zero sales tax', () => {
      const result = calculateConstructionCostSubtotal(100000, 5000, 0);
      expect(result).toBe(105000);
    });

    it('should handle negative change orders', () => {
      const result = calculateConstructionCostSubtotal(100000, -5000, 10070);
      expect(result).toBe(105070); // 100000 - 5000 + 10070
    });

    it('should handle all nulls as zero', () => {
      const result = calculateConstructionCostSubtotal(null, null, null);
      expect(result).toBe(0);
    });
  });

  describe('calculateCPOManagementAmount', () => {
    it('should calculate CPO management fee correctly', () => {
      const result = calculateCPOManagementAmount(116130, 10);
      expect(result).toBe(11613); // 116130 * 0.10 = 11613
    });

    it('should handle zero percentage', () => {
      const result = calculateCPOManagementAmount(116130, 0);
      expect(result).toBe(0);
    });

    it('should handle high percentage', () => {
      const result = calculateCPOManagementAmount(100000, 25);
      expect(result).toBe(25000);
    });

    it('should handle fractional percentages', () => {
      const result = calculateCPOManagementAmount(100000, 10.5);
      expect(result).toBe(10500); // 100000 * 0.105 = 10500
    });
  });

  describe('calculateOtherCostSubtotal', () => {
    it('should sum CPO management, tech misc, and consultants', () => {
      const result = calculateOtherCostSubtotal(11613, 5000, 3000);
      expect(result).toBe(19613);
    });

    it('should handle all zeros', () => {
      const result = calculateOtherCostSubtotal(0, 0, 0);
      expect(result).toBe(0);
    });

    it('should handle null values', () => {
      const result = calculateOtherCostSubtotal(11613, null, undefined);
      expect(result).toBe(11613);
    });
  });

  describe('calculateTotalProjectCost', () => {
    it('should sum construction and other costs', () => {
      const result = calculateTotalProjectCost(116130, 19613);
      expect(result).toBe(135743);
    });

    it('should handle zeros', () => {
      const result = calculateTotalProjectCost(0, 0);
      expect(result).toBe(0);
    });
  });

  describe('calculateRemainder', () => {
    it('should calculate positive remainder (under budget)', () => {
      const result = calculateRemainder(150000, 135743);
      expect(result).toBe(14257); // 150000 - 135743 = 14257
    });

    it('should calculate negative remainder (over budget)', () => {
      const result = calculateRemainder(100000, 135743);
      expect(result).toBe(-35743); // 100000 - 135743 = -35743
    });

    it('should return zero when balanced', () => {
      const result = calculateRemainder(100000, 100000);
      expect(result).toBe(0);
    });
  });

  describe('calculateVariance', () => {
    it('should calculate positive variance (under estimate)', () => {
      const result = calculateVariance(150000, 135000);
      expect(result).toBe(15000);
    });

    it('should calculate negative variance (over estimate)', () => {
      const result = calculateVariance(100000, 135000);
      expect(result).toBe(-35000);
    });
  });

  describe('computeAllProjectBudgetFields', () => {
    it('should compute all fields correctly for a complete budget', () => {
      const inputs: ProjectBudgetInputs = {
        approvedBudgetTotal: 150000,
        baseBidPlusAlts: 100000,
        changeOrdersTotal: 5000,
        salesTaxRatePercent: 10.6,
        cpoManagementRatePercent: 10,
        techMisc: 5000,
        consultants: 3000
      };

      const result = computeAllProjectBudgetFields(inputs);

      expect(result.salesTaxAmount).toBe(11130); // (100000 + 5000) * 0.106
      expect(result.constructionCostSubtotal).toBe(116130); // 100000 + 5000 + 11130
      expect(result.cpoManagementAmount).toBe(11613); // 116130 * 0.10
      expect(result.otherCostSubtotal).toBe(19613); // 11613 + 5000 + 3000
      expect(result.totalProjectCost).toBe(135743); // 116130 + 19613
      expect(result.remainder).toBe(14257); // 150000 - 135743
    });

    it('should handle all null inputs', () => {
      const inputs: ProjectBudgetInputs = {};
      const result = computeAllProjectBudgetFields(inputs);

      expect(result.salesTaxAmount).toBe(0);
      expect(result.constructionCostSubtotal).toBe(0);
      expect(result.cpoManagementAmount).toBe(0);
      expect(result.otherCostSubtotal).toBe(0);
      expect(result.totalProjectCost).toBe(0);
      expect(result.remainder).toBe(0);
    });

    it('should handle negative change orders correctly', () => {
      const inputs: ProjectBudgetInputs = {
        approvedBudgetTotal: 100000,
        baseBidPlusAlts: 100000,
        changeOrdersTotal: -10000, // Credits/reductions
        salesTaxRatePercent: 10.6,
        cpoManagementRatePercent: 10,
        techMisc: 2000,
        consultants: 1000
      };

      const result = computeAllProjectBudgetFields(inputs);

      expect(result.salesTaxAmount).toBe(9540); // (100000 - 10000) * 0.106
      expect(result.constructionCostSubtotal).toBe(99540); // 100000 - 10000 + 9540
      expect(result.cpoManagementAmount).toBe(9954); // 99540 * 0.10
      expect(result.otherCostSubtotal).toBe(12954); // 9954 + 2000 + 1000
      expect(result.totalProjectCost).toBe(112494); // 99540 + 12954
      expect(result.remainder).toBe(-12494); // 100000 - 112494
    });

    it('should handle high tax and CPO rates', () => {
      const inputs: ProjectBudgetInputs = {
        approvedBudgetTotal: 200000,
        baseBidPlusAlts: 80000,
        changeOrdersTotal: 0,
        salesTaxRatePercent: 15.5, // High tax jurisdiction
        cpoManagementRatePercent: 12, // Higher management rate
        techMisc: 3000,
        consultants: 2000
      };

      const result = computeAllProjectBudgetFields(inputs);

      expect(result.salesTaxAmount).toBe(12400); // 80000 * 0.155
      expect(result.constructionCostSubtotal).toBe(92400); // 80000 + 12400
      expect(result.cpoManagementAmount).toBe(11088); // 92400 * 0.12
      expect(result.otherCostSubtotal).toBe(16088); // 11088 + 3000 + 2000
      expect(result.totalProjectCost).toBe(108488); // 92400 + 16088
      expect(result.remainder).toBe(91512); // 200000 - 108488
    });
  });

  describe('calculatePercentSpent', () => {
    it('should calculate percentage spent correctly', () => {
      const result = calculatePercentSpent(135743, 150000);
      expect(result).toBe(90.5); // (135743 / 150000) * 100 = 90.49533...
    });

    it('should handle 100% spent', () => {
      const result = calculatePercentSpent(150000, 150000);
      expect(result).toBe(100);
    });

    it('should handle over budget (>100%)', () => {
      const result = calculatePercentSpent(160000, 150000);
      expect(result).toBe(106.67); // (160000 / 150000) * 100
    });

    it('should return 0 when approved budget is zero', () => {
      const result = calculatePercentSpent(135743, 0);
      expect(result).toBe(0);
    });
  });

  describe('validateProjectBudgetInputs', () => {
    it('should pass validation for valid inputs', () => {
      const inputs: ProjectBudgetInputs = {
        approvedBudgetTotal: 150000,
        baseBidPlusAlts: 100000,
        changeOrdersTotal: 5000,
        salesTaxRatePercent: 10.6,
        cpoManagementRatePercent: 10,
        techMisc: 5000,
        consultants: 3000
      };

      const errors = validateProjectBudgetInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should reject negative base bid', () => {
      const inputs: ProjectBudgetInputs = {
        baseBidPlusAlts: -100000
      };

      const errors = validateProjectBudgetInputs(inputs);
      expect(errors).toContain('Base Bid Plus Alts cannot be negative');
    });

    it('should reject negative approved budget', () => {
      const inputs: ProjectBudgetInputs = {
        approvedBudgetTotal: -150000
      };

      const errors = validateProjectBudgetInputs(inputs);
      expect(errors).toContain('Approved Budget Total cannot be negative');
    });

    it('should reject tax rate > 50%', () => {
      const inputs: ProjectBudgetInputs = {
        salesTaxRatePercent: 55
      };

      const errors = validateProjectBudgetInputs(inputs);
      expect(errors).toContain('Sales Tax Rate must be between 0% and 50%');
    });

    it('should reject negative tax rate', () => {
      const inputs: ProjectBudgetInputs = {
        salesTaxRatePercent: -5
      };

      const errors = validateProjectBudgetInputs(inputs);
      expect(errors).toContain('Sales Tax Rate must be between 0% and 50%');
    });

    it('should reject CPO rate > 50%', () => {
      const inputs: ProjectBudgetInputs = {
        cpoManagementRatePercent: 60
      };

      const errors = validateProjectBudgetInputs(inputs);
      expect(errors).toContain('CPO Management Rate must be between 0% and 50%');
    });

    it('should collect multiple errors', () => {
      const inputs: ProjectBudgetInputs = {
        baseBidPlusAlts: -100000,
        salesTaxRatePercent: -5,
        cpoManagementRatePercent: 60
      };

      const errors = validateProjectBudgetInputs(inputs);
      expect(errors).toHaveLength(3);
    });
  });

  describe('Decimal precision and rounding', () => {
    it('should handle very small amounts without precision loss', () => {
      const result = calculateSalesTaxAmount(0.01, 0.01, 10.6);
      expect(result).toBe(0); // (0.02 * 0.106) = 0.00212, rounds to 0.00
    });

    it('should round half-cent values correctly', () => {
      const result = calculateSalesTaxAmount(100, 0, 10.65);
      expect(result).toBe(10.65); // 100 * 0.1065 = 10.65
    });

    it('should maintain precision through full calculation chain', () => {
      const inputs: ProjectBudgetInputs = {
        approvedBudgetTotal: 1234.56,
        baseBidPlusAlts: 1000.99,
        changeOrdersTotal: 50.05,
        salesTaxRatePercent: 10.6,
        cpoManagementRatePercent: 10.0,
        techMisc: 25.50,
        consultants: 15.75
      };

      const result = computeAllProjectBudgetFields(inputs);

      // Verify all steps maintain 2 decimal precision
      expect(result.salesTaxAmount.toString()).toMatch(/^\d+\.\d{1,2}$/);
      expect(result.constructionCostSubtotal.toString()).toMatch(/^\d+\.\d{1,2}$/);
      expect(result.cpoManagementAmount.toString()).toMatch(/^\d+\.\d{1,2}$/);
      expect(result.otherCostSubtotal.toString()).toMatch(/^\d+\.\d{1,2}$/);
      expect(result.totalProjectCost.toString()).toMatch(/^\d+\.\d{1,2}$/);
      expect(result.remainder.toString()).toMatch(/^-?\d+\.\d{1,2}$/);
    });
  });
});
