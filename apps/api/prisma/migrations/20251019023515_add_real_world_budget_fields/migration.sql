-- DropIndex
DROP INDEX "budgets_projectId_key";

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "boardApprovedBudget" DECIMAL(15,2),
ADD COLUMN     "boardBudgetRemainder" DECIMAL(15,2),
ADD COLUMN     "levyAllocation" DECIMAL(15,2),
ADD COLUMN     "levyAllocationRemainder" DECIMAL(15,2),
ADD COLUMN     "mostCurrentEstimate" DECIMAL(15,2),
ADD COLUMN     "version" TEXT NOT NULL DEFAULT 'current';

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "jurisdiction" TEXT;

-- AlterTable
ALTER TABLE "funding_sources" ADD COLUMN     "totalAllocation" DECIMAL(15,2),
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "completionYear" INTEGER,
ADD COLUMN     "estimatedDate" TEXT,
ADD COLUMN     "jurisdiction" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" INTEGER;

-- CreateIndex
CREATE INDEX "budgets_version_idx" ON "budgets"("version");

-- CreateIndex
CREATE INDEX "facilities_code_idx" ON "facilities"("code");

-- CreateIndex
CREATE INDEX "funding_sources_year_idx" ON "funding_sources"("year");

-- CreateIndex
CREATE INDEX "projects_completionYear_idx" ON "projects"("completionYear");

-- CreateIndex
CREATE INDEX "projects_priority_idx" ON "projects"("priority");
