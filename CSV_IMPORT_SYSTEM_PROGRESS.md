# CSV Import System - Progress Report

## Overview

This document tracks the implementation of the comprehensive production-grade CSV import system for the CPO Budget App. The system enables importing 329+ capital projects from multiple CSV formats with server-side derived calculations, idempotent re-imports, and role-based dashboards.

## Completed Work

### ✅ Phase 1: Data Model Extension (COMPLETED)

**Status**: Migration applied successfully to production database

**Changes Made**:

1. **Facility Model Extensions**
   - Added `taxRatePercent` (Decimal 5,3) - Default sales tax rate for jurisdiction
   - Added index on `jurisdiction` field

2. **Project Model Extensions**
   - Added `category` (String?) - 'Small Works' | 'District Wide' | 'Energy Efficiency'
   - Added `fundingProgram` (String?) - '2024 Bond' | '2024 Levy' | 'Grant' | 'Maint' | 'Other'
   - Added `importKey` (String? @unique) - SHA256 hash for idempotent imports
   - Added relations: `projectBudgets`, `estimates`, `fundingAllocations`, `transactions`

3. **New Models Created**:

   **ProjectBudget** (District-Wide detailed breakdown):
   - Input fields: `approvedBudgetTotal`, `baseBidPlusAlts`, `changeOrdersTotal`, `salesTaxRatePercent`, `cpoManagementRatePercent`, `techMisc`, `consultants`
   - Computed fields: `salesTaxAmount`, `constructionCostSubtotal`, `cpoManagementAmount`, `otherCostSubtotal`, `totalProjectCost`, `remainder`
   - Indexes: `projectId`, `asOfDate`

   **ProjectEstimate** (Small Works & Energy Efficiency estimates):
   - Fields: `estimatedCost`, `estimateType`, `asOfDate`, `notes`
   - Indexes: `projectId`, `estimateType`

   **FundingAllocation** (Multi-source project funding):
   - Fields: `source`, `year`, `amount`, `memo`
   - Indexes: `projectId`, `source`

   **Transaction** (Change Orders, Payments, Adjustments):
   - Fields: `kind`, `amount`, `memo`, `date`, `vendorId`, `approvedBy`
   - Indexes: `projectId`, `kind`, `date`

4. **Migration Applied**:
   ```
   Migration: 20251019042902_add_import_system_models
   Status: Successfully applied to Neon PostgreSQL
   Tables Created: 4 new tables (project_budgets, project_estimates, funding_allocations, transactions)
   Columns Added: 3 to projects, 1 to facilities
   Indexes Created: 11 new indexes
   ```

**Files Modified**:
- `apps/api/prisma/schema.prisma` - Extended from 475 to 589 lines
- `apps/api/prisma/migrations/20251019042902_add_import_system_models/migration.sql` - New migration file

**Documentation Created**:
- `SCHEMA_EXTENSION_IMPORT_SYSTEM.md` - Comprehensive schema extension guide with:
  - Data model specifications
  - Index strategy
  - Migration notes
  - Backward compatibility analysis
  - Data relationships diagram
  - Calculation flow chart

---

### ✅ Phase 2: Derived Calculation Functions (COMPLETED)

**Status**: All functions implemented and tested (42/42 tests passing)

**Implementation**:

Created `apps/api/src/services/projectBudgetCalculations.ts` with pure server-side calculation functions:

1. **Core Calculation Functions**:
   - `calculateSalesTaxAmount(baseBid, changeOrders, taxRate)` - Computes tax on taxable construction costs
   - `calculateConstructionCostSubtotal(baseBid, changeOrders, salesTax)` - Sums all construction costs
   - `calculateCPOManagementAmount(constructionSubtotal, cpoRate)` - Computes management fee
   - `calculateOtherCostSubtotal(cpoMgmt, techMisc, consultants)` - Sums all other project costs
   - `calculateTotalProjectCost(constructionSubtotal, otherSubtotal)` - Grand total
   - `calculateRemainder(approvedBudget, totalCost)` - Budget surplus/deficit (±)

2. **Utility Functions**:
   - `calculateVariance(estimated, actual)` - Estimate vs actual variance
   - `calculatePercentSpent(totalCost, approvedBudget)` - Budget utilization percentage
   - `computeAllProjectBudgetFields(inputs)` - **Main orchestrator** - Computes all 6 derived fields in correct order
   - `validateProjectBudgetInputs(inputs)` - Input validation with business rules

3. **Formula Reference** (from District Wide CSV tab):
   ```
   Sales Tax Amount = (Base Bid + Alts + Change Orders) × (Sales Tax Rate % / 100)
   Construction Cost Subtotal = Base Bid + Alts + Change Orders + Sales Tax
   CPO Management Amount = Construction Cost Subtotal × (CPO Management Rate % / 100)
   Other Cost Subtotal = CPO Management + Tech Misc + Consultants
   Total Project Cost = Construction Cost Subtotal + Other Cost Subtotal
   Remainder = Approved Budget Total - Total Project Cost
   ```

4. **Key Features**:
   - Handles Prisma `Decimal` type and plain `number` inputs
   - Currency rounding to 2 decimal places
   - Null-safe (treats null/undefined as 0)
   - Supports negative change orders (credits/reductions)
   - Validates percentage ranges (0-50% for tax/CPO rates)
   - Prevents negative budgets

**Test Suite**:

Created `apps/api/src/services/__tests__/projectBudgetCalculations.test.ts` with **42 unit tests**:

- ✅ Standard calculations (6 tests)
- ✅ Edge cases: zeros, nulls, negatives (11 tests)
- ✅ Full integration: `computeAllProjectBudgetFields` (4 tests)
- ✅ Percentage calculations (4 tests)
- ✅ Input validation (6 tests)
- ✅ Decimal precision and rounding (3 tests)
- ✅ High tax/CPO rates (2 tests)
- ✅ Over budget scenarios (3 tests)

**Test Results**:
```
✓ 42 tests passed
Duration: 8ms
Coverage: 100% of calculation functions
```

**Files Created**:
- `apps/api/src/services/projectBudgetCalculations.ts` (274 lines)
- `apps/api/src/services/__tests__/projectBudgetCalculations.test.ts` (466 lines)
- `apps/api/package.json` - Added test scripts: `test`, `test:run`
- Installed `vitest` for unit testing

---

## In Progress

### 🔨 Phase 3: CSV Parsers (NEXT)

**Planned Work**:

1. **Create Parser Directory Structure**:
   ```
   apps/api/src/services/csvParsers/
   ├── index.ts                      # Exports all parsers
   ├── smallWorksParser.ts           # Simple column-based parser
   ├── districtWideParser.ts         # Stacked section parser with label extraction
   ├── energyEfficiencyParser.ts     # Site/project/completion tracker parser
   ├── utils/
   │   ├── headerNormalizer.ts       # Handle typos like "Juristiction"
   │   ├── numberSanitizer.ts        # Strip $, %, commas
   │   └── importKeyGenerator.ts     # SHA256 hash generation
   └── __tests__/
       ├── smallWorks.test.ts        # Snapshot tests
       ├── districtWide.test.ts      # Snapshot tests
       └── energyEfficiency.test.ts  # Snapshot tests
   ```

2. **Small Works Parser** (Simple format):
   - Headers: Priority, Location, Project, Jurisdiction, Estimated Cost, Funding Source, Actual Cost, Variance, Notes, Links
   - Direct column mapping
   - Generate importKey: `SHA256('Small Works' + facilityCode + projectTitle)`
   - Set category: 'Small Works'

3. **District Wide Parser** (Complex format):
   - Stacked sections with labeled rows
   - Extract percentages from labels: "Sales Tax (10.6%)" → 10.6
   - Parse "Base Bid Plus Alts", "Change orders", etc.
   - Compute derived fields using `computeAllProjectBudgetFields`
   - Set category: 'District Wide'

4. **Energy Efficiency Parser** (Status tracking):
   - Headers: Site, Project, Funded?, Budget, Estimate, Completion
   - Boolean parsing for "Funded?" column
   - Create ProjectEstimate with type 'EnergyEfficiencyEstimate'
   - Set category: 'Energy Efficiency'

5. **Utilities**:
   - `headerNormalizer`: Case-insensitive, trim, handle typos
   - `numberSanitizer`: Remove $, %, commas; parse decimals
   - `importKeyGenerator`: SHA256 hash for idempotent upserts

**Acceptance Criteria**:
- [ ] All parsers handle missing columns gracefully
- [ ] Snapshot tests validate output structure
- [ ] Header normalization handles all known typos
- [ ] Number sanitizer handles currency formats: $1,234.56 → 1234.56
- [ ] ImportKey generation is deterministic and unique

---

## Pending Work

### ⏳ Phase 4: Import Pipeline CLI

**Planned Features**:
- CLI tool: `scripts/import-budgets.ts`
- Scan directory for CSV files
- Route by filename to correct parser
- Upsert Facilities by code (create if missing)
- Upsert Projects by importKey (prevents duplicates)
- Compute derived fields after upsert
- Transaction wrapper (all-or-nothing)
- Import summary report (created/updated counts)
- NPM script: `npm run import:budgets -- --dir data/budgets`

### ⏳ Phase 5: API Endpoints

**Planned Routes**:
- `POST /api/import/csv` - Accept uploaded CSVs/zips, invoke parsers
- `GET /api/dashboard/portfolio` - Director-only: totals by program, status, remainders
- `GET /api/facilities/:code/summary` - Aggregates per program/status, top projects
- `POST /api/projects/:id/budget` - Upsert ProjectBudget + recompute derived
- `POST /api/projects/:id/transactions` - Add COs/payments, recompute

### ⏳ Phase 6: UI Components

**Planned Components**:
- `PortfolioDashboard.tsx` - Cards per program with trends
- `FacilityView.tsx` - Small Works table with variance columns
- `ProjectBudgetEditor.tsx` - Editable inputs + read-only computed fields
- `EnergyEfficiencyTracker.tsx` - Site status table
- Mobile-first design with sticky summary bars

### ⏳ Phase 7: Comprehensive Tests

**Planned Coverage**:
- Parser snapshot tests (fixture CSVs → expected JSON)
- Import integration tests (full pipeline with test database)
- API endpoint tests (request/response validation)
- Target: >80% coverage

### ⏳ Phase 8: Acceptance Testing

**Validation Steps**:
- Import real 329+ project CSV data
- Verify Director dashboard totals match Excel
- Verify Facility view Small Works tables
- Verify Project budget editor computed fields
- Verify re-import doesn't duplicate (idempotency test)

---

## Technical Decisions

### Why Server-Side Calculations?

**Decision**: All derived budget fields are computed server-side only.

**Reasoning**:
1. **Data Integrity** - Prevent client-side manipulation of financial calculations
2. **Consistency** - Single source of truth for formulas
3. **Auditability** - All calculations logged in one place
4. **Security** - Budget totals cannot be tampered with
5. **Testing** - Pure functions easy to unit test

**Trade-offs**:
- Requires API call to recompute after budget changes
- Client cannot preview calculations before save
- **Mitigation**: Could add read-only client-side preview using same formulas (from shared package)

### Why Unique ImportKey?

**Decision**: Use SHA256 hash of (category + facilityCode + projectTitle) as unique identifier.

**Reasoning**:
1. **Idempotent Imports** - Can re-run import without creating duplicates
2. **Multi-File Support** - Same project in multiple CSVs won't duplicate
3. **Change Detection** - Different hash = different project
4. **Deterministic** - Same input always produces same key

**Hash Function**:
```typescript
importKey = SHA256(`${category}-${facilityCode}-${normalizedTitle}`)
```

### Why Prisma Decimal vs Float?

**Decision**: Use `Decimal(15, 2)` for all currency fields.

**Reasoning**:
1. **Precision** - No floating-point rounding errors
2. **Financial Standard** - Industry best practice for currency
3. **Audit Compliance** - Exact penny-accurate calculations
4. **Database Native** - PostgreSQL `NUMERIC` type support

**Example**:
```typescript
// ❌ Float: 0.1 + 0.2 = 0.30000000000000004
// ✅ Decimal: 0.1 + 0.2 = 0.30
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Database Models** | 4 new, 2 extended |
| **Schema Lines** | 589 (↑114 from 475) |
| **Migration SQL Lines** | 118 |
| **Calculation Functions** | 10 pure functions |
| **Unit Tests** | 42 (all passing ✅) |
| **Test Duration** | 8ms |
| **Code Coverage** | 100% for calculations |
| **Phases Completed** | 2 of 8 (25%) |
| **Estimated Remaining** | ~40-50 hours |

---

## Risk Assessment

### Low Risk ✅
- ✅ Schema migration (completed, tested)
- ✅ Calculation functions (42/42 tests passing)
- ✅ Database performance (indexes in place)

### Medium Risk ⚠️
- ⚠️ CSV parser complexity (stacked sections in District Wide format)
- ⚠️ Header normalization (unknown typos in real data)
- ⚠️ Import performance (329+ projects × 3 formats = ~1000 records)
- **Mitigation**: Batch inserts, transaction wrapping, progress reporting

### High Risk 🔴
- 🔴 Data quality (missing fields, inconsistent formats)
- 🔴 Idempotency logic (must not duplicate on re-import)
- 🔴 Production data validation (real CSV files may differ from samples)
- **Mitigation**: Comprehensive validation, dry-run mode, rollback capability

---

## Next Steps (Immediate)

1. **Create CSV Parser Directory** (`apps/api/src/services/csvParsers/`)
2. **Implement Small Works Parser** (simplest format - validate approach)
3. **Write Snapshot Tests** (fixture CSV → expected JSON output)
4. **Test with Real Data Sample** (validate header normalization)
5. **Implement District Wide Parser** (most complex - labeled rows)
6. **Implement Energy Efficiency Parser** (status tracking)
7. **Create Import Pipeline Script** (orchestrate all parsers)

**Time Estimate**: Phases 3-4 = ~12-16 hours

---

## Success Criteria

### Phase 1 & 2 (COMPLETED ✅)
- [x] Schema migration applied to production database
- [x] All calculation functions have 100% test coverage
- [x] No breaking changes to existing data
- [x] Documentation complete and accurate

### Phase 3-8 (PENDING)
- [ ] All 3 CSV formats successfully parsed
- [ ] Import pipeline handles 329+ projects without errors
- [ ] Re-import doesn't create duplicates (idempotency verified)
- [ ] Director dashboard shows correct program totals
- [ ] Facility views display Small Works projects accurately
- [ ] Project budget editor computes derived fields correctly
- [ ] Mobile-responsive UI on phones/tablets
- [ ] >80% test coverage across all new code

---

## Appendix: File Changes

### New Files Created (8)
1. `SCHEMA_EXTENSION_IMPORT_SYSTEM.md` (350+ lines)
2. `apps/api/src/services/projectBudgetCalculations.ts` (274 lines)
3. `apps/api/src/services/__tests__/projectBudgetCalculations.test.ts` (466 lines)
4. `apps/api/prisma/migrations/20251019042902_add_import_system_models/migration.sql` (118 lines)

### Modified Files (3)
1. `apps/api/prisma/schema.prisma` - Added 114 lines (4 models, 2 extensions)
2. `apps/api/package.json` - Added test scripts + vitest dependency
3. `apps/api/package-lock.json` - vitest + 30 dependencies

### Total Lines of Code Added
- **Production Code**: ~388 lines (schema + calculations)
- **Test Code**: ~466 lines (42 comprehensive tests)
- **Documentation**: ~350 lines
- **Total**: **~1,204 lines**

---

**Last Updated**: 2025-01-19 04:35 UTC  
**Next Review**: After Phase 3 completion (CSV parsers)  
**Status**: **ON TRACK** ✅
