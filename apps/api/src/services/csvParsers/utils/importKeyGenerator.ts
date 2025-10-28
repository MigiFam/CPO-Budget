/**
 * Import Key Generator
 * 
 * Generates deterministic, unique keys for idempotent CSV imports.
 * Uses SHA256 hash of (category + facilityCode + projectTitle) to ensure:
 * - Same project always gets same key
 * - Different projects always get different keys
 * - Re-importing doesn't create duplicates
 */

import crypto from 'crypto';

/**
 * Generate SHA256 hash from input string
 */
function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Normalize text for consistent hashing
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove extra spaces
 * - Remove special characters
 */
function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s-]/g, ''); // Remove special characters except spaces and hyphens
}

/**
 * Generate import key for a project
 * 
 * @param category - CSV category: 'Small Works' | 'District Wide' | 'Energy Efficiency'
 * @param facilityCode - Facility abbreviation (e.g., 'EWHS', 'TAR')
 * @param projectTitle - Project name/title
 * @returns SHA256 hash string
 * 
 * @example
 * generateImportKey('Small Works', 'EWHS', 'Stadium ticket booth / gates')
 * // Returns: '7f9a8b...' (deterministic hash)
 */
export function generateImportKey(
  category: string,
  facilityCode: string,
  projectTitle: string
): string {
  // Normalize all inputs
  const normalizedCategory = normalizeText(category);
  const normalizedFacility = normalizeText(facilityCode);
  const normalizedTitle = normalizeText(projectTitle);
  
  // Create composite string
  const composite = `${normalizedCategory}|${normalizedFacility}|${normalizedTitle}`;
  
  // Generate hash
  return sha256(composite);
}

/**
 * Generate import key with optional priority
 * Useful for Small Works where priority number helps distinguish projects
 * 
 * @param category - CSV category
 * @param facilityCode - Facility abbreviation
 * @param projectTitle - Project name
 * @param priority - Optional priority number
 * @returns SHA256 hash string
 */
export function generateImportKeyWithPriority(
  category: string,
  facilityCode: string,
  projectTitle: string,
  priority?: number | string
): string {
  if (priority !== undefined && priority !== null && priority !== '') {
    const normalizedPriority = String(priority).trim().padStart(3, '0'); // Pad to 3 digits
    return generateImportKey(category, facilityCode, `${normalizedPriority}-${projectTitle}`);
  }
  
  return generateImportKey(category, facilityCode, projectTitle);
}

/**
 * Generate import key for batch processing
 * Returns map of projectTitle → importKey
 */
export function generateImportKeyBatch(
  category: string,
  projects: Array<{ facilityCode: string; projectTitle: string; priority?: number }>
): Map<string, string> {
  const map = new Map<string, string>();
  
  for (const project of projects) {
    const key = generateImportKeyWithPriority(
      category,
      project.facilityCode,
      project.projectTitle,
      project.priority
    );
    map.set(project.projectTitle, key);
  }
  
  return map;
}

/**
 * Validate import key format (should be 64-char hex string)
 */
export function isValidImportKey(key: string): boolean {
  return /^[a-f0-9]{64}$/.test(key);
}

/**
 * Generate short import key (first 16 characters of hash)
 * Useful for display/logging, but use full key for database
 */
export function generateShortImportKey(
  category: string,
  facilityCode: string,
  projectTitle: string
): string {
  const fullKey = generateImportKey(category, facilityCode, projectTitle);
  return fullKey.substring(0, 16);
}
