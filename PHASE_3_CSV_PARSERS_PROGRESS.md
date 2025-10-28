# Phase 3: CSV Parsers - Progress Report

## Status: IN PROGRESS ⏳

We've completed the foundational infrastructure for CSV parsing and are ready to handle multiple CSV formats with automated data cleaning and validation.

## Completed Work ✅

### 1. Utility Functions (100% Complete)

**File Structure**:
```
apps/api/src/services/csvParsers/
├── utils/
│   ├── headerNormalizer.ts          ✅ COMPLETE (178 lines)
│   ├── numberSanitizer.ts           ✅ COMPLETE (221 lines)
│   ├── importKeyGenerator.ts        ✅ COMPLETE (108 lines)
│   └── __tests__/
│       └── numberSanitizer.test.ts  ✅ COMPLETE (146 lines)
├── smallWorksParser.ts              ✅ COMPLETE (239 lines)
└── index.ts                         ✅ COMPLETE (9 lines)
```

#### Header Normalizer (`headerNormalizer.ts`)

**Purpose**: Handle inconsistent CSV headers with typos and variations

**Features Implemented**:
- ✅ Case-insensitive header matching
- ✅ Whitespace trimming
- ✅ Common typo handling (e.g., "Juristiction" → "Jurisdiction")
- ✅ Alias mapping (50+ header variations)
- ✅ Special character removal
- ✅ Required header validation

**Example Aliases Supported**:
```typescript
'juristiction' → 'jurisdiction'  // Common typo
'project name' → 'project'
'estimated cost' → 'estimate'
'funding source' → 'fundingsource'
'actual cost' → 'actualcost'
```

**Key Functions**:
- `normalizeHeader(header)` - Normalize single header
- `normalizeHeaders(headers[])` - Normalize array of headers
- `findColumn(headers, targetHeader)` - Find column index by name
- `getValueByHeader(headers, row, targetHeader)` - Get value by header name
- `validateRequiredHeaders(headers, required[])` - Validate headers exist

---

#### Number Sanitizer (`numberSanitizer.ts`)

**Purpose**: Clean and parse numbers from various formats

**Features Implemented**:
- ✅ Currency parsing: `$1,234.56` → `1234.56`
- ✅ Percentage extraction: `10.6%` → `10.6`
- ✅ Percentage from labels: `"Sales Tax (10.6%)"` → `10.6`
- ✅ Negative accounting format: `($1,234.56)` → `-1234.56`
- ✅ Empty/null handling: `"-"`, `"N/A"`, `""` → `null`
- ✅ Boolean parsing: `"Yes"`, `"Y"`, `"X"`, `"1"` → `true`
- ✅ Year extraction: `"FY 2025"`, `"25"` → `2025`

**Key Functions**:
- `sanitizeCurrency(value)` - Parse currency to number
- `sanitizePercentage(value)` - Extract percentage value
- `extractPercentageFromLabel(label)` - Extract % from text like "Tax (10.6%)"
- `sanitizeNumber(value)` - General number parsing
- `sanitizeBoolean(value)` - Parse yes/no, true/false, etc.
- `sanitizeYear(value)` - Extract 4-digit year

**Test Coverage**:
- ✅ 146 lines of comprehensive tests
- ✅ Edge cases: nulls, negatives, accounting format, large numbers
- ✅ Currency with/without $, with/without commas
- ✅ Percentages with/without % sign
- ✅ Boolean variations (Yes/No, Y/N, True/False, 1/0, X/)
- ✅ Year parsing (4-digit, 2-digit, extracted from text)

---

#### Import Key Generator (`importKeyGenerator.ts`)

**Purpose**: Generate deterministic SHA256 hashes for idempotent imports

**Features Implemented**:
- ✅ SHA256 hashing for unique project identification
- ✅ Text normalization (lowercase, trim, remove special chars)
- ✅ Composite key: `category + facilityCode + projectTitle`
- ✅ Optional priority inclusion for Small Works
- ✅ Batch key generation
- ✅ Key validation (64-char hex string)
- ✅ Short key generation (16-char for display)

**Key Functions**:
- `generateImportKey(category, facilityCode, title)` - Main hash generator
- `generateImportKeyWithPriority(category, facility, title, priority)` - Include priority
- `generateImportKeyBatch(category, projects[])` - Batch processing
- `isValidImportKey(key)` - Validate hash format

**Example**:
```typescript
generateImportKey('Small Works', 'EWHS', 'Stadium ticket booth / gates')
// → '7f9a8b3c...' (64-char SHA256 hash)

// Same inputs always produce same hash (idempotent!)
generateImportKey('Small Works', 'EWHS', 'Stadium ticket booth / gates')
// → '7f9a8b3c...' (identical)
```

---

### 2. Small Works Parser (`smallWorksParser.ts`) ✅

**Purpose**: Parse the simplest CSV format with direct column mapping

**Features Implemented**:
- ✅ Header validation (required: Priority, Location, Project)
- ✅ Row-by-row parsing with error collection
- ✅ Numeric field sanitization (estimated cost, actual cost, variance)
- ✅ Import key generation per row
- ✅ Facility code extraction
- ✅ Completion year inference from notes/title
- ✅ Comprehensive error and warning tracking
- ✅ Summary statistics (totals, counts, facilities found)

**Expected CSV Columns**:
- Priority (or #, Pri, Number)
- Location (or Site, Facility, Building)
- Project (or Project Name, Description, Title)
- Jurisdiction (handles "Juristiction" typo)
- Estimated Cost (or Budget, Estimate)
- Funding Source (or Fund, Source)
- Actual Cost (or Actuals, Spent)
- Variance (or Difference, Remaining)
- Notes (or Comments, Memo)
- Links (or URLs, Attachments)

**Output Data Structure**:
```typescript
{
  success: boolean;
  data: SmallWorksRow[];  // Parsed rows
  errors: Array<{row: number, message: string}>;
  warnings: Array<{row: number, message: string}>;
  summary: {
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    facilitiesFound: Set<string>;
  }
}
```

**Helper Functions**:
- `smallWorksRowToProject(row, orgId)` - Convert to Project creation data
- `smallWorksRowToEstimate(row, projectId)` - Convert to ProjectEstimate creation data

---

## Remaining Work (Phase 3) ⏳

### 1. District Wide Parser (Not Started)

**Complexity**: HIGH (stacked sections, labeled rows, percent extraction)

**Requirements**:
- Parse stacked sections (not columnar)
- Extract percentages from labels: "Sales Tax (10.6%)" → 10.6
- Recognize section headers: "Total Approved Project Budget", "Construction Cost Subtotal", etc.
- Map labeled rows to budget fields
- Compute derived fields using `projectBudgetCalculations.ts`

**Expected Input Format**:
```
Row 1: Project Name         | Most Current Budget | Estimated Date
Row 2: Total Approved...    | $60,000.00         |
Row 3: Base Bid             | $37,410.00         | $37,410.00
Row 4: Construction Cont... | $10,000.00         | $10,000.00
Row 5: Sales Tax (10.6%)    | $5,025.46          |
Row 6: Construction Cost... | $52,435.46         |
...
```

**Challenges**:
- Not columnar (each row is a different budget line)
- Need to identify rows by label text
- Extract percentages from row labels
- Handle variable number of columns

---

### 2. Energy Efficiency Parser (Not Started)

**Complexity**: MEDIUM (simpler than District Wide, but has status tracking)

**Requirements**:
- Parse simple columnar format
- Handle "Funded?" boolean column
- Extract site, project, budget, estimate, completion
- Create ProjectEstimate records
- Track completion status

**Expected CSV Columns**:
- Site (or Location, Facility)
- Project (or Project Name, Description)
- Funded? (or Funded, Is Funded) - Boolean
- Budget (or Approved Budget, Total Budget)
- Estimate (or Estimated Cost, Current Estimate)
- Completion (or Completion Date, Target Date)

---

### 3. Parser Tests (Not Started)

**Need to create**:
- Snapshot tests for each parser
- Test fixtures (sample CSV files)
- Edge case tests (missing columns, malformed data)
- Integration tests (full parse → database insert)

---

## Technical Highlights

### Idempotent Import Strategy

The import key ensures projects aren't duplicated on re-import:

```typescript
// First import
importKey = SHA256('Small Works|ewhs|stadium ticket booth gates')
// Project created with this key

// Second import (same CSV)
importKey = SHA256('Small Works|ewhs|stadium ticket booth gates')  // Same hash!
// Project updated (not duplicated) via UPSERT
```

### Robust Error Handling

Parsers collect errors per row without failing entire import:

```typescript
{
  errors: [
    { row: 5, message: 'Missing facility code or project title' },
    { row: 12, message: 'Invalid estimated cost format' }
  ],
  warnings: [
    { row: 3, message: 'Missing estimated cost' },
    { row: 8, message: 'Jurisdiction not recognized' }
  ]
}
```

### Flexible Header Matching

Handles real-world CSV inconsistencies:

```
✅ "Priority" = "Pri" = "#" = "Number"
✅ "Jurisdiction" = "Juristiction" (typo)
✅ "Estimated Cost" = "Budget" = "Estimate"
✅ "Funding Source" = "Fund" = "Source"
```

---

## Next Steps (Immediate)

1. **Create District Wide Parser** (`districtWideParser.ts`)
   - Most complex parser (stacked sections)
   - Requires label-based row identification
   - Must extract percentages from labels
   - Integration with `projectBudgetCalculations.ts`

2. **Create Energy Efficiency Parser** (`energyEfficiencyParser.ts`)
   - Simpler columnar format
   - Boolean "Funded?" column
   - Create ProjectEstimate records
   - Completion status tracking

3. **Write Parser Tests**
   - Create test fixtures (sample CSVs)
   - Snapshot tests for expected output
   - Edge case coverage
   - Error handling validation

4. **Create Parser Integration Script**
   - Route CSV files to correct parser by filename
   - Handle multiple CSV files in batch
   - Collect aggregated results
   - Generate import summary report

---

## Files Created (Phase 3 So Far)

### New Files (7)
1. `apps/api/src/services/csvParsers/utils/headerNormalizer.ts` (178 lines)
2. `apps/api/src/services/csvParsers/utils/numberSanitizer.ts` (221 lines)
3. `apps/api/src/services/csvParsers/utils/importKeyGenerator.ts` (108 lines)
4. `apps/api/src/services/csvParsers/utils/__tests__/numberSanitizer.test.ts` (146 lines)
5. `apps/api/src/services/csvParsers/smallWorksParser.ts` (239 lines)
6. `apps/api/src/services/csvParsers/index.ts` (9 lines)
7. `CSV_IMPORT_SYSTEM_PROGRESS.md` - Updated with Phase 3 status

### Total Lines of Code (Phase 3)
- **Utility Code**: ~507 lines (normalizer + sanitizer + key generator)
- **Parser Code**: ~239 lines (Small Works parser)
- **Test Code**: ~146 lines (number sanitizer tests)
- **Total**: **~901 lines**

---

## Phase 3 Completion Estimate

**Completed**: 40% (utilities + Small Works parser)  
**Remaining**: 60% (District Wide parser, Energy Efficiency parser, tests)

**Time Estimate for Remaining Work**:
- District Wide Parser: ~4-6 hours (complex)
- Energy Efficiency Parser: ~2-3 hours (simpler)
- Comprehensive Tests: ~3-4 hours
- **Total Remaining**: ~9-13 hours

---

## Success Criteria (Phase 3)

- [ ] All 3 parsers implemented (Small Works ✅, District Wide ⏳, Energy Efficiency ⏳)
- [x] Header normalization handles all known typos
- [x] Number sanitization handles currency, percentages, booleans
- [x] Import key generation is deterministic and unique
- [ ] Parsers handle missing columns gracefully
- [ ] Comprehensive error and warning collection
- [ ] Snapshot tests validate output structure
- [ ] >80% test coverage for all parsers

**Current Status**: 3/8 criteria met (37.5%)

---

**Last Updated**: 2025-01-19 05:15 UTC  
**Next Milestone**: Complete District Wide Parser  
**Overall Phase 3 Status**: **GOOD PROGRESS** ⏳
