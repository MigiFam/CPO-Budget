# Database Schema Update - Real World Budget Data Integration

## Date: October 18, 2025

## Summary
Updated Prisma schema to match the real-world budget tracking structure from **Small Works Master Budget 2025.xlsx**. The schema now supports multi-year capital projects tracking across multiple bond measures and levies.

> **📌 Important Context**: The first CSV file shared (`Master.csv`) is the **master aggregate document** containing 329+ projects with rolled-up budget data from all funding sources. The additional facility/category-specific CSV files (EWH.csv, MDH.csv, Security.csv, etc.) are **supporting detail tabs** that provide line-item breakdowns for specific facilities or project categories. Our schema is based on the Master document structure for Projects and Budgets, with BudgetLines supporting the detail-level data from the facility tabs.
> 
> See [CSV_DATA_STRUCTURE_EXPLAINED.md](./CSV_DATA_STRUCTURE_EXPLAINED.md) for complete documentation of the Master + Supporting tabs relationship.

---

## 📊 Data Analysis from CSV (Master Document)

### Funding Sources Identified:
1. **2024 Bond** - $35M total allocation
2. **2024 Levy** - $40M total allocation
3. **2021 Levy** - $65M total allocation
4. **2020 Levy** - $34.87M total allocation
5. **2016 Levy** - $26.2M total allocation
6. **2014 Bond** - $26.1M total allocation

### Project Structure:
- **329+ projects** across all funding sources
- Projects organized by **completion year** (2015-2029)
- Each project has **priority number** (001, 002, etc.)
- Projects span **multiple facilities** (30+ locations)
- **Jurisdiction-based** (5 municipalities: Lynnwood, Edmonds, Sno. Co., Mt. Lake Terrace, Brier)

### Budget Tracking Pattern:
For each project, the CSV tracks:
1. **Levy/Bond Allocation** - Initial allocated amount
2. **Board Approved Budget** - Amount approved by board
3. **Most Current Estimate** - Latest project estimate
4. **Board Budget Remainder** - Difference between approved and estimate
5. **Levy Allocation Remainder** - Difference between allocation and board approved

### Facility Codes:
```
EWH = Edmonds-Woodway High School
MDH = Meadowdale High School
LWH = Lynnwood High School
HWE = Hazel Wood Elementary
SWE = Sherwood Elementary
TPE = Terrace Park Elementary
CVE = Cedar Valley Elementary
MW K-8 = Mountlake Terrace K-8
BTM = Beverly Elementary/Brier Terrace Middle
... (30+ more facilities)
```

---

## 🔄 Schema Changes

### 1. **Facility Model** Enhancements

**Added Fields:**
```prisma
jurisdiction   String?  // "Lynnwood", "Edmonds", "Sno. Co.", etc.
```

**Added Index:**
```prisma
@@index([code])  // Index on facility code for faster lookups
```

**Rationale**: Facilities are associated with specific jurisdictions (municipalities) which affects project approval processes and reporting.

---

### 2. **FundingSource Model** Enhancements

**Added Fields:**
```prisma
year            Int?      // e.g., 2024, 2021, 2016
totalAllocation Decimal?  // Total allocated amount (e.g., $35M for 2024 Bond)
```

**Added Index:**
```prisma
@@index([year])  // Index for year-based queries
```

**Rationale**: 
- Funding sources are year-specific (2024 Bond, 2021 Levy, etc.)
- Total allocation tracking enables fund balance calculations
- Year indexing supports multi-year reporting

**Example Data:**
```typescript
{
  name: "2024 Bond",
  type: "BOND",
  year: 2024,
  totalAllocation: 35000000.00,
  code: "2024-BOND"
}
```

---

### 3. **Project Model** Enhancements

**Added Fields:**
```prisma
priority         Int?     // Priority number (1, 2, 3, etc.)
completionYear   Int?     // Target completion year (2025, 2026, etc.)
estimatedDate    String?  // Date estimate like "1/14/2025 est", "9/10/2025 Final"
jurisdiction     String?  // Can override facility jurisdiction
notes            String?  // Project notes and references
```

**Added Indexes:**
```prisma
@@index([completionYear])  // Year-based filtering
@@index([priority])        // Priority-based sorting
```

**Breaking Change:**
```prisma
// BEFORE:
budget     Budget?

// AFTER:
budgets    Budget[]  // Now supports multiple budget versions
```

**Rationale**:
- **Priority**: Projects are numbered for sequential completion (001, 002, 003...)
- **CompletionYear**: Enables grouping projects by target completion (2025 subtotal, 2026 subtotal, etc.)
- **EstimatedDate**: Stores the date string from CSV for auditing purposes
- **Jurisdiction**: Some projects span multiple jurisdictions or override facility jurisdiction
- **Notes**: Critical for tracking project details, references, and dependencies
- **Multiple Budgets**: Real-world tracking requires multiple budget versions (allocation vs. approved vs. estimate)

**Example Data:**
```typescript
{
  name: "Stadium ticket booth / gates",
  priority: 1,
  completionYear: 2025,
  estimatedDate: "1/14/2025 est",
  jurisdiction: "Lynnwood",
  facilityCode: "EWH",
  notes: "Ref: ticket booth upgrades"
}
```

---

### 4. **Budget Model** Major Restructure

**Removed Constraint:**
```prisma
// BEFORE:
projectId String @unique

// AFTER:
projectId String  // No longer unique
```

**Added Fields:**
```prisma
version                  String   @default("current")
levyAllocation          Decimal?  // "2024 Levy Allocation" from CSV
boardApprovedBudget     Decimal?  // "Board Approved Budget" from CSV
mostCurrentEstimate     Decimal?  // "Most Current Estimate" from CSV
boardBudgetRemainder    Decimal?  // Calculated variance
levyAllocationRemainder Decimal?  // Calculated variance
```

**Added Index:**
```prisma
@@index([version])  // Filter by budget version
```

**Rationale**:
The CSV demonstrates that projects track **three distinct budget amounts** simultaneously:

1. **Levy Allocation** ($250,000) - Original funding allocated
2. **Board Approved Budget** ($60,000) - Board-approved spend authorization
3. **Most Current Estimate** ($57,679.01) - Latest contractor/CPO estimate

This creates **variance tracking at two levels**:
- **Board Budget Remainder**: `boardApprovedBudget - mostCurrentEstimate` = $2,320.99
- **Levy Allocation Remainder**: `levyAllocation - boardApprovedBudget` = $190,000.00

**Budget Versions:**
- `"allocation"` - Initial levy/bond allocation budget
- `"board_approved"` - Board-approved budget (may differ from allocation)
- `"current"` - Most recent estimate (default, actively tracked)

**Example Data:**
```typescript
// Project: "Stadium ticket booth / gates"
{
  version: "current",
  levyAllocation: 250000.00,
  boardApprovedBudget: 60000.00,
  mostCurrentEstimate: 57679.01,
  boardBudgetRemainder: 2320.99,
  levyAllocationRemainder: 190000.00,
  baselineAmount: 60000.00,  // Matches board approved
  actualsToDate: 57679.01,   // Matches current estimate
  variance: 2320.99
}
```

---

## 🔑 Key Insights from Real Data

### 1. **Completion Year Grouping**
Projects are organized by target completion year with subtotals:
- 2025 Completion: $10.6M (2024 Bond) + $6.25M (2024 Levy) + ...
- 2026 Completion: $6M (2024 Bond) + $20.5M (2024 Levy) + ...
- Enables **cash flow planning** and **yearly budget summaries**

### 2. **Over/Under Budget Tracking**
```
Project 002 (HWE Playground):
- Allocation: $350,000
- Board Approved: $750,000 (over by $400k)
- Current Estimate: $666,762.46
- Status: Under board budget by $83,237.54
```

### 3. **Project Dependencies**
Notes reveal dependencies:
- "fold into HVAC" - Project merged with another
- "delay to 2024" - Timeline adjustments
- "Cancelled" - Project status changes
- "make 3M" - Budget reallocations

### 4. **Multi-Site Projects**
Some projects span multiple facilities:
```
"Boilers / HVAC - Varies" serving:
- CWE, TPE, HTE (multiple schools)
- BRE, EDE, MLE (covered play areas)
```

---

## 📈 Impact on Existing Code

### Frontend Changes Needed:

**1. ProjectCard Component**
```typescript
// ADD: Display priority and completion year
<div className="text-xs text-gray-500">
  Priority {project.priority} · {project.completionYear} Completion
</div>
```

**2. ProjectsPage Filters**
```typescript
// ADD: New filter options
- completionYear (2025, 2026, 2027, etc.)
- jurisdiction (Lynnwood, Edmonds, Sno. Co., etc.)
- priority (sort by priority number)
```

**3. ProjectDetailPage**
```typescript
// ADD: Display all three budget amounts
<Card>
  <CardTitle>Budget Comparison</CardTitle>
  <div>Levy Allocation: {formatCurrency(budget.levyAllocation)}</div>
  <div>Board Approved: {formatCurrency(budget.boardApprovedBudget)}</div>
  <div>Current Estimate: {formatCurrency(budget.mostCurrentEstimate)}</div>
  <div>Allocation Remainder: {formatCurrency(budget.levyAllocationRemainder)}</div>
</Card>
```

**4. DashboardPage**
```typescript
// ADD: Completion year breakdown
fundingSources.forEach(source => {
  const projectsByYear = groupByCompletionYear(source.projects);
  // Display 2025 subtotal, 2026 subtotal, etc.
});
```

### Backend Changes Needed:

**1. Budget Routes**
```typescript
// MODIFY: Support multiple budgets per project
GET /projects/:id
// Returns: project.budgets[] instead of project.budget

GET /budgets/:budgetId
// Now includes levyAllocation, boardApprovedBudget, mostCurrentEstimate
```

**2. Project Routes**
```typescript
// ADD: New query parameters
GET /projects?completionYear=2025&priority=1-10

// ADD: Jurisdiction filter
GET /projects?jurisdiction=Lynnwood
```

**3. Dashboard Aggregation**
```typescript
// MODIFY: Calculate subtotals by completion year
interface YearlySubtotal {
  completionYear: number;
  totalLevyAllocation: number;
  totalBoardApproved: number;
  totalCurrentEstimate: number;
  projectCount: number;
}
```

---

## 🚀 Migration Steps

### 1. **Run Prisma Migration**
```bash
cd apps/api
npx prisma migrate dev --name add_real_world_budget_fields
```

### 2. **Update Seed Script**
Create realistic seed data matching CSV structure:
- 6 funding sources (2024 Bond/Levy, 2021 Levy, etc.)
- 30+ facilities with codes and jurisdictions
- 50+ projects with priorities and completion years
- Multiple budgets per project (allocation, board approved, current)

### 3. **Update Type Definitions**
```typescript
// packages/types/src/index.ts
export interface Budget {
  version: 'allocation' | 'board_approved' | 'current';
  levyAllocation?: number;
  boardApprovedBudget?: number;
  mostCurrentEstimate?: number;
  boardBudgetRemainder?: number;
  levyAllocationRemainder?: number;
}

export interface Project {
  priority?: number;
  completionYear?: number;
  estimatedDate?: string;
  jurisdiction?: string;
  notes?: string;
  budgets: Budget[]; // Changed from budget?: Budget
}
```

---

## 🧪 Testing Plan

### 1. **Data Migration Verification**
- Verify existing 3 demo projects still work
- Ensure budgets array is populated correctly
- Check that budget calculations still function

### 2. **New Fields Testing**
- Create project with priority and completionYear
- Filter projects by completion year
- Sort by priority
- Display all three budget amounts in UI

### 3. **Multi-Budget Testing**
- Create project with 3 budget versions
- Verify queries return all budgets
- Test budget line associations

---

## 📋 Next Steps

1. ✅ Update schema (COMPLETED)
2. ⏳ Run migration
3. ⏳ Update seed script with real data from CSV
4. ⏳ Update frontend components to display new fields
5. ⏳ Add completion year and jurisdiction filters
6. ⏳ Create budget comparison view
7. ⏳ Build CSV import tool for bulk project creation

---

## 🎯 Benefits

**For Users:**
- ✅ Matches existing Excel workflow exactly
- ✅ Supports real-world multi-year capital planning
- ✅ Tracks budget changes through approval process
- ✅ Enables accurate variance reporting at multiple levels

**For System:**
- ✅ More accurate data model reflecting actual usage
- ✅ Better audit trail with budget versions
- ✅ Improved reporting capabilities
- ✅ Foundation for CSV import/export

---

**Status**: ✅ Schema updated, ready for migration  
**Breaking Changes**: Yes - budget relationship changed from 1:1 to 1:many  
**Data Migration Required**: Yes - existing projects need budgets converted to array

