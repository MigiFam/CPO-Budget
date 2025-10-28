# Schema Extension for CSV Import System

This document describes the schema extensions needed to support the comprehensive budget import system.

## New Fields to Add

### Facility Model Extensions

```prisma
model Facility {
  // ... existing fields ...
  taxRatePercent    Decimal?  @db.Decimal(5, 3)  // Default sales tax rate for jurisdiction (e.g., 10.6 for 10.6%)
  
  // Existing fields already support:
  // - code (facility abbreviation)
  // - jurisdiction (location)
}
```

### Project Model Extensions

```prisma
model Project {
  // ... existing fields ...
  category          String?   // 'Small Works', 'District Wide', 'Energy Efficiency', etc.
  fundingProgram    String?   // '2024 Bond' | '2024 Levy' | 'Grant' | 'Maint' | 'Other'
  importKey         String?   @unique  // For idempotent imports: sha256 hash
  
  // New relations
  projectBudgets    ProjectBudget[]
  estimates         ProjectEstimate[]
  fundingAllocations FundingAllocation[]
  transactions      Transaction[]
  
  // Keep existing: budgets, costEvents, teams, comments, issues, attachments (via org)
}
```

## New Models to Create

### 1. ProjectBudget (District-Wide Style)

Captures the detailed breakdown format used in "District Wide" tab:

```prisma
model ProjectBudget {
  id                         String   @id @default(uuid())
  projectId                  String
  project                    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  asOfDate                   DateTime?
  
  // Input fields (user/import provided)
  approvedBudgetTotal        Decimal?  @db.Decimal(15, 2)  // "Total Approved Project Budget"
  baseBidPlusAlts            Decimal?  @db.Decimal(15, 2)  // "Base Bid Plus Alts"
  changeOrdersTotal          Decimal?  @db.Decimal(15, 2)  // "Change orders"
  salesTaxRatePercent        Decimal?  @db.Decimal(5, 3)   // From "Sales Tax (10.6%)"
  cpoManagementRatePercent   Decimal?  @db.Decimal(5, 3)   // From "CPO Management (10%)"
  techMisc                   Decimal?  @db.Decimal(15, 2)  // "Tech Misc Stuff"
  consultants                Decimal?  @db.Decimal(15, 2)  // "Consultants"
  
  // Computed fields (server-side only)
  salesTaxAmount             Decimal?  @db.Decimal(15, 2)  // Computed
  constructionCostSubtotal   Decimal?  @db.Decimal(15, 2)  // Computed
  cpoManagementAmount        Decimal?  @db.Decimal(15, 2)  // Computed
  otherCostSubtotal          Decimal?  @db.Decimal(15, 2)  // Computed
  totalProjectCost           Decimal?  @db.Decimal(15, 2)  // Computed
  remainder                  Decimal?  @db.Decimal(15, 2)  // Computed
  
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
  
  @@index([projectId])
  @@map("project_budgets")
}
```

### 2. ProjectEstimate (Small Works & Energy Efficiency)

Captures estimated costs from different sources:

```prisma
model ProjectEstimate {
  id            String   @id @default(uuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  estimatedCost Decimal  @db.Decimal(15, 2)
  estimateType  String   // 'SmallWorksEstimate' | 'EnergyEfficiencyEstimate' | 'Internal' | 'Vendor'
  asOfDate      DateTime?
  notes         String?  @db.Text
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([projectId])
  @@index([estimateType])
  @@map("project_estimates")
}
```

### 3. FundingAllocation (Multi-Source Projects)

Tracks which funding sources contribute to each project:

```prisma
model FundingAllocation {
  id        String   @id @default(uuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  source    String   // 'Bond' | 'Levy' | 'Grant' | 'Maint' | 'Other'
  year      Int?     // e.g., 2024, 2021
  amount    Decimal  @db.Decimal(15, 2)
  memo      String?  @db.Text
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([projectId])
  @@index([source])
  @@map("funding_allocations")
}
```

### 4. Transaction (Change Orders, Payments, Adjustments)

Tracks financial transactions that affect the budget:

```prisma
model Transaction {
  id        String   @id @default(uuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  kind      String   // 'ChangeOrder' | 'Payment' | 'Adjustment' | 'Credit'
  amount    Decimal  @db.Decimal(15, 2)
  memo      String?  @db.Text
  date      DateTime
  
  // Optional references
  vendorId  String?
  vendor    Vendor?  @relation(fields: [vendorId], references: [id])
  
  approvedBy  String?
  approver    User?  @relation("TransactionApprover", fields: [approvedBy], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([projectId])
  @@index([kind])
  @@index([date])
  @@map("transactions")
}
```

### 5. Extend Attachment Model

Already exists, but ensure it has `label` field:

```prisma
model Attachment {
  // ... existing fields ...
  label     String?  // For "source", "plan", "photo", etc.
}
```

## Index Strategy

Key indexes for performance:

```prisma
// Facility
@@index([code])           // Facility lookup by code
@@index([jurisdiction])   // Jurisdiction-based queries

// Project  
@@index([importKey])      // Idempotent import lookups
@@index([category])       // Category-based filtering
@@index([fundingProgram]) // Funding program aggregations

// ProjectBudget
@@index([projectId, asOfDate])  // Time-series queries

// ProjectEstimate
@@index([projectId, estimateType])  // Estimate type filtering

// Transaction
@@index([projectId, date])  // Transaction history
@@index([kind])             // Transaction type aggregations
```

## Migration Notes

1. **Add fields to existing models** first (Facility.taxRatePercent, Project extensions)
2. **Create new models** (ProjectBudget, ProjectEstimate, FundingAllocation, Transaction)
3. **Run migration** to update database
4. **Update Prisma client** and TypeScript types
5. **Seed existing data** may need updates to populate new fields

## Backward Compatibility

- All new fields are **optional** (`?`) to avoid breaking existing data
- Existing `Budget` model remains for original budget tracking
- New `ProjectBudget` model is for District-Wide style detailed breakdowns
- Both can coexist; queries can union them as needed

## Data Relationships

```
Organization
  ├── Facilities
  │   ├── Projects
  │   │   ├── Budget (original - simple)
  │   │   ├── ProjectBudget (new - detailed District-Wide style)
  │   │   ├── ProjectEstimate (Small Works estimates)
  │   │   ├── FundingAllocation (multi-source tracking)
  │   │   └── Transaction (change orders, payments)
  │   └── [taxRatePercent]
  └── FundingSources
```

## Calculation Flow

```
Import CSV → Upsert Project → Create/Update ProjectBudget
                                        ↓
                              Compute Derived Fields:
                                        ↓
                    salesTaxAmount = baseBidPlusAlts × (salesTaxRatePercent / 100)
                    constructionCostSubtotal = baseBidPlusAlts + changeOrdersTotal + salesTaxAmount
                    cpoManagementAmount = constructionCostSubtotal × (cpoManagementRatePercent / 100)
                    otherCostSubtotal = cpoManagementAmount + techMisc + consultants
                    totalProjectCost = constructionCostSubtotal + otherCostSubtotal
                    remainder = approvedBudgetTotal - totalProjectCost
                                        ↓
                              Save computed values
```

## Next Steps

1. Create migration file with new models
2. Implement calculation service (`services/budget-calculations.ts`)
3. Create CSV parsers for each format
4. Build import pipeline script
5. Add API endpoints for computed views
6. Update UI components to display District-Wide breakdowns
