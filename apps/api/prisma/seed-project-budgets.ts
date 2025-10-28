import { PrismaClient } from '@prisma/client';
import { computeAllProjectBudgetFields } from '../src/services/projectBudgetCalculations';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding ProjectBudget data to existing projects...');

  // Get existing projects
  const projects = await prisma.project.findMany({
    where: {
      id: {
        in: [
          'project-2024bond-001', // Stadium ticket booth
          'project-2024bond-002', // Playground equipment  
        ]
      }
    }
  });

  if (projects.length === 0) {
    console.log('⚠️  No projects found. Run seed-realworld.ts first.');
    return;
  }

  // Project 1: Stadium ticket booth (EWHS)
  const stadium = projects.find(p => p.id === 'project-2024bond-001');
  if (stadium) {
    console.log(`Adding budget breakdown for: ${stadium.name}`);
    
    // Input values (from District-Wide format screenshot)
    const inputs = {
      approvedBudgetTotal: 60000.00,
      baseBidPlusAlts: 37410.00,
      changeOrdersTotal: 10000.00, // Construction Contingency
      salesTaxRatePercent: 10.6, // Sales Tax rate for Lynnwood
      cpoManagementRatePercent: 10.0,
      techMisc: 0, // A/E Fee
      consultants: 0,
    };

    // Compute all derived fields
    const computed = computeAllProjectBudgetFields(inputs);

    await prisma.projectBudget.create({
      data: {
        projectId: stadium.id,
        asOfDate: new Date('2025-01-14'),
        ...inputs,
        ...computed,
      },
    });

    console.log('✅ Created ProjectBudget for Stadium ticket booth');
    console.log(`   - Construction Cost Subtotal: $${computed.constructionCostSubtotal}`);
    console.log(`   - Total Project Cost: $${computed.totalProjectCost}`);
    console.log(`   - Remainder: $${computed.remainder}`);
  }

  // Project 2: Playground equipment (EWHS)
  const playground = projects.find(p => p.id === 'project-2024bond-002');
  if (playground) {
    console.log(`\nAdding budget breakdown for: ${playground.name}`);
    
    const inputs = {
      approvedBudgetTotal: 9219.03,
      baseBidPlusAlts: 6888.82,
      changeOrdersTotal: 688.88, // Construction Contingency (10%)
      salesTaxRatePercent: 10.6,
      cpoManagementRatePercent: 10.0,
      techMisc: 0,
      consultants: 0,
    };

    const computed = computeAllProjectBudgetFields(inputs);

    await prisma.projectBudget.create({
      data: {
        projectId: playground.id,
        asOfDate: new Date('2025-01-14'),
        ...inputs,
        ...computed,
      },
    });

    console.log('✅ Created ProjectBudget for Playground equipment');
    console.log(`   - Construction Cost Subtotal: $${computed.constructionCostSubtotal}`);
    console.log(`   - Total Project Cost: $${computed.totalProjectCost}`);
    console.log(`   - Remainder: $${computed.remainder}`);
  }

  console.log('\n✨ ProjectBudget seed data complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding project budgets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
