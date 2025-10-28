/**
 * Header Normalizer
 * 
 * Handles inconsistent header names in CSV files:
 * - Case-insensitive matching
 * - Trim whitespace
 * - Handle common typos (e.g., "Juristiction" → "Jurisdiction")
 * - Map aliases to canonical names
 */

export interface HeaderMapping {
  [key: string]: string;
}

/**
 * Common header typos and aliases
 */
const HEADER_ALIASES: HeaderMapping = {
  // Jurisdiction typos
  'juristiction': 'jurisdiction',
  'jurisdication': 'jurisdiction',
  'juristriction': 'jurisdiction',
  
  // Priority variations
  'prior': 'priority',
  'pri': 'priority',
  '#': 'priority',
  'number': 'priority',
  
  // Location variations
  'location': 'facility',
  'site': 'facility',
  'building': 'facility',
  'school': 'facility',
  
  // Project variations
  'project name': 'project',
  'projectname': 'project',
  'description': 'project',
  'title': 'project',
  
  // Budget/cost variations
  'estimated cost': 'estimate',
  'estimatedcost': 'estimate',
  'budget': 'estimate',
  'approved budget': 'approvedbudget',
  'total budget': 'approvedbudget',
  'base bid plus alts': 'basebid',
  'basebidplusalts': 'basebid',
  'base bid': 'basebid',
  
  // Funding variations
  'funding source': 'fundingsource',
  'fundingsource': 'fundingsource',
  'fund': 'fundingsource',
  'source': 'fundingsource',
  
  // Actual cost variations
  'actual cost': 'actualcost',
  'actualcost': 'actualcost',
  'actuals': 'actualcost',
  'spent': 'actualcost',
  
  // Variance
  'variance': 'variance',
  'difference': 'variance',
  'remaining': 'variance',
  
  // Notes
  'notes': 'notes',
  'comments': 'notes',
  'memo': 'notes',
  'remarks': 'notes',
  
  // Links
  'links': 'links',
  'urls': 'links',
  'attachments': 'links',
  
  // Date variations
  'completion': 'completion',
  'completion date': 'completion',
  'completiondate': 'completion',
  'date': 'completion',
  'estimated date': 'estimateddate',
  
  // Energy Efficiency specific
  'funded?': 'funded',
  'funded': 'funded',
  'is funded': 'funded',
};

/**
 * Normalize a single header name
 */
export function normalizeHeader(header: string): string {
  // Trim and lowercase
  const normalized = header.trim().toLowerCase();
  
  // Check for direct alias match
  if (HEADER_ALIASES[normalized]) {
    return HEADER_ALIASES[normalized];
  }
  
  // Remove special characters and extra spaces
  const cleaned = normalized
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[_-]/g, ''); // Remove underscores and hyphens
  
  // Check cleaned version
  if (HEADER_ALIASES[cleaned]) {
    return HEADER_ALIASES[cleaned];
  }
  
  // Return cleaned version if no match
  return cleaned;
}

/**
 * Normalize all headers in an array
 */
export function normalizeHeaders(headers: string[]): string[] {
  return headers.map(normalizeHeader);
}

/**
 * Create a header mapping from original to normalized names
 */
export function createHeaderMap(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    map.set(normalized, index);
  });
  
  return map;
}

/**
 * Find column index by normalized header name
 */
export function findColumn(
  headers: string[],
  targetHeader: string
): number {
  const normalized = normalizeHeader(targetHeader);
  const headerMap = createHeaderMap(headers);
  
  return headerMap.get(normalized) ?? -1;
}

/**
 * Get value from row by header name (with normalization)
 */
export function getValueByHeader(
  headers: string[],
  row: string[],
  targetHeader: string
): string | undefined {
  const index = findColumn(headers, targetHeader);
  
  if (index === -1 || index >= row.length) {
    return undefined;
  }
  
  return row[index]?.trim();
}

/**
 * Validate that required headers exist
 */
export function validateRequiredHeaders(
  headers: string[],
  required: string[]
): { valid: boolean; missing: string[] } {
  const normalizedHeaders = normalizeHeaders(headers);
  const missing: string[] = [];
  
  for (const requiredHeader of required) {
    const normalized = normalizeHeader(requiredHeader);
    if (!normalizedHeaders.includes(normalized)) {
      missing.push(requiredHeader);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
