/*
  Warnings:

  - A unique constraint covering the columns `[importKey]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "taxRatePercent" DECIMAL(5,3);

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "category" TEXT,
ADD COLUMN     "fundingProgram" TEXT,
ADD COLUMN     "importKey" TEXT;

-- CreateTable
CREATE TABLE "project_budgets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3),
    "approvedBudgetTotal" DECIMAL(15,2),
    "baseBidPlusAlts" DECIMAL(15,2),
    "changeOrdersTotal" DECIMAL(15,2),
    "salesTaxRatePercent" DECIMAL(5,3),
    "cpoManagementRatePercent" DECIMAL(5,3),
    "techMisc" DECIMAL(15,2),
    "consultants" DECIMAL(15,2),
    "salesTaxAmount" DECIMAL(15,2),
    "constructionCostSubtotal" DECIMAL(15,2),
    "cpoManagementAmount" DECIMAL(15,2),
    "otherCostSubtotal" DECIMAL(15,2),
    "totalProjectCost" DECIMAL(15,2),
    "remainder" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_estimates" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "estimatedCost" DECIMAL(15,2) NOT NULL,
    "estimateType" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_allocations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "year" INTEGER,
    "amount" DECIMAL(15,2) NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funding_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "memo" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_budgets_projectId_idx" ON "project_budgets"("projectId");

-- CreateIndex
CREATE INDEX "project_budgets_asOfDate_idx" ON "project_budgets"("asOfDate");

-- CreateIndex
CREATE INDEX "project_estimates_projectId_idx" ON "project_estimates"("projectId");

-- CreateIndex
CREATE INDEX "project_estimates_estimateType_idx" ON "project_estimates"("estimateType");

-- CreateIndex
CREATE INDEX "funding_allocations_projectId_idx" ON "funding_allocations"("projectId");

-- CreateIndex
CREATE INDEX "funding_allocations_source_idx" ON "funding_allocations"("source");

-- CreateIndex
CREATE INDEX "transactions_projectId_idx" ON "transactions"("projectId");

-- CreateIndex
CREATE INDEX "transactions_kind_idx" ON "transactions"("kind");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "facilities_jurisdiction_idx" ON "facilities"("jurisdiction");

-- CreateIndex
CREATE UNIQUE INDEX "projects_importKey_key" ON "projects"("importKey");

-- AddForeignKey
ALTER TABLE "project_budgets" ADD CONSTRAINT "project_budgets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_estimates" ADD CONSTRAINT "project_estimates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_allocations" ADD CONSTRAINT "funding_allocations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
