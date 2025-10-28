import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏗️ Adding AECC projects with budget breakdowns...');

  // Get organization and AECC facility
  const org = await prisma.organization.findFirst();
  if (!org) {
    throw new Error('No organization found. Please run seed-realworld.ts first.');
  }

  const aecc = await prisma.facility.findFirst({
    where: { code: 'AECC' },
  });

  if (!aecc) {
    throw new Error('AECC facility not found. Please run seed-all-facilities.ts first.');
  }

  // Get a project manager
  const pm = await prisma.user.findFirst({
    where: { role: 'PROJECT_MANAGER' },
  });

  if (!pm) {
    throw new Error('No project manager found.');
  }

  // Get funding source (using 2024 Levy as example)
  const fundingSource = await prisma.fundingSource.findFirst({
    where: { code: '2024-LEVY' },
  });

  if (!fundingSource) {
    throw new Error('No funding source found.');
  }

  console.log(`✓ Found AECC facility: ${aecc.name}`);
  console.log(`✓ Using PM: ${pm.name}`);
  console.log(`✓ Using funding: ${fundingSource.name}`);

  // Project 1: AECC Boiler
  console.log('\n📋 Creating AECC Boiler project...');
  const boilerProject = await prisma.project.upsert({
    where: { id: 'project-aecc-boiler' },
    update: {},
    create: {
      id: 'project-aecc-boiler',
      name: 'AECC Boiler',
      description: 'Boiler replacement and upgrade for AECC facility',
      priority: 10,
      type: 'MAJOR',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: 'CPO Estimate',
      jurisdiction: 'Lynnwood',
      facilityId: aecc.id,
      fundingSourceId: fundingSource.id,
      projectManagerId: pm.id,
      organizationId: org.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-12-31'),
    },
  });

  // Create ProjectBudget for AECC Boiler
  const existingBoilerBudget = await prisma.projectBudget.findFirst({
    where: { projectId: boilerProject.id },
  });

  if (!existingBoilerBudget) {
    await prisma.projectBudget.create({
      data: {
        projectId: boilerProject.id,
        
        // Total Approved Budget
        approvedBudgetTotal: 500000.00,
        
        // Construction Costs
        baseBidPlusAlts: 250000.00,
        changeOrdersTotal: 25000.00, // Using this for contingency
        salesTaxRatePercent: 10.4,
        
        // CPO Management
        cpoManagementRatePercent: 7.0,
        
        // Consultants (includes all other costs)
        consultants: 169752.00, // Other Cost Subtotal from spreadsheet
      },
    });
  }

  // Create ProjectEstimate for AECC Boiler
  const existingBoilerEstimate = await prisma.projectEstimate.findFirst({
    where: { 
      projectId: boilerProject.id,
      estimateType: 'CPO_ESTIMATE',
    },
  });

  if (!existingBoilerEstimate) {
    await prisma.projectEstimate.create({
      data: {
        projectId: boilerProject.id,
        estimateType: 'CPO_ESTIMATE',
        estimatedCost: 473352.00, // Total Project Cost
        asOfDate: new Date('2024-10-18'),
        notes: JSON.stringify({
          baseBid: 250000.00,
          contingency: 25000.00,
          aeFee: 50000.00,
          designContingency: 17000.00,
          permit: 5000.00,
          commissioning: 10000.00,
          hazmat: 5000.00,
          abatement: 50000.00,
          tempHVAC: 5000.00,
          maintenance: 2500.00,
          custodial: 500.00,
          principalStipends: 3500.00,
        }),
      },
    });
  }

  console.log('✅ Created AECC Boiler project with budget breakdown');

  // Project 2: AECC Kitchen Code Corrections
  console.log('\n📋 Creating AECC Kitchen Code Corrections project...');
  const kitchenCodeProject = await prisma.project.upsert({
    where: { id: 'project-aecc-kitchen-code' },
    update: {},
    create: {
      id: 'project-aecc-kitchen-code',
      name: 'AECC Kitchen Code Corrections',
      description: 'Kitchen code compliance corrections and upgrades',
      priority: 11,
      type: 'SMALL_WORKS',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: 'CPO Estimate',
      jurisdiction: 'Lynnwood',
      facilityId: aecc.id,
      fundingSourceId: fundingSource.id,
      projectManagerId: pm.id,
      organizationId: org.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-12-31'),
    },
  });

  const existingKitchenCodeBudget = await prisma.projectBudget.findFirst({
    where: { projectId: kitchenCodeProject.id },
  });

  if (!existingKitchenCodeBudget) {
    await prisma.projectBudget.create({
      data: {
        projectId: kitchenCodeProject.id,
        
        approvedBudgetTotal: 300000.00,
        
        baseBidPlusAlts: 183000.00,
        changeOrdersTotal: 18300.00, // construction Reserve (10%)
        salesTaxRatePercent: 10.5,
        
        cpoManagementRatePercent: 10.0,
        
        consultants: 48500.00, // Design + FFE + Permit + Maintenance + Custodial
        techMisc: 2500.00, // Design Contingency
      },
    });
  }

  const existingKitchenCodeEstimate = await prisma.projectEstimate.findFirst({
    where: { 
      projectId: kitchenCodeProject.id,
      estimateType: 'CPO_ESTIMATE',
    },
  });

  if (!existingKitchenCodeEstimate) {
    await prisma.projectEstimate.create({
      data: {
        projectId: kitchenCodeProject.id,
        estimateType: 'CPO_ESTIMATE',
        estimatedCost: 292958.72, // Total Project Cost
        asOfDate: new Date('2024-10-18'),
        notes: JSON.stringify({
          baseBid: 183000.00,
          constructionReserve: 18300.00,
          design: 25000.00,
          designContingency: 2500.00,
          ffe: 10000.00,
          permit: 5000.00,
          maintenance: 5000.00,
          custodial: 1000.00,
        }),
      },
    });
  }

  console.log('✅ Created AECC Kitchen Code Corrections project');

  // Project 3: AECC Kitchen
  console.log('\n📋 Creating AECC Kitchen project...');
  const kitchenProject = await prisma.project.upsert({
    where: { id: 'project-aecc-kitchen' },
    update: {},
    create: {
      id: 'project-aecc-kitchen',
      name: 'AECC Kitchen',
      description: 'Kitchen upgrades and improvements',
      priority: 12,
      type: 'SMALL_WORKS',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: 'CPO Estimate',
      jurisdiction: 'Lynnwood',
      facilityId: aecc.id,
      fundingSourceId: fundingSource.id,
      projectManagerId: pm.id,
      organizationId: org.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-12-31'),
    },
  });

  const existingKitchenBudget = await prisma.projectBudget.findFirst({
    where: { projectId: kitchenProject.id },
  });

  if (!existingKitchenBudget) {
    await prisma.projectBudget.create({
      data: {
        projectId: kitchenProject.id,
        
        approvedBudgetTotal: 100000.00,
        
        baseBidPlusAlts: 37087.00,
        changeOrdersTotal: 3708.70, // construction Reserve (10%)
        salesTaxRatePercent: 10.5,
        
        cpoManagementRatePercent: 10.0,
        
        consultants: 22000.00, // Design + Washer/Dryer + Fencing + Maintenance + Custodial
        techMisc: 500.00, // Design Contingency
      },
    });
  }

  const existingKitchenEstimate = await prisma.projectEstimate.findFirst({
    where: { 
      projectId: kitchenProject.id,
      estimateType: 'CPO_ESTIMATE',
    },
  });

  if (!existingKitchenEstimate) {
    await prisma.projectEstimate.create({
      data: {
        projectId: kitchenProject.id,
        estimateType: 'CPO_ESTIMATE',
        estimatedCost: 72087.17, // Total Project Cost
        asOfDate: new Date('2024-10-18'),
        notes: JSON.stringify({
          baseBid: 37087.00,
          constructionReserve: 3708.70,
          design: 5500.00,
          designContingency: 500.00,
          washerDryerMove: 10000.00,
          fencing: 5000.00,
          maintenance: 1000.00,
          custodial: 500.00,
        }),
      },
    });
  }

  console.log('✅ Created AECC Kitchen project');

  console.log('\n🎉 All AECC projects created successfully!');
  console.log('   - AECC Boiler ($500K budget)');
  console.log('   - AECC Kitchen Code Corrections ($300K budget)');
  console.log('   - AECC Kitchen ($100K budget)');
  console.log('\n💡 These projects will now appear in the facility view and budget breakdown pages.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
