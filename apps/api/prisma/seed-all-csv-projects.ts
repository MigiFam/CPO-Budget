import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface ParsedProject {
  facilityCode: string;
  projectName: string;
  totalApprovedBudget: number;
  baseBid: number;
  contingency: number;
  salesTaxRate: number;
  cpoManagementRate: number;
  otherCosts: number;
  totalProjectCost: number;
  remainder: number;
  estimatedDate?: string;
}

function cleanCurrency(value: string | undefined): number {
  if (!value) return 0;
  // Remove $, commas, spaces, and handle negative values in parentheses
  const cleaned = value
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();
  
  // Handle accounting format: (1000) = -1000
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.replace(/[()]/g, '')) || 0;
  }
  
  return parseFloat(cleaned) || 0;
}

function extractPercentage(value: string): number {
  const match = value.match(/\(?([\d.]+)%?\)?/);
  return match ? parseFloat(match[1]) : 0;
}

function parseFacilityCSV(filePath: string, facilityCode: string): ParsedProject[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const projects: ParsedProject[] = [];
  let currentProject: Partial<ParsedProject> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === ',,,,,,,,,,,,,,,') {
      // Empty line indicates end of project
      if (currentProject && currentProject.projectName && (currentProject.totalApprovedBudget || 0) > 0) {
        projects.push(currentProject as ParsedProject);
      }
      currentProject = null;
      continue;
    }
    
    // Parse CSV properly handling quoted values
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim()); // Add last part
    
    const label = parts[0] || '';
    const mostCurrentValue = parts[1] || '';
    
    // Skip empty labels
    if (!label) continue;
    
    const labelLower = label.toLowerCase();
    
    // Detect project name - first non-budget line with content
    if (!currentProject && 
        !labelLower.includes('total approved') && 
        !labelLower.includes('base bid') &&
        !labelLower.includes('construction') &&
        !labelLower.includes('subtotal') &&
        !labelLower.includes('remainder') &&
        !labelLower.includes('most current') &&
        label.length > 3) {
      
      currentProject = {
        facilityCode,
        projectName: label,
        totalApprovedBudget: 0,
        baseBid: 0,
        contingency: 0,
        salesTaxRate: 0,
        cpoManagementRate: 0,
        otherCosts: 0,
        totalProjectCost: 0,
        remainder: 0,
      };
      continue;
    }
    
    if (!currentProject) continue;
    
    // Parse budget fields from "Most Current Budget" column
    if (labelLower.includes('total approved')) {
      currentProject.totalApprovedBudget = cleanCurrency(mostCurrentValue);
    } else if (labelLower.startsWith('base bid')) {
      currentProject.baseBid = cleanCurrency(mostCurrentValue);
    } else if (labelLower.includes('contingency') || 
               labelLower.includes('contigency') ||
               labelLower.includes('reserve')) {
      const contingencyValue = cleanCurrency(mostCurrentValue);
      if (contingencyValue > 0) {
        currentProject.contingency = (currentProject.contingency || 0) + contingencyValue;
      }
    } else if (labelLower.includes('sales tax')) {
      currentProject.salesTaxRate = extractPercentage(label);
    } else if (labelLower.includes('cpo management')) {
      currentProject.cpoManagementRate = extractPercentage(label);
    } else if (labelLower.includes('total project cost')) {
      currentProject.totalProjectCost = cleanCurrency(mostCurrentValue);
    } else if (labelLower.includes('remainder')) {
      currentProject.remainder = cleanCurrency(mostCurrentValue);
    } else if (labelLower.includes('most current date')) {
      currentProject.estimatedDate = mostCurrentValue;
    }
  }
  
  // Add last project if not already added
  if (currentProject && currentProject.projectName && (currentProject.totalApprovedBudget || 0) > 0) {
    projects.push(currentProject as ParsedProject);
  }
  
  return projects.filter(p => p.totalApprovedBudget > 0);
}

async function main() {
  console.log('🏗️ Parsing all CSV files and adding missing projects...\n');
  
  const org = await prisma.organization.findFirst();
  if (!org) {
    throw new Error('No organization found. Run seed-realworld.ts first.');
  }
  
  const pm = await prisma.user.findFirst({
    where: { role: 'PROJECT_MANAGER' },
  });
  
  if (!pm) {
    throw new Error('No project manager found.');
  }
  
  const fundingSource = await prisma.fundingSource.findFirst({
    where: { code: '2024-LEVY' },
  });
  
  if (!fundingSource) {
    throw new Error('No funding source found.');
  }
  
  // Get all facilities
  const facilities = await prisma.facility.findMany({
    where: { organizationId: org.id },
  });
  
  const facilityMap = new Map(facilities.map(f => [f.code, f]));
  
  // Find all CSV files
  const csvDir = path.join(__dirname, '..', '..', '..');
  const csvFiles = fs.readdirSync(csvDir)
    .filter(f => f.startsWith('Small Works Master Budget') && f.endsWith('.csv'));
  
  console.log(`📁 Found ${csvFiles.length} CSV files to process\n`);
  
  let totalProjectsAdded = 0;
  let totalProjectsSkipped = 0;
  
  for (const csvFile of csvFiles) {
    // Extract facility code from filename
    // Format: "Small Works Master Budget to Gilbert 2025.xlsx - CODE.csv"
    const match = csvFile.match(/- ([A-Z0-9]+)\.csv$/);
    if (!match) {
      console.log(`⚠️  Skipping ${csvFile} - cannot extract facility code`);
      continue;
    }
    
    const facilityCode = match[1];
    const facility = facilityMap.get(facilityCode);
    
    if (!facility) {
      console.log(`⚠️  Skipping ${facilityCode} - facility not found in database`);
      continue;
    }
    
    console.log(`\n📋 Processing ${facilityCode} - ${facility.name}...`);
    
    try {
      const filePath = path.join(csvDir, csvFile);
      const projects = parseFacilityCSV(filePath, facilityCode);
      
      console.log(`   Found ${projects.length} projects in CSV`);
      
      for (const proj of projects) {
        // Check if project already exists
        const existing = await prisma.project.findFirst({
          where: {
            name: proj.projectName,
            facilityId: facility.id,
          },
        });
        
        if (existing) {
          console.log(`   ⏭️  Skipping "${proj.projectName}" - already exists`);
          totalProjectsSkipped++;
          continue;
        }
        
        // Create project
        const projectId = `project-${facilityCode.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const project = await prisma.project.create({
          data: {
            id: projectId,
            name: proj.projectName,
            description: `${proj.projectName} at ${facility.name}`,
            priority: 50,
            type: proj.totalApprovedBudget > 250000 ? 'MAJOR' : 'SMALL_WORKS',
            status: 'ACTIVE',
            completionYear: 2025,
            estimatedDate: proj.estimatedDate || 'TBD',
            jurisdiction: facility.jurisdiction || 'Unknown',
            facilityId: facility.id,
            fundingSourceId: fundingSource.id,
            projectManagerId: pm.id,
            organizationId: org.id,
            startDate: new Date('2024-06-01'),
          },
        });
        
        // Create ProjectBudget
        await prisma.projectBudget.create({
          data: {
            projectId: project.id,
            approvedBudgetTotal: proj.totalApprovedBudget,
            baseBidPlusAlts: proj.baseBid,
            changeOrdersTotal: proj.contingency,
            salesTaxRatePercent: proj.salesTaxRate,
            cpoManagementRatePercent: proj.cpoManagementRate,
          },
        });
        
        // Create ProjectEstimate
        await prisma.projectEstimate.create({
          data: {
            projectId: project.id,
            estimateType: 'CPO_ESTIMATE',
            estimatedCost: proj.totalProjectCost,
            asOfDate: new Date(),
          },
        });
        
        console.log(`   ✅ Added "${proj.projectName}" ($${proj.totalApprovedBudget.toLocaleString()})`);
        totalProjectsAdded++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${csvFile}:`, error);
    }
  }
  
  console.log('\n\n🎉 CSV Import Complete!');
  console.log(`   ✅ Projects added: ${totalProjectsAdded}`);
  console.log(`   ⏭️  Projects skipped (already exist): ${totalProjectsSkipped}`);
  console.log(`   📊 Total projects processed: ${totalProjectsAdded + totalProjectsSkipped}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Import failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
