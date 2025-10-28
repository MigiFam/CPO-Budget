import { z } from 'zod';
import * as schemas from './schemas';

// Inferred Types from Schemas
export type User = z.infer<typeof schemas.userSchema>;
export type CreateUser = z.infer<typeof schemas.createUserSchema>;
export type UpdateUser = z.infer<typeof schemas.updateUserSchema>;

export type Organization = z.infer<typeof schemas.organizationSchema>;

export type Facility = z.infer<typeof schemas.facilitySchema>;
export type CreateFacility = z.infer<typeof schemas.createFacilitySchema>;

export type FundingSource = z.infer<typeof schemas.fundingSourceSchema>;
export type CreateFundingSource = z.infer<typeof schemas.createFundingSourceSchema>;

export type Project = z.infer<typeof schemas.projectSchema>;
export type CreateProject = z.infer<typeof schemas.createProjectSchema>;
export type UpdateProject = z.infer<typeof schemas.updateProjectSchema>;

export type Budget = z.infer<typeof schemas.budgetSchema>;
export type UpdateBudget = z.infer<typeof schemas.updateBudgetSchema>;

export type BudgetLine = z.infer<typeof schemas.budgetLineSchema>;
export type CreateBudgetLine = z.infer<typeof schemas.createBudgetLineSchema>;
export type UpdateBudgetLine = z.infer<typeof schemas.updateBudgetLineSchema>;

export type CostEvent = z.infer<typeof schemas.costEventSchema>;
export type CreateCostEvent = z.infer<typeof schemas.createCostEventSchema>;
export type UpdateCostEventStatus = z.infer<typeof schemas.updateCostEventStatusSchema>;

export type Vendor = z.infer<typeof schemas.vendorSchema>;
export type CreateVendor = z.infer<typeof schemas.createVendorSchema>;

export type Comment = z.infer<typeof schemas.commentSchema>;
export type CreateComment = z.infer<typeof schemas.createCommentSchema>;

export type Issue = z.infer<typeof schemas.issueSchema>;
export type CreateIssue = z.infer<typeof schemas.createIssueSchema>;

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Dashboard Types
export interface FundingSourceSummary {
  fundingSource: FundingSource;
  totalBaseline: number;
  totalRevised: number;
  totalCommitted: number;
  totalActuals: number;
  totalForecast: number;
  totalVariance: number;
  projectCount: number;
  facilitiesCount: number;
}

export interface FacilitySummary {
  facility: Facility;
  totalBaseline: number;
  totalRevised: number;
  totalCommitted: number;
  totalActuals: number;
  totalForecast: number;
  totalVariance: number;
  projectCount: number;
}

export interface ProjectSummary extends Project {
  facility: Facility;
  fundingSource: FundingSource;
  budget: Budget;
  projectManager?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface BudgetCalculation {
  baselineAmount: number;
  revisedAmount: number;
  committedToDate: number;
  actualsToDate: number;
  forecastAtCompletion: number;
  variance: number;
  percentSpent: number;
  percentCommitted: number;
}

// Permission Types
export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  canManageTeam: boolean;
}

export interface UserContext {
  user: User;
  organization: Organization;
  permissions: Record<string, Permission>;
}

// Filter Types
export interface ProjectFilters {
  status?: string[];
  type?: string[];
  facilityId?: string;
  fundingSourceId?: string;
  projectManagerId?: string;
  search?: string;
}

export interface CostEventFilters {
  type?: string[];
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Report Types
export interface ReportParams {
  fundingSourceId?: string;
  facilityId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: 'csv' | 'xlsx' | 'pdf';
}
