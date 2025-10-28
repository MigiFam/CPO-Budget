/**
 * Small Works CSV Parser
 * 
 * Parses the simplest CSV format with direct column mapping.
 * 
 * Expected Headers:
 * - Priority (or #, Pri)
 * - Location (or Site, Facility)
 * - Project (or Project Name, Description)
 * - Jurisdiction (handles "Juristiction" typo)
 * - Estimated Cost (or Budget, Estimate)
 * - Funding Source (or Fund, Source)
 * - Actual Cost (or Actuals, Spent)
 * - Variance (or Difference, Remaining)
 * - Notes (or Comments, Memo)
 * - Links (or URLs, Attachments)
 */

import {
  normalizeHeader,
  getValueByHeader,
  validateRequiredHeaders,
} from './utils/headerNormalizer';
import {
  sanitizeCurrency,
  sanitizeInteger,
  sanitizeYear,
} from './utils/numberSanitizer';
import { generateImportKeyWithPriority } from './utils/importKeyGenerator';

export interface SmallWorksRow {
  // Core fields
  importKey: string;
  category: string; // Always 'Small Works'
  priority: number | null;
  facilityCode: string;
  projectTitle: string;
  jurisdiction: string | null;
  
  // Budget fields
  estimatedCost: number | null;
  fundingSource: string | null;
  actualCost: number | null;
  variance: number | null;
  
  // Additional fields
  notes: string | null;
  links: string | null;
  completionYear: number | null;
  
  // Metadata
  rowNumber: number;
}

export interface SmallWorksParseResult {
  success: boolean;
  data: SmallWorksRow[];
  errors: Array<{ row: number; message: string }>;
  warnings: Array<{ row: number; message: string }>;
  summary: {
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    facilitiesFound: Set<string>;
  };
}

/**
 * Parse Small Works CSV data
 * 
 * @param csvData - Array of rows, first row is headers
 * @returns Parse result with data, errors, and summary
 */
export function parseSmallWorksCSV(csvData: string[][]): SmallWorksParseResult {
  const result: SmallWorksParseResult = {
    success: true,
    data: [],
    errors: [],
    warnings: [],
    summary: {
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
      totalEstimatedCost: 0,
      totalActualCost: 0,
      facilitiesFound: new Set(),
    },
  };

  if (csvData.length === 0) {
    result.success = false;
    result.errors.push({ row: 0, message: 'CSV file is empty' });
    return result;
  }

  // Extract headers
  const headers = csvData[0];
  
  // Validate required headers
  const validation = validateRequiredHeaders(headers, [
    'Priority',
    'Location',
    'Project',
  ]);

  if (!validation.valid) {
    result.success = false;
    result.errors.push({
      row: 0,
      message: `Missing required headers: ${validation.missing.join(', ')}`,
    });
    return result;
  }

  // Process data rows
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNumber = i + 1; // 1-indexed for user display
    
    result.summary.totalRows++;

    try {
      // Extract values
      const priorityStr = getValueByHeader(headers, row, 'Priority');
      const facilityCode = getValueByHeader(headers, row, 'Location') || '';
      const projectTitle = getValueByHeader(headers, row, 'Project') || '';
      const jurisdiction = getValueByHeader(headers, row, 'Jurisdiction') || null;
      const estimatedCostStr = getValueByHeader(headers, row, 'Estimated Cost');
      const fundingSource = getValueByHeader(headers, row, 'Funding Source') || null;
      const actualCostStr = getValueByHeader(headers, row, 'Actual Cost');
      const varianceStr = getValueByHeader(headers, row, 'Variance');
      const notes = getValueByHeader(headers, row, 'Notes') || null;
      const links = getValueByHeader(headers, row, 'Links') || null;

      // Validate required fields
      if (!facilityCode || !projectTitle) {
        result.errors.push({
          row: rowNumber,
          message: 'Missing facility code or project title',
        });
        result.summary.failedRows++;
        continue;
      }

      // Parse numeric fields
      const priority = sanitizeInteger(priorityStr);
      const estimatedCost = sanitizeCurrency(estimatedCostStr);
      const actualCost = sanitizeCurrency(actualCostStr);
      const variance = sanitizeCurrency(varianceStr);

      // Try to extract completion year from project title or notes
      let completionYear: number | null = null;
      const yearMatch = (projectTitle + ' ' + (notes || '')).match(/20\d{2}/);
      if (yearMatch) {
        completionYear = parseInt(yearMatch[0], 10);
      }

      // Generate import key
      const importKey = generateImportKeyWithPriority(
        'Small Works',
        facilityCode,
        projectTitle,
        priority !== null ? priority : undefined
      );

      // Create parsed row
      const parsedRow: SmallWorksRow = {
        importKey,
        category: 'Small Works',
        priority,
        facilityCode,
        projectTitle,
        jurisdiction,
        estimatedCost,
        fundingSource,
        actualCost,
        variance,
        notes,
        links,
        completionYear,
        rowNumber,
      };

      result.data.push(parsedRow);
      result.summary.successfulRows++;
      result.summary.facilitiesFound.add(facilityCode);

      // Update totals
      if (estimatedCost) {
        result.summary.totalEstimatedCost += estimatedCost;
      }
      if (actualCost) {
        result.summary.totalActualCost += actualCost;
      }

      // Warnings
      if (!estimatedCost) {
        result.warnings.push({
          row: rowNumber,
          message: 'Missing estimated cost',
        });
      }

    } catch (error) {
      result.errors.push({
        row: rowNumber,
        message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      result.summary.failedRows++;
    }
  }

  // Set overall success
  result.success = result.errors.length === 0;

  return result;
}

/**
 * Convert parsed Small Works row to Project creation data
 */
export function smallWorksRowToProject(row: SmallWorksRow, orgId: string) {
  return {
    importKey: row.importKey,
    name: row.projectTitle,
    category: row.category,
    priority: row.priority,
    jurisdiction: row.jurisdiction,
    notes: row.notes,
    completionYear: row.completionYear,
    organizationId: orgId,
    // These need to be resolved from facility code and funding source name
    // facilityId: (to be looked up)
    // fundingSourceId: (to be looked up)
  };
}

/**
 * Convert parsed Small Works row to ProjectEstimate creation data
 */
export function smallWorksRowToEstimate(row: SmallWorksRow, projectId: string) {
  if (!row.estimatedCost) return null;

  return {
    projectId,
    estimatedCost: row.estimatedCost,
    estimateType: 'SmallWorksEstimate',
    asOfDate: new Date(),
    notes: row.notes,
  };
}
