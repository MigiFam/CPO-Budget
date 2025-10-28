import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed with real-world data from Small Works Master Budget...');

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Edmonds School District - Capital Projects Office',
      address: '20420 68th Ave W, Lynnwood, WA 98036',
    },
  });
  console.log('✅ Organization created:', org.name);

  // Create demo users
  const passwordHash = await bcrypt.hash('Demo!Pass1', 10);

  const director = await prisma.user.upsert({
    where: { email: 'director@cpo.app' },
    update: {},
    create: {
      email: 'director@cpo.app',
      name: 'Alice Director',
      passwordHash,
      role: 'DIRECTOR',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const finance = await prisma.user.upsert({
    where: { email: 'finance@cpo.app' },
    update: {},
    create: {
      email: 'finance@cpo.app',
      name: 'Bob Finance Manager',
      passwordHash,
      role: 'FINANCE',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const pm1 = await prisma.user.upsert({
    where: { email: 'pm1@cpo.app' },
    update: {},
    create: {
      email: 'pm1@cpo.app',
      name: 'Carol Project Manager',
      passwordHash,
      role: 'PROJECT_MANAGER',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const pm2 = await prisma.user.upsert({
    where: { email: 'pm2@cpo.app' },
    update: {},
    create: {
      email: 'pm2@cpo.app',
      name: 'David Project Manager',
      passwordHash,
      role: 'PROJECT_MANAGER',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const team1 = await prisma.user.upsert({
    where: { email: 'team1@cpo.app' },
    update: {},
    create: {
      email: 'team1@cpo.app',
      name: 'Eve Team Member',
      passwordHash,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const contractor = await prisma.user.upsert({
    where: { email: 'contractor@cpo.app' },
    update: {},
    create: {
      email: 'contractor@cpo.app',
      name: 'George Contractor',
      passwordHash,
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@cpo.app' },
    update: {},
    create: {
      email: 'auditor@cpo.app',
      name: 'Helen Auditor',
      passwordHash,
      role: 'AUDITOR',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  console.log('✅ Created 7 users with password: Demo!Pass1');

  // Create facilities with real codes and jurisdictions from CSV
  const facilities = await Promise.all([
    prisma.facility.upsert({
      where: { id: 'facility-ewh' },
      update: {},
      create: {
        id: 'facility-ewh',
        name: 'Edmonds-Woodway High School',
        code: 'EWH',
        type: 'SCHOOL',
        region: 'Edmonds',
        jurisdiction: 'Edmonds',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-mdh' },
      update: {},
      create: {
        id: 'facility-mdh',
        name: 'Meadowdale High School',
        code: 'MDH',
        type: 'SCHOOL',
        region: 'Lynnwood',
        jurisdiction: 'Lynnwood',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-lwh' },
      update: {},
      create: {
        id: 'facility-lwh',
        name: 'Lynnwood High School',
        code: 'LWH',
        type: 'SCHOOL',
        region: 'Lynnwood',
        jurisdiction: 'Lynnwood',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-hwe' },
      update: {},
      create: {
        id: 'facility-hwe',
        name: 'Hazel Wood Elementary',
        code: 'HWE',
        type: 'SCHOOL',
        region: 'Brier',
        jurisdiction: 'Sno. Co.',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-swe' },
      update: {},
      create: {
        id: 'facility-swe',
        name: 'Sherwood Elementary',
        code: 'SWE',
        type: 'SCHOOL',
        region: 'Edmonds',
        jurisdiction: 'Edmonds',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-tpe' },
      update: {},
      create: {
        id: 'facility-tpe',
        name: 'Terrace Park Elementary',
        code: 'TPE',
        type: 'SCHOOL',
        region: 'Mt. Lake Terrace',
        jurisdiction: 'Mt. Lake Terrace',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-mwk' },
      update: {},
      create: {
        id: 'facility-mwk',
        name: 'Mountlake Terrace K-8',
        code: 'MW K-8',
        type: 'SCHOOL',
        region: 'Edmonds',
        jurisdiction: 'Edmonds',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-aecc' },
      update: {},
      create: {
        id: 'facility-aecc',
        name: 'Administrative & Education Center',
        code: 'AECC',
        type: 'ADMINISTRATIVE',
        region: 'Lynnwood',
        jurisdiction: 'Sno. Co.',
        organizationId: org.id,
      },
    }),
    prisma.facility.upsert({
      where: { id: 'facility-varies' },
      update: {},
      create: {
        id: 'facility-varies',
        name: 'Multiple Facilities',
        code: 'Varies',
        type: 'OTHER',
        region: 'District-wide',
        jurisdiction: 'Varies',
        organizationId: org.id,
      },
    }),
  ]);

  console.log('✅ Created', facilities.length, 'facilities');

  // Create funding sources from real data
  const bond2024 = await prisma.fundingSource.upsert({
    where: { id: 'funding-2024-bond' },
    update: {},
    create: {
      id: 'funding-2024-bond',
      name: '2024 Bond',
      code: '2024-BOND',
      type: 'BOND',
      year: 2024,
      totalAllocation: 35000000.00,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2029-12-31'),
      organizationId: org.id,
    },
  });

  const levy2024 = await prisma.fundingSource.upsert({
    where: { id: 'funding-2024-levy' },
    update: {},
    create: {
      id: 'funding-2024-levy',
      name: '2024 Levy',
      code: '2024-LEVY',
      type: 'LEVY',
      year: 2024,
      totalAllocation: 40000000.00,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2029-12-31'),
      organizationId: org.id,
    },
  });

  const levy2021 = await prisma.fundingSource.upsert({
    where: { id: 'funding-2021-levy' },
    update: {},
    create: {
      id: 'funding-2021-levy',
      name: '2021 Levy',
      code: '2021-LEVY',
      type: 'LEVY',
      year: 2021,
      totalAllocation: 65000000.00,
      startDate: new Date('2021-01-01'),
      endDate: new Date('2029-12-31'),
      organizationId: org.id,
    },
  });

  const levy2020 = await prisma.fundingSource.upsert({
    where: { id: 'funding-2020-levy' },
    update: {},
    create: {
      id: 'funding-2020-levy',
      name: '2020 Levy',
      code: '2020-LEVY',
      type: 'LEVY',
      year: 2020,
      totalAllocation: 34870000.00,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2026-12-31'),
      organizationId: org.id,
    },
  });

  console.log('✅ Created 4 funding sources (Total: $174.87M)');

  // Create real projects from 2024 Bond CSV data
  const project001 = await prisma.project.upsert({
    where: { id: 'project-2024bond-001' },
    update: {},
    create: {
      id: 'project-2024bond-001',
      name: 'Stadium ticket booth / gates',
      description: 'Upgrade stadium ticket booth and entry gates with modern access control',
      priority: 1,
      type: 'SMALL_WORKS',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: '1/14/2025 est',
      jurisdiction: 'Lynnwood',
      facilityId: facilities[0].id, // EWH
      fundingSourceId: bond2024.id,
      projectManagerId: pm1.id,
      organizationId: org.id,
      startDate: new Date('2024-10-01'),
      endDate: new Date('2025-01-14'),
    },
  });

  await prisma.budget.create({
    data: {
      projectId: project001.id,
      version: 'current',
      levyAllocation: 250000.00,
      boardApprovedBudget: 60000.00,
      mostCurrentEstimate: 57679.01,
      baselineAmount: 60000.00,
      revisedAmount: 60000.00,
      actualsToDate: 57679.01,
      variance: 2320.99,
      boardBudgetRemainder: 2320.99,
      levyAllocationRemainder: 190000.00,
    },
  });

  const project002 = await prisma.project.upsert({
    where: { id: 'project-2024bond-002' },
    update: {},
    create: {
      id: 'project-2024bond-002',
      name: 'Playground equipment',
      description: 'Replace aging playground equipment with modern, ADA-compliant structures',
      priority: 2,
      type: 'SMALL_WORKS',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: '9/10/2025 Final',
      jurisdiction: 'Sno. Co.',
      facilityId: facilities[3].id, // HWE
      fundingSourceId: bond2024.id,
      projectManagerId: pm2.id,
      organizationId: org.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-09-10'),
    },
  });

  await prisma.budget.create({
    data: {
      projectId: project002.id,
      version: 'current',
      levyAllocation: 350000.00,
      boardApprovedBudget: 750000.00,
      mostCurrentEstimate: 666762.46,
      baselineAmount: 750000.00,
      revisedAmount: 750000.00,
      actualsToDate: 666762.46,
      variance: 83237.54,
      boardBudgetRemainder: 83237.54,
      levyAllocationRemainder: -400000.00, // Over allocation
    },
  });

  const project003 = await prisma.project.upsert({
    where: { id: 'project-2024bond-003' },
    update: {},
    create: {
      id: 'project-2024bond-003',
      name: 'Intercoms - District-wide',
      description: 'Upgrade intercom systems across multiple facilities for improved emergency communication',
      priority: 3,
      type: 'SMALL_WORKS',
      status: 'PLANNED',
      completionYear: 2025,
      estimatedDate: 'Ref',
      jurisdiction: 'Varies',
      facilityId: facilities[8].id, // Varies
      fundingSourceId: bond2024.id,
      projectManagerId: pm1.id,
      organizationId: org.id,
      startDate: new Date('2025-01-01'),
    },
  });

  await prisma.budget.create({
    data: {
      projectId: project003.id,
      version: 'current',
      levyAllocation: 1500000.00,
      boardApprovedBudget: 0.00,
      mostCurrentEstimate: 0.00,
      baselineAmount: 1500000.00,
      revisedAmount: 1500000.00,
      actualsToDate: 0.00,
      variance: 1500000.00,
      boardBudgetRemainder: 0.00,
      levyAllocationRemainder: 1500000.00,
    },
  });

  const project004 = await prisma.project.upsert({
    where: { id: 'project-2024bond-004' },
    update: {},
    create: {
      id: 'project-2024bond-004',
      name: 'LED Lighting Retrofit - District-wide',
      description: 'Convert traditional lighting to energy-efficient LED systems. Includes change orders for LWH + EWH.',
      priority: 4,
      type: 'MAJOR',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: 'change orders',
      jurisdiction: 'Varies',
      notes: 'LWH + EWH (12/16)',
      facilityId: facilities[8].id, // Varies
      fundingSourceId: bond2024.id,
      projectManagerId: pm2.id,
      organizationId: org.id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-12-16'),
    },
  });

  await prisma.budget.create({
    data: {
      projectId: project004.id,
      version: 'current',
      levyAllocation: 3250000.00,
      boardApprovedBudget: 4000000.00,
      mostCurrentEstimate: 2746256.73,
      baselineAmount: 4000000.00,
      revisedAmount: 4000000.00,
      actualsToDate: 2746256.73,
      committedToDate: 2746256.73,
      variance: 1253743.27,
      boardBudgetRemainder: 1253743.27,
      levyAllocationRemainder: -750000.00, // Over allocation
    },
  });

  // 2024 Levy projects
  const project005 = await prisma.project.upsert({
    where: { id: 'project-2024levy-001' },
    update: {},
    create: {
      id: 'project-2024levy-001',
      name: 'Baseball Turf - Meadowdale',
      description: 'Install synthetic turf on baseball field for year-round use',
      priority: 4,
      type: 'MAJOR',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: 'CPO Estimate',
      jurisdiction: 'Lynnwood',
      facilityId: facilities[1].id, // MDH
      fundingSourceId: levy2024.id,
      projectManagerId: pm1.id,
      organizationId: org.id,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-10-01'),
    },
  });

  await prisma.budget.create({
    data: {
      projectId: project005.id,
      version: 'current',
      levyAllocation: 2500000.00,
      boardApprovedBudget: 8750000.00, // Combined with softball
      mostCurrentEstimate: 9288992.58,
      baselineAmount: 8750000.00,
      revisedAmount: 8750000.00,
      actualsToDate: 9288992.58,
      variance: -538992.58, // Over budget
      boardBudgetRemainder: -538992.58,
      levyAllocationRemainder: -3750000.00,
    },
  });

  // 2021 Levy projects
  const project006 = await prisma.project.upsert({
    where: { id: 'project-2021levy-001' },
    update: {},
    create: {
      id: 'project-2021levy-001',
      name: 'Multipurpose Field - EWH',
      description: 'New multipurpose synthetic turf field for multiple sports and activities',
      priority: 20,
      type: 'MAJOR',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: '11/15/2024 est',
      jurisdiction: 'Lynnwood',
      facilityId: facilities[0].id, // EWH
      fundingSourceId: levy2021.id,
      projectManagerId: pm2.id,
      organizationId: org.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-11-15'),
    },
  });

  await prisma.budget.create({
    data: {
      projectId: project006.id,
      version: 'current',
      levyAllocation: 7500000.00,
      boardApprovedBudget: 7500000.00,
      mostCurrentEstimate: 6496487.25,
      baselineAmount: 7500000.00,
      revisedAmount: 7500000.00,
      actualsToDate: 6496487.25,
      committedToDate: 6496487.25,
      variance: 1003512.75,
      boardBudgetRemainder: 1003512.75,
      levyAllocationRemainder: 0.00,
    },
  });

  const project007 = await prisma.project.upsert({
    where: { id: 'project-2021levy-002' },
    update: {},
    create: {
      id: 'project-2021levy-002',
      name: 'HVAC System - MTH',
      description: 'Complete HVAC system replacement for climate control and clean buildings act compliance',
      priority: 22,
      type: 'MAJOR',
      status: 'ACTIVE',
      completionYear: 2025,
      estimatedDate: 'Ref',
      jurisdiction: 'Mt. Lake Terrace',
      notes: 'from MTH DB budget W added funds',
      facilityId: facilities[5].id, // TPE (using as proxy for MTH)
      fundingSourceId: levy2021.id,
      projectManagerId: pm1.id,
      organizationId: org.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
    },
  });

  await prisma.budget.create({
    data: {
      projectId: project007.id,
      version: 'current',
      levyAllocation: 10000000.00,
      boardApprovedBudget: 15000000.00,
      mostCurrentEstimate: 16300000.00,
      baselineAmount: 15000000.00,
      revisedAmount: 16300000.00,
      actualsToDate: 16300000.00,
      committedToDate: 16300000.00,
      variance: -1300000.00, // Over budget
      boardBudgetRemainder: -1300000.00,
      levyAllocationRemainder: -5000000.00,
    },
  });

  console.log('✅ Created 7 projects with realistic budget data');

  // Create budget lines for project 001
  const budget001 = await prisma.budget.findFirst({ where: { projectId: project001.id } });
  if (budget001) {
    await prisma.budgetLine.createMany({
      data: [
        {
          budgetId: budget001.id,
          costCode: '001-DESIGN',
          category: 'DESIGN',
          description: 'Architectural and engineering design',
          baseline: 8000.00,
          committed: 7500.00,
          actuals: 7500.00,
          variance: 500.00,
        },
        {
          budgetId: budget001.id,
          costCode: '001-LABOR',
          category: 'LABOR',
          description: 'Construction labor and installation',
          baseline: 30000.00,
          committed: 28179.01,
          actuals: 28179.01,
          variance: 1820.99,
        },
        {
          budgetId: budget001.id,
          costCode: '001-MATRL',
          category: 'MATERIALS',
          description: 'Construction materials',
          baseline: 15000.00,
          committed: 15000.00,
          actuals: 15000.00,
          variance: 0.00,
        },
        {
          budgetId: budget001.id,
          costCode: '001-EQUIP',
          category: 'EQUIPMENT',
          description: 'Turnstiles and electronic access control equipment',
          baseline: 5000.00,
          committed: 5000.00,
          actuals: 5000.00,
          variance: 0.00,
        },
        {
          budgetId: budget001.id,
          costCode: '001-CONT',
          category: 'CONTINGENCY',
          description: 'Project contingency',
          baseline: 2000.00,
          committed: 0.00,
          actuals: 0.00,
          variance: 2000.00,
        },
      ],
    });
  }

  console.log('✅ Created budget lines for project 001');

  // Create teams
  await prisma.team.create({
    data: {
      name: 'Project 001 Team',
      projectId: project001.id,
      members: {
        create: [
          { userId: pm1.id, roleOnTeam: 'Project Manager' },
          { userId: team1.id, roleOnTeam: 'Team Member' },
        ],
      },
    },
  });

  await prisma.team.create({
    data: {
      name: 'LED Retrofit Team',
      projectId: project004.id,
      members: {
        create: [
          { userId: pm2.id, roleOnTeam: 'Project Manager' },
          { userId: team1.id, roleOnTeam: 'Team Member' },
          { userId: contractor.id, roleOnTeam: 'Electrical Contractor' },
        ],
      },
    },
  });

  console.log('✅ Created 2 teams');

  console.log('');
  console.log('🎉 Seed complete! Real-world data loaded:');
  console.log('   - 1 organization (Edmonds School District)');
  console.log('   - 7 users (all password: Demo!Pass1)');
  console.log('   - 9 facilities (EWH, MDH, LWH, HWE, SWE, TPE, MW K-8, AECC, Varies)');
  console.log('   - 4 funding sources ($174.87M total)');
  console.log('   - 7 projects ($44.3M in board approved budgets)');
  console.log('   - Multiple budget versions with levy allocations');
  console.log('   - Budget lines with cost codes');
  console.log('   - 2 teams with members');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   director@cpo.app / Demo!Pass1 (sees all projects)');
  console.log('   finance@cpo.app / Demo!Pass1');
  console.log('   pm1@cpo.app / Demo!Pass1 (assigned to projects 001, 003, 005, 007)');
  console.log('   pm2@cpo.app / Demo!Pass1 (assigned to projects 002, 004, 006)');
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
