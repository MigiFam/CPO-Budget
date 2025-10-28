import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Round to 2 decimal places */
function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/** Sanitize currency strings - remove $, commas, spaces */
function sanitizeCurrency(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  
  const cleaned = String(value)
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();
  
  // Handle accounting format: (1000) = -1000
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.replace(/[()]/g, '')) || null;
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/** Sanitize percentage strings - remove % sign */
function sanitizePercent(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  
  const cleaned = String(value)
    .replace(/%/g, '')
    .replace(/\s/g, '')
    .trim();
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// ============================================================================
// BUDGET CALCULATION FORMULAS (Mirror Excel)
// ============================================================================

/**
 * Calculate Construction Cost Subtotal
 * Formula: baseBidPlusAlts + changeOrdersTotal + round(baseBidPlusAlts * (salesTaxRatePercent/100), 2)
 */
function calcConstructionCostSubtotal(
  baseBidPlusAlts?: number | null,
  changeOrdersTotal?: number | null,
  salesTaxRatePercent?: number | null
): number {
  const base = baseBidPlusAlts ?? 0;
  const changeOrders = changeOrdersTotal ?? 0;
  const taxRate = salesTaxRatePercent ?? 0;
  
  const salesTaxAmount = round2(base * (taxRate / 100));
  return round2(base + changeOrders + salesTaxAmount);
}

/**
 * Calculate Other Cost Subtotal
 * Formula: round(constructionCostSubtotal * (cpoManagementRatePercent/100), 2) + techMisc + consultants
 */
function calcOtherCostSubtotal(
  constructionCostSubtotal?: number | null,
  cpoManagementRatePercent?: number | null,
  techMisc?: number | null,
  consultants?: number | null
): number {
  const cc = constructionCostSubtotal ?? 0;
  const mgrRate = cpoManagementRatePercent ?? 0;
  
  const cpoManagementAmount = round2(cc * (mgrRate / 100));
  return round2(cpoManagementAmount + (techMisc ?? 0) + (consultants ?? 0));
}

/**
 * Calculate Total Project Cost
 * Formula: constructionCostSubtotal + otherCostSubtotal
 */
function calcTotalProjectCost(
  constructionCostSubtotal: number,
  otherCostSubtotal: number
): number {
  return round2(constructionCostSubtotal + otherCostSubtotal);
}

/**
 * Calculate Remainder
 * Formula: approvedBudgetTotal - totalProjectCost
 */
function calcRemainder(
  approvedBudgetTotal?: number | null,
  totalProjectCost?: number | null
): number {
  return round2((approvedBudgetTotal ?? 0) - (totalProjectCost ?? 0));
}

/**
 * Calculate Variance (for Small Works snapshots)
 * Formula: estimatedCost - actualCost
 */
function calcVariance(
  estimatedCost?: number | null,
  actualCost?: number | null
): number | null {
  if (estimatedCost == null || actualCost == null) return null;
  return round2(estimatedCost - actualCost);
}

// ============================================================================
// SEED FUNCTION
// ============================================================================

interface SeedSummary {
  facilities: { created: number; updated: number };
  projects: { created: number; updated: number };
  budgets: { created: number; updated: number };
  estimates: { created: number; updated: number };
  attachments: { created: number; updated: number };
}

export async function seedFromEmbedded(seedPath?: string): Promise<SeedSummary> {
  const filePath = seedPath || process.env.SEED_PATH || path.join(__dirname, '..', 'data', 'seed_bundle.json');
  
  console.log(`📦 Loading seed data from: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file not found: ${filePath}`);
  }
  
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  
  const summary: SeedSummary = {
    facilities: { created: 0, updated: 0 },
    projects: { created: 0, updated: 0 },
    budgets: { created: 0, updated: 0 },
    estimates: { created: 0, updated: 0 },
    attachments: { created: 0, updated: 0 },
  };
  
  // Get organization (required for facilities)
  const org = await prisma.organization.findFirst();
  if (!org) {
    throw new Error('No organization found. Please run seed-realworld.ts first.');
  }
  
  console.log(`🏢 Using organization: ${org.name}\n`);
  
  // ============================================================================
  // 1. UPSERT FACILITIES
  // ============================================================================
  console.log('🏫 Upserting Facilities...');
  const facilityIdByCode = new Map<string, string>();
  
  for (const f of (data.facilities || []) as any[]) {
    if (!f.code) {
      console.warn(`⚠️  Skipping facility with no code:`, f);
      continue;
    }
    
    const existing = await prisma.facility.findFirst({
      where: { 
        code: f.code,
        organizationId: org.id,
      },
    });
    
    const facilityData = {
      code: f.code,
      name: f.name || f.code,
      organizationId: org.id,
      jurisdiction: f.jurisdiction || null,
      type: (f.type as any) || 'SCHOOL',
      region: f.region || null,
    };
    
    if (existing) {
      const updated = await prisma.facility.update({
        where: { id: existing.id },
        data: facilityData,
        select: { id: true, code: true },
      });
      facilityIdByCode.set(updated.code, updated.id);
      summary.facilities.updated++;
    } else {
      const created = await prisma.facility.create({
        data: facilityData,
        select: { id: true, code: true },
      });
      facilityIdByCode.set(created.code, created.id);
      summary.facilities.created++;
    }
  }
  
  console.log(`   ✅ Created: ${summary.facilities.created}, Updated: ${summary.facilities.updated}\n`);
  
  // ============================================================================
  // 2. UPSERT PROJECTS
  // ============================================================================
  console.log('🏗️  Upserting Projects...');
  const projectIdByImportKey = new Map<string, string>();
  
  // Get default project manager
  const defaultPM = await prisma.user.findFirst({
    where: { role: 'PROJECT_MANAGER' },
  });
  
  if (!defaultPM) {
    throw new Error('No project manager found in database.');
  }
  
  // Get default funding source
  const defaultFunding = await prisma.fundingSource.findFirst();
  
  if (!defaultFunding) {
    throw new Error('No funding source found in database.');
  }
  
  for (const p of (data.projects || []) as any[]) {
    if (!p.importKey) {
      console.warn(`⚠️  Skipping project with no importKey:`, p);
      continue;
    }
    
    if (!p.title || !p.facilityCode) {
      console.warn(`⚠️  Skipping project missing title or facilityCode:`, p);
      continue;
    }
    
    const facilityId = facilityIdByCode.get(p.facilityCode);
    if (!facilityId) {
      console.warn(`⚠️  Facility not found for code ${p.facilityCode}, skipping project: ${p.title}`);
      continue;
    }
    
    const existing = await prisma.project.findFirst({
      where: { importKey: p.importKey },
    });
    
    const projectData = {
      importKey: p.importKey,
      facilityId,
      name: p.title,
      description: p.notes || `${p.title} - ${p.category || 'General'}`,
      category: p.category || null,
      priority: p.priorityCode ? parseInt(String(p.priorityCode)) : 50,
      status: (p.status as any) || 'ACTIVE',
      type: p.category === 'SMALL_WORKS' ? 'SMALL_WORKS' : 'MAJOR',
      fundingSourceId: defaultFunding.id,
      projectManagerId: defaultPM.id,
      organizationId: org.id,
      completionYear: new Date().getFullYear(),
      estimatedDate: 'Imported',
      jurisdiction: p.jurisdiction || null,
      notes: p.notes || null,
    };
    
    if (existing) {
      const updated = await prisma.project.update({
        where: { id: existing.id },
        data: projectData,
        select: { id: true, importKey: true },
      });
      projectIdByImportKey.set(updated.importKey!, updated.id);
      summary.projects.updated++;
    } else {
      const created = await prisma.project.create({
        data: projectData,
        select: { id: true, importKey: true },
      });
      projectIdByImportKey.set(created.importKey!, created.id);
      summary.projects.created++;
    }
  }
  
  console.log(`   ✅ Created: ${summary.projects.created}, Updated: ${summary.projects.updated}\n`);
  
  // ============================================================================
  // 3. UPSERT BUDGETS (with derived calculations)
  // ============================================================================
  console.log('💰 Upserting Budgets with calculated fields...');
  
  for (const b of (data.budgets || []) as any[]) {
    if (!b.projectImportKey) {
      console.warn(`⚠️  Skipping budget with no projectImportKey:`, b);
      continue;
    }
    
    const projectId = projectIdByImportKey.get(b.projectImportKey);
    if (!projectId) {
      console.warn(`⚠️  Project not found for importKey ${b.projectImportKey}, skipping budget`);
      continue;
    }
    
    // Get project and facility for tax rate fallback
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { facility: true },
    });
    
    // Sanitize inputs
    const approvedBudgetTotal = sanitizeCurrency(b.approvedBudgetTotal);
    const baseBidPlusAlts = sanitizeCurrency(b.baseBidPlusAlts);
    const changeOrdersTotal = sanitizeCurrency(b.changeOrdersTotal);
    const salesTaxRatePercent = sanitizePercent(b.salesTaxRatePercent) ?? (project?.facility as any)?.taxRatePercent ?? 0;
    const cpoManagementRatePercent = sanitizePercent(b.cpoManagementRatePercent);
    const techMisc = sanitizeCurrency(b.techMisc);
    const consultants = sanitizeCurrency(b.consultants);
    
    // Calculate derived fields using Excel formulas
    const constructionCostSubtotal = calcConstructionCostSubtotal(
      baseBidPlusAlts,
      changeOrdersTotal,
      salesTaxRatePercent
    );
    
    const otherCostSubtotal = calcOtherCostSubtotal(
      constructionCostSubtotal,
      cpoManagementRatePercent,
      techMisc,
      consultants
    );
    
    const totalProjectCost = calcTotalProjectCost(
      constructionCostSubtotal,
      otherCostSubtotal
    );
    
    const remainder = calcRemainder(approvedBudgetTotal, totalProjectCost);
    
    // Sales tax amount (calculated, not stored separately in our schema)
    const salesTaxAmount = round2((baseBidPlusAlts ?? 0) * ((salesTaxRatePercent ?? 0) / 100));
    
    // CPO Management amount (calculated)
    const cpoManagementAmount = round2(constructionCostSubtotal * ((cpoManagementRatePercent ?? 0) / 100));
    
    const budgetData = {
      projectId,
      asOfDate: b.asOfDate ? new Date(b.asOfDate) : new Date(),
      approvedBudgetTotal,
      baseBidPlusAlts,
      changeOrdersTotal,
      salesTaxRatePercent,
      cpoManagementRatePercent,
      techMisc,
      consultants,
      // Computed fields
      salesTaxAmount,
      constructionCostSubtotal,
      cpoManagementAmount,
      otherCostSubtotal,
      totalProjectCost,
      remainder,
    };
    
    // Check if budget exists for this project
    const existing = await prisma.projectBudget.findFirst({
      where: { projectId },
    });
    
    if (existing) {
      await prisma.projectBudget.update({
        where: { id: existing.id },
        data: budgetData,
      });
      summary.budgets.updated++;
    } else {
      await prisma.projectBudget.create({
        data: budgetData,
      });
      summary.budgets.created++;
    }
  }
  
  console.log(`   ✅ Created: ${summary.budgets.created}, Updated: ${summary.budgets.updated}\n`);
  
  // ============================================================================
  // 4. UPSERT ESTIMATES
  // ============================================================================
  console.log('📊 Upserting Estimates...');
  
  for (const e of (data.estimates || []) as any[]) {
    if (!e.projectImportKey || !e.estimateType) {
      console.warn(`⚠️  Skipping estimate missing projectImportKey or estimateType:`, e);
      continue;
    }
    
    const projectId = projectIdByImportKey.get(e.projectImportKey);
    if (!projectId) {
      console.warn(`⚠️  Project not found for importKey ${e.projectImportKey}, skipping estimate`);
      continue;
    }
    
    const estimatedCost = sanitizeCurrency(e.estimatedCost);
    
    const existing = await prisma.projectEstimate.findFirst({
      where: {
        projectId,
        estimateType: e.estimateType,
      },
    });
    
    const estimateData = {
      projectId,
      estimateType: e.estimateType,
      estimatedCost: estimatedCost ?? 0,
      asOfDate: e.asOfDate ? new Date(e.asOfDate) : new Date(),
      notes: e.notes || null,
    };
    
    if (existing) {
      await prisma.projectEstimate.update({
        where: { id: existing.id },
        data: estimateData,
      });
      summary.estimates.updated++;
    } else {
      await prisma.projectEstimate.create({
        data: estimateData,
      });
      summary.estimates.created++;
    }
  }
  
  console.log(`   ✅ Created: ${summary.estimates.created}, Updated: ${summary.estimates.updated}\n`);
  
  // ============================================================================
  // 5. UPSERT ATTACHMENTS
  // ============================================================================
  console.log('📎 Upserting Attachments...');
  
  for (const a of (data.attachments || []) as any[]) {
    if (!a.projectImportKey || !a.url) {
      console.warn(`⚠️  Skipping attachment missing projectImportKey or url:`, a);
      continue;
    }
    
    const projectId = projectIdByImportKey.get(a.projectImportKey);
    if (!projectId) {
      console.warn(`⚠️  Project not found for importKey ${a.projectImportKey}, skipping attachment`);
      continue;
    }
    
    const existing = await prisma.attachment.findFirst({
      where: {
        projectId,
        url: a.url,
      },
    });
    
    const attachmentData = {
      projectId,
      url: a.url,
      fileName: a.label || a.fileName || path.basename(a.url),
      fileSize: a.fileSize || null,
      fileType: a.fileType || null,
      uploadedById: defaultPM.id, // Use PM as uploader
    };
    
    if (existing) {
      await prisma.attachment.update({
        where: { id: existing.id },
        data: attachmentData,
      });
      summary.attachments.updated++;
    } else {
      await prisma.attachment.create({
        data: attachmentData,
      });
      summary.attachments.created++;
    }
  }
  
  console.log(`   ✅ Created: ${summary.attachments.created}, Updated: ${summary.attachments.updated}\n`);
  
  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 SEEDING COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Facilities:   ${summary.facilities.created} created, ${summary.facilities.updated} updated`);
  console.log(`Projects:     ${summary.projects.created} created, ${summary.projects.updated} updated`);
  console.log(`Budgets:      ${summary.budgets.created} created, ${summary.budgets.updated} updated`);
  console.log(`Estimates:    ${summary.estimates.created} created, ${summary.estimates.updated} updated`);
  console.log(`Attachments:  ${summary.attachments.created} created, ${summary.attachments.updated} updated`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  return summary;
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

async function main() {
  try {
    await seedFromEmbedded();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
