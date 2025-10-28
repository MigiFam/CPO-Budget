/**
 * Number Sanitizer Tests
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeCurrency,
  sanitizePercentage,
  extractPercentageFromLabel,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeYear,
} from '../numberSanitizer.js';

describe('Number Sanitizer', () => {
  describe('sanitizeCurrency', () => {
    it('should parse basic currency', () => {
      expect(sanitizeCurrency('$1,234.56')).toBe(1234.56);
      expect(sanitizeCurrency('$100')).toBe(100);
      expect(sanitizeCurrency('$0.99')).toBe(0.99);
    });

    it('should handle currency without dollar sign', () => {
      expect(sanitizeCurrency('1,234.56')).toBe(1234.56);
      expect(sanitizeCurrency('1234.56')).toBe(1234.56);
    });

    it('should handle negative values', () => {
      expect(sanitizeCurrency('-$1,234.56')).toBe(-1234.56);
      expect(sanitizeCurrency('($1,234.56)')).toBe(-1234.56); // Accounting format
    });

    it('should handle empty/null values', () => {
      expect(sanitizeCurrency('')).toBe(null);
      expect(sanitizeCurrency(null)).toBe(null);
      expect(sanitizeCurrency(undefined)).toBe(null);
      expect(sanitizeCurrency('-')).toBe(null);
      expect(sanitizeCurrency('N/A')).toBe(null);
    });

    it('should handle large numbers', () => {
      expect(sanitizeCurrency('$1,000,000.00')).toBe(1000000);
      expect(sanitizeCurrency('$174,870,000')).toBe(174870000);
    });

    it('should handle numbers with extra spaces', () => {
      expect(sanitizeCurrency('  $1,234.56  ')).toBe(1234.56);
      expect(sanitizeCurrency('$ 1,234.56')).toBe(1234.56);
    });
  });

  describe('sanitizePercentage', () => {
    it('should extract percentage values', () => {
      expect(sanitizePercentage('10.6%')).toBe(10.6);
      expect(sanitizePercentage('10%')).toBe(10);
      expect(sanitizePercentage('0.5%')).toBe(0.5);
    });

    it('should handle percentages without % sign', () => {
      expect(sanitizePercentage('10.6')).toBe(10.6);
      expect(sanitizePercentage('10')).toBe(10);
    });

    it('should handle empty values', () => {
      expect(sanitizePercentage('')).toBe(null);
      expect(sanitizePercentage(null)).toBe(null);
      expect(sanitizePercentage('-')).toBe(null);
    });

    it('should handle percentages with spaces', () => {
      expect(sanitizePercentage('  10.6 %  ')).toBe(10.6);
    });
  });

  describe('extractPercentageFromLabel', () => {
    it('should extract from label text', () => {
      expect(extractPercentageFromLabel('Sales Tax (10.6%)')).toBe(10.6);
      expect(extractPercentageFromLabel('CPO Management (10%)')).toBe(10);
      expect(extractPercentageFromLabel('Construction Contingency (5.5%)')).toBe(5.5);
    });

    it('should handle labels without percentages', () => {
      expect(extractPercentageFromLabel('Base Bid')).toBe(null);
      expect(extractPercentageFromLabel('Consultants')).toBe(null);
    });

    it('should handle null/empty', () => {
      expect(extractPercentageFromLabel(null)).toBe(null);
      expect(extractPercentageFromLabel('')).toBe(null);
    });

    it('should handle percentages with spaces', () => {
      expect(extractPercentageFromLabel('Sales Tax ( 10.6 % )')).toBe(10.6);
    });
  });

  describe('sanitizeNumber', () => {
    it('should handle various number formats', () => {
      expect(sanitizeNumber('1234')).toBe(1234);
      expect(sanitizeNumber('1,234')).toBe(1234);
      expect(sanitizeNumber('$1,234')).toBe(1234);
    });

    it('should handle decimals', () => {
      expect(sanitizeNumber('1234.56')).toBe(1234.56);
      expect(sanitizeNumber('0.99')).toBe(0.99);
    });

    it('should handle already-parsed numbers', () => {
      expect(sanitizeNumber(1234)).toBe(1234);
      expect(sanitizeNumber(1234.56)).toBe(1234.56);
    });

    it('should return null for invalid values', () => {
      expect(sanitizeNumber('abc')).toBe(null);
      expect(sanitizeNumber('')).toBe(null);
      expect(sanitizeNumber(null)).toBe(null);
    });
  });

  describe('sanitizeBoolean', () => {
    it('should parse true values', () => {
      expect(sanitizeBoolean('Yes')).toBe(true);
      expect(sanitizeBoolean('Y')).toBe(true);
      expect(sanitizeBoolean('True')).toBe(true);
      expect(sanitizeBoolean('1')).toBe(true);
      expect(sanitizeBoolean('X')).toBe(true);
      expect(sanitizeBoolean('Funded')).toBe(true);
    });

    it('should parse false values', () => {
      expect(sanitizeBoolean('No')).toBe(false);
      expect(sanitizeBoolean('N')).toBe(false);
      expect(sanitizeBoolean('False')).toBe(false);
      expect(sanitizeBoolean('0')).toBe(false);
      expect(sanitizeBoolean('')).toBe(null); // Empty is null, not false
    });

    it('should be case-insensitive', () => {
      expect(sanitizeBoolean('YES')).toBe(true);
      expect(sanitizeBoolean('yes')).toBe(true);
      expect(sanitizeBoolean('NO')).toBe(false);
      expect(sanitizeBoolean('no')).toBe(false);
    });

    it('should handle already-parsed booleans', () => {
      expect(sanitizeBoolean(true)).toBe(true);
      expect(sanitizeBoolean(false)).toBe(false);
    });

    it('should return null for invalid values', () => {
      expect(sanitizeBoolean('maybe')).toBe(null);
      expect(sanitizeBoolean(null)).toBe(null);
    });
  });

  describe('sanitizeYear', () => {
    it('should parse 4-digit years', () => {
      expect(sanitizeYear('2025')).toBe(2025);
      expect(sanitizeYear('2024')).toBe(2024);
      expect(sanitizeYear(2025)).toBe(2025);
    });

    it('should parse 2-digit years as 20xx', () => {
      expect(sanitizeYear('25')).toBe(2025);
      expect(sanitizeYear('24')).toBe(2024);
    });

    it('should extract year from text', () => {
      expect(sanitizeYear('FY 2025')).toBe(2025);
      expect(sanitizeYear('Completion: 2024')).toBe(2024);
    });

    it('should return null for invalid years', () => {
      expect(sanitizeYear('abc')).toBe(null);
      expect(sanitizeYear('')).toBe(null);
      expect(sanitizeYear(null)).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(sanitizeYear('99')).toBe(2099); // 2-digit becomes 20xx
      expect(sanitizeYear('1999')).toBe(null); // Out of range
      expect(sanitizeYear('2101')).toBe(null); // Out of range
    });
  });
});
