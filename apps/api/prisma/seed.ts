import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Capital Projects Office - Demo District',
      address: '123 Education Way, Demo City, ST 12345',
    },
  });
  console.log('✅ Organization created');

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
      name: 'Bob Finance',
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
      name: 'Carol PM',
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
      name: 'David PM',
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
      name: 'Eve TeamMember',
      passwordHash,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  const team2 = await prisma.user.upsert({
    where: { email: 'team2@cpo.app' },
    update: {},
    create: {
      email: 'team2@cpo.app',
      name: 'Frank TeamMember',
      passwordHash,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'contractor@cpo.app' },
    update: {},
    create: {
      email: 'contractor@cpo.app',
      name: 'Grace Contractor',
      passwordHash,
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'auditor@cpo.app' },
    update: {},
    create: {
      email: 'auditor@cpo.app',
      name: 'Henry Auditor',
      passwordHash,
      role: 'AUDITOR',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  console.log('✅ Users created');

  // Create facilities
  const facilities = await Promise.all([
    prisma.facility.create({
      data: {
        name: 'Lincoln High School',
        type: 'SCHOOL',
        address: '456 School St, Demo City, ST',
        region: 'North',
        code: 'LHS',
        organizationId: org.id,
      },
    }),
    prisma.facility.create({
      data: {
        name: 'Roosevelt Elementary',
        type: 'SCHOOL',
        address: '789 Elementary Rd, Demo City, ST',
        region: 'South',
        code: 'RES',
        organizationId: org.id,
      },
    }),
    prisma.facility.create({
      data: {
        name: 'Madison Middle School',
        type: 'SCHOOL',
        address: '321 Middle Way, Demo City, ST',
        region: 'East',
        code: 'MMS',
        organizationId: org.id,
      },
    }),
    prisma.facility.create({
      data: {
        name: 'District Admin Building',
        type: 'ADMINISTRATIVE',
        address: '100 Admin Plaza, Demo City, ST',
        region: 'Central',
        code: 'DAB',
        organizationId: org.id,
      },
    }),
  ]);

  console.log('✅ Facilities created');

  // Create funding sources
  const bond2024 = await prisma.fundingSource.create({
    data: {
      name: '2024 Capital Bond',
      type: 'BOND',
      code: 'BOND-2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2028-12-31'),
      organizationId: org.id,
    },
  });

  const levy2023 = await prisma.fundingSource.create({
    data: {
      name: '2023 Technology Levy',
      type: 'LEVY',
      code: 'LEVY-2023',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2026-12-31'),
      organizationId: org.id,
    },
  });

  console.log('✅ Funding sources created');

  // Create projects
  const projects = [
    {
      name: 'Lincoln High HVAC Upgrade',
      type: 'MAJOR',
      status: 'ACTIVE',
      description: 'Replace aging HVAC system with energy-efficient units',
      facilityId: facilities[0].id,
      fundingSourceId: bond2024.id,
      projectManagerId: pm1.id,
      baselineAmount: 2500000,
    },
    {
      name: 'Roosevelt Roof Replacement',
      type: 'MAJOR',
      status: 'ACTIVE',
      description: 'Replace entire roof system',
      facilityId: facilities[1].id,
      fundingSourceId: bond2024.id,
      projectManagerId: pm1.id,
      baselineAmount: 850000,
    },
    {
      name: 'Madison Security System',
      type: 'SMALL_WORKS',
      status: 'ACTIVE',
      description: 'Install new security cameras and access control',
      facilityId: facilities[2].id,
      fundingSourceId: levy2023.id,
      projectManagerId: pm2.id,
      baselineAmount: 125000,
    },
  ];

  for (const proj of projects) {
    const project = await prisma.project.create({
      data: {
        name: proj.name,
        type: proj.type as any,
        status: proj.status as any,
        description: proj.description,
        facilityId: proj.facilityId,
        fundingSourceId: proj.fundingSourceId,
        projectManagerId: proj.projectManagerId,
        organizationId: org.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    });

    // Create budget
    await prisma.budget.create({
      data: {
        projectId: project.id,
        baselineAmount: proj.baselineAmount,
        revisedAmount: proj.baselineAmount,
        contingencyAmount: proj.baselineAmount * 0.1,
        committedToDate: 0,
        actualsToDate: 0,
        forecastAtCompletion: proj.baselineAmount,
        variance: 0,
      },
    });

    // Create team
    const team = await prisma.team.create({
      data: {
        projectId: project.id,
        name: 'Project Team',
      },
    });

    // Add team members
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: team1.id,
        roleOnTeam: 'Engineer',
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: team2.id,
        roleOnTeam: 'Coordinator',
      },
    });
  }

  console.log('✅ Projects, budgets, and teams created');

  // Create vendors
  await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'ABC Construction',
        contact: 'john@abcconstruction.com',
        taxId: '12-3456789',
        organizationId: org.id,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'XYZ Engineering',
        contact: 'info@xyzeng.com',
        taxId: '98-7654321',
        organizationId: org.id,
      },
    }),
  ]);

  console.log('✅ Vendors created');

  console.log('🎉 Seed completed successfully!');
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
