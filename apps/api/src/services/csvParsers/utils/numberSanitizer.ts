/**
 * Number Sanitizer
 * 
 * Cleans and parses numbers from various formats:
 * - Currency: $1,234.56 → 1234.56
 * - Percentages: 10.6% → 10.6
 * - Negative values: ($1,234.56) → -1234.56
 * - Empty/null values → null
 */

/**
 * Remove currency symbols and formatting from a string
 */
export function sanitizeCurrency(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Convert to string and trim
  const str = String(value).trim();
  
  if (str === '' || str === '-' || str === 'N/A' || str.toLowerCase() === 'n/a') {
    return null;
  }
  
  // Check if it's a negative number in accounting format: ($1,234.56)
  const isNegativeAccountingFormat = /^\(.*\)$/.test(str);
  
  // Remove all non-numeric characters except decimal point and minus sign
  let cleaned = str
    .replace(/[$,]/g, '') // Remove dollar signs and commas
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/\s/g, '') // Remove spaces
    .trim();
  
  // Parse the number
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    return null;
  }
  
  // Apply negative sign if it was in accounting format
  return isNegativeAccountingFormat ? -parsed : parsed;
}

/**
 * Extract percentage value (removes % sign, returns number)
 * Example: "10.6%" → 10.6
 */
export function sanitizePercentage(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const str = String(value).trim();
  
  if (str === '' || str === '-' || str === 'N/A') {
    return null;
  }
  
  // Remove % sign and any spaces
  const cleaned = str.replace(/%/g, '').replace(/\s/g, '').trim();
  
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Extract percentage from label text
 * Example: "Sales Tax (10.6%)" → 10.6
 * Example: "CPO Management (10%)" → 10.0
 */
export function extractPercentageFromLabel(label: string | null | undefined): number | null {
  if (!label) return null;
  
  // Match patterns like "(10.6%)" or "(10%)"
  const match = label.match(/\((\d+\.?\d*)\s*%\s*\)/);
  
  if (match && match[1]) {
    const value = parseFloat(match[1]);
    return isNaN(value) ? null : value;
  }
  
  return null;
}

/**
 * Parse a general number (handles decimals, negatives, etc.)
 */
export function sanitizeNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // If already a number, return it
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  // Use currency sanitizer for strings (handles most cases)
  return sanitizeCurrency(value);
}

/**
 * Parse integer (no decimals)
 */
export function sanitizeInteger(value: string | number | null | undefined): number | null {
  const num = sanitizeNumber(value);
  return num !== null ? Math.round(num) : null;
}

/**
 * Parse boolean values from various formats
 * Handles: "Yes"/"No", "Y"/"N", "True"/"False", "1"/"0", "X"/""
 */
export function sanitizeBoolean(value: string | boolean | null | undefined): boolean | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // If already boolean, return it
  if (typeof value === 'boolean') {
    return value;
  }
  
  const str = String(value).trim().toLowerCase();
  
  // True values
  if (['yes', 'y', 'true', '1', 'x', 'funded', 'active'].includes(str)) {
    return true;
  }
  
  // False values
  if (['no', 'n', 'false', '0', '', 'not funded', 'inactive'].includes(str)) {
    return false;
  }
  
  return null;
}

/**
 * Parse year from various formats
 * Handles: "2025", "25", "FY 2025", etc.
 */
export function sanitizeYear(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const str = String(value).trim();
  
  // Extract 4-digit year or 2-digit year
  const match = str.match(/\b(20\d{2}|\d{2})\b/);
  
  if (match) {
    const year = parseInt(match[1], 10);
    
    // If 2-digit year, assume 20xx
    if (year < 100) {
      return 2000 + year;
    }
    
    return year;
  }
  
  // Try direct parse
  const parsed = parseInt(str, 10);
  
  if (isNaN(parsed)) {
    return null;
  }
  
  // If reasonable year range
  if (parsed >= 2000 && parsed <= 2100) {
    return parsed;
  }
  
  // If 2-digit
  if (parsed < 100) {
    return 2000 + parsed;
  }
  
  return null;
}

/**
 * Batch sanitize currency values from an object
 */
export function sanitizeCurrencyFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  
  for (const field of fields) {
    if (field in result) {
      result[field] = sanitizeCurrency(result[field] as any) as any;
    }
  }
  
  return result;
}

/**
 * Batch sanitize percentage values from an object
 */
export function sanitizePercentageFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  
  for (const field of fields) {
    if (field in result) {
      result[field] = sanitizePercentage(result[field] as any) as any;
    }
  }
  
  return result;
}
