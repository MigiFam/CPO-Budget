import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏫 Updating all facilities with standardized codes and names...');

  // Get the organization
  const org = await prisma.organization.findFirst();
  if (!org) {
    throw new Error('No organization found. Please run seed-realworld.ts first.');
  }

  // Complete list of all Edmonds School District facilities
  const facilities = [
    // Early Childhood Centers
    {
      code: 'AECC',
      name: 'Alderwood Early Childhood Center',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    
    // High Schools
    {
      code: 'EWH',
      name: 'Edmonds Woodway High School',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'MDH',
      name: 'Meadowdale High School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'MTH',
      name: 'Mountlake Terrace High School',
      type: 'SCHOOL',
      region: 'Mountlake Terrace',
      jurisdiction: 'Mountlake Terrace',
    },
    
    // Middle Schools
    {
      code: 'AWM',
      name: 'Alderwood Middle School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'BTM',
      name: 'Brier Terrace Middle School',
      type: 'SCHOOL',
      region: 'Brier',
      jurisdiction: 'Sno. Co.',
    },
    {
      code: 'CPM',
      name: 'College Place Middle School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'FAM',
      name: 'Former Alderwood Middle School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'MDM',
      name: 'Meadowdale Middle School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    
    // K-8 Schools
    {
      code: 'MAD',
      name: 'Madrona K8',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'MWK',
      name: 'Maplewood K8',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    
    // Elementary Schools
    {
      code: 'BVE',
      name: 'Beverly Elementary School',
      type: 'SCHOOL',
      region: 'Mukilteo',
      jurisdiction: 'Mukilteo',
    },
    {
      code: 'BRE',
      name: 'Brier Elementary School',
      type: 'SCHOOL',
      region: 'Brier',
      jurisdiction: 'Sno. Co.',
    },
    {
      code: 'CLE',
      name: 'Chaselake Elementary School',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'CPE',
      name: 'College Place Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'CVE',
      name: 'Cedar Valley Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'CWE',
      name: 'Cedar Way Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'EDE',
      name: 'Edmonds Elementary School',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'HTE',
      name: 'Hilltop Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'HWE',
      name: 'Hazelwood Elementary School',
      type: 'SCHOOL',
      region: 'Brier',
      jurisdiction: 'Sno. Co.',
    },
    {
      code: 'LDE',
      name: 'Lynndale Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'LWE',
      name: 'Lynnwood Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'MLE',
      name: 'Martha Lake Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Sno. Co.',
    },
    {
      code: 'OHE',
      name: 'Oakheights Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'SPE',
      name: 'Spruce Elementary School',
      type: 'SCHOOL',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'SVE',
      name: 'Seaview Elementary School',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'SWE',
      name: 'Sherwood Elementary School',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'TPE',
      name: 'Terrace Park Elementary School',
      type: 'SCHOOL',
      region: 'Mountlake Terrace',
      jurisdiction: 'Mountlake Terrace',
    },
    {
      code: 'WGE',
      name: 'Westgate Elementary School',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'WWE',
      name: 'Woodway Elementary School',
      type: 'SCHOOL',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    
    // Administrative and Support Facilities
    {
      code: 'ESC',
      name: 'Education Service Center',
      type: 'ADMINISTRATIVE',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'MTR',
      name: 'Maintenance and Transportation',
      type: 'FACILITY',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    {
      code: 'WC',
      name: 'Woodway Campus',
      type: 'ADMINISTRATIVE',
      region: 'Edmonds',
      jurisdiction: 'Edmonds',
    },
    {
      code: 'WH',
      name: 'Warehouse',
      type: 'FACILITY',
      region: 'Lynnwood',
      jurisdiction: 'Lynnwood',
    },
    
    // Special - Multiple Facilities
    {
      code: 'VARIES',
      name: 'Multiple Facilities (District-Wide)',
      type: 'OTHER',
      region: 'District-Wide',
      jurisdiction: 'Varies',
    },
  ];

  console.log(`\n📋 Processing ${facilities.length} facilities...`);

  let created = 0;
  let updated = 0;

  for (const facility of facilities) {
    const existing = await prisma.facility.findFirst({
      where: {
        organizationId: org.id,
        code: facility.code,
      },
    });

    if (existing) {
      // Update existing facility
      await prisma.facility.update({
        where: { id: existing.id },
        data: {
          name: facility.name,
          code: facility.code,
          type: facility.type,
          region: facility.region,
          jurisdiction: facility.jurisdiction,
        },
      });
      console.log(`   ✓ Updated ${facility.code} - ${facility.name}`);
      updated++;
    } else {
      // Create new facility
      await prisma.facility.create({
        data: {
          name: facility.name,
          code: facility.code,
          type: facility.type,
          region: facility.region,
          jurisdiction: facility.jurisdiction,
          organizationId: org.id,
        },
      });
      console.log(`   + Created ${facility.code} - ${facility.name}`);
      created++;
    }
  }

  console.log('\n✅ Facility update complete!');
  console.log(`   - Created: ${created} new facilities`);
  console.log(`   - Updated: ${updated} existing facilities`);
  console.log(`   - Total: ${facilities.length} facilities in district`);
  console.log('\n📊 Breakdown by type:');
  console.log(`   - High Schools: 3 (EWH, MDH, MTH)`);
  console.log(`   - Middle Schools: 5 (AWM, BTM, CPM, FAM, MDM)`);
  console.log(`   - K-8 Schools: 2 (MAD, MWK)`);
  console.log(`   - Elementary Schools: 20`);
  console.log(`   - Administrative: 3 (AECC, ESC, WC)`);
  console.log(`   - Support Facilities: 2 (MTR, WH)`);
  console.log(`   - Special: 1 (VARIES)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Facility update failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
