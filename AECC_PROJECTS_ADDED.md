# AECC Projects Added Successfully ✅

## Summary
Added 3 missing AECC (Alderwood Early Childhood Center) projects from CSV files to the database with complete budget breakdowns.

## Projects Created

### 1. AECC Boiler
- **Budget**: $500,000.00
- **Type**: MAJOR
- **Status**: ACTIVE
- **Completion Year**: 2025

**Budget Breakdown:**
- Total Approved Project Budget: $500,000.00
- Base Bid Plus Alts: $250,000.00
- Contingency (10%): $25,000.00
- Sales Tax (10.4%): $28,600.00
- Construction Cost Subtotal: $303,600.00
- CPO Management (7%): $21,252.00
- Other Costs: $169,752.00
  - Principal Stipends: $3,500.00
  - Hargis (A/E): $50,000.00
  - Design Contingency (3%): $17,000.00
  - Permit: $5,000.00
  - Commissioning: $10,000.00
  - Hazmat (Terracon): $5,000.00
  - Abatement: $50,000.00
  - Temp HVAC: $5,000.00
  - Maintenance: $2,500.00
  - Custodial: $500.00
- **Total Project Cost**: $473,352.00
- **Remainder**: $26,648.00

### 2. AECC Kitchen Code Corrections
- **Budget**: $300,000.00
- **Type**: SMALL_WORKS
- **Status**: ACTIVE
- **Completion Year**: 2025

**Budget Breakdown:**
- Total Approved Project Budget: $300,000.00
- Base Bid Plus Alts: $183,000.00
- Construction Reserve (10%): $18,300.00
- Sales Tax (10.5%): $20,935.20
- Construction Cost Subtotal: $222,235.20
- CPO Management (10%): $22,223.52
- Other Costs: $70,723.52
  - Design (Hargis): $25,000.00
  - Design Contingency: $2,500.00
  - FFE: $10,000.00
  - Permit: $5,000.00
  - Maintenance: $5,000.00
  - Custodial: $1,000.00
- **Total Project Cost**: $292,958.72
- **Remainder**: $7,041.28

### 3. AECC Kitchen
- **Budget**: $100,000.00
- **Type**: SMALL_WORKS
- **Status**: ACTIVE
- **Completion Year**: 2025

**Budget Breakdown:**
- Total Approved Project Budget: $100,000.00
- Base Bid Plus Alts: $37,087.00
- Construction Reserve (10%): $3,708.70
- Sales Tax (10.5%): $4,283.55
- Construction Cost Subtotal: $45,079.25
- CPO Management (10%): $4,507.92
- Other Costs: $27,007.92
  - Design: $5,500.00
  - Design Contingency: $500.00
  - Washer Dryer Move: $10,000.00
  - Fencing: $5,000.00
  - Maintenance: $1,000.00
  - Custodial: $500.00
- **Total Project Cost**: $72,087.17
- **Remainder**: $27,912.83

## Database Records Created

For each project:
- ✅ Project record with metadata
- ✅ ProjectBudget record (District-Wide format with calculations)
- ✅ ProjectEstimate record (CPO_ESTIMATE type)

## Files Created

### `apps/api/prisma/seed-aecc-projects.ts`
Reusable seed script that:
- Creates/updates the 3 AECC projects
- Populates ProjectBudget with input fields (base bid, rates, etc.)
- Creates ProjectEstimate records
- Stores detailed line items in notes field (JSON)
- Can be run multiple times safely (checks for existing records)

## API Updates

### `apps/api/src/routes/facility.routes.ts`
**Fixed Issues:**
- ✅ Changed `firstName` and `lastName` to `name` (line 76-80)
- ✅ Added `projectBudgets` to facility detail include
  - Now returns latest ProjectBudget for each project
  - Enables Budget Breakdown display on project detail pages

**Updated Include:**
```typescript
include: {
  projects: {
    include: {
      projectManager: {
        select: {
          id: true,
          name: true,      // ✅ Fixed from firstName/lastName
          email: true,
        },
      },
      budgets: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      projectBudgets: {   // ✅ Added
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  },
}
```

## How to Use

### Run the seed script:
```bash
cd apps/api
npx tsx prisma/seed-aecc-projects.ts
```

### View the projects:
1. Navigate to Facilities page
2. Click on AECC (Alderwood Early Childhood Center)
3. See all 3 projects listed
4. Click on any project
5. Go to "Budget Breakdown" tab
6. See complete District-Wide format budget display

## Next Steps

These AECC projects now appear in:
- ✅ Facility detail view (projects list)
- ✅ Project detail pages
- ✅ Budget Breakdown tab (District-Wide format)
- ✅ Any API calls that fetch projects for AECC facility

The ProjectBudget records enable the calculation engine to compute:
- Construction Cost Subtotal
- Other Cost Subtotal
- Total Project Cost
- Remainder (with color coding)

All budget breakdown displays will now show the complete data from the CSV files.
