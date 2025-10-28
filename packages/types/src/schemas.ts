import { z } from 'zod';
import {
  UserRole,
  UserStatus,
  FacilityType,
  FundingSourceType,
  ProjectType,
  ProjectStatus,
  BudgetLineCategory,
  CostEventType,
  CostEventStatus,
  CommentVisibility,
  IssueStatus,
} from './enums';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).optional(),
});

// User Schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  organizationId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  organizationId: z.string().uuid(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

// Organization Schema
export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Facility Schemas
export const facilitySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  type: z.nativeEnum(FacilityType),
  address: z.string().optional(),
  region: z.string().optional(),
  code: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createFacilitySchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(FacilityType),
  address: z.string().optional(),
  region: z.string().optional(),
  code: z.string().optional(),
});

// Funding Source Schemas
export const fundingSourceSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  type: z.nativeEnum(FundingSourceType),
  code: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createFundingSourceSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(FundingSourceType),
  code: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Project Schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  facilityId: z.string().uuid(),
  fundingSourceId: z.string().uuid(),
  name: z.string(),
  type: z.nativeEnum(ProjectType),
  status: z.nativeEnum(ProjectStatus),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  projectManagerId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProjectSchema = z.object({
  facilityId: z.string().uuid(),
  fundingSourceId: z.string().uuid(),
  name: z.string().min(2),
  type: z.nativeEnum(ProjectType),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  projectManagerId: z.string().uuid().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  projectManagerId: z.string().uuid().optional(),
});

// Budget Schemas
export const budgetSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  baselineAmount: z.number(),
  revisedAmount: z.number(),
  contingencyAmount: z.number(),
  committedToDate: z.number(),
  actualsToDate: z.number(),
  forecastAtCompletion: z.number(),
  variance: z.number(),
  currency: z.string().default('USD'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateBudgetSchema = z.object({
  baselineAmount: z.number().optional(),
  contingencyAmount: z.number().optional(),
});

// Budget Line Schemas
export const budgetLineSchema = z.object({
  id: z.string().uuid(),
  budgetId: z.string().uuid(),
  costCode: z.string(),
  category: z.nativeEnum(BudgetLineCategory),
  description: z.string(),
  baseline: z.number(),
  revisionsTotal: z.number(),
  committed: z.number(),
  actuals: z.number(),
  forecast: z.number(),
  variance: z.number(),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createBudgetLineSchema = z.object({
  budgetId: z.string().uuid(),
  costCode: z.string(),
  category: z.nativeEnum(BudgetLineCategory),
  description: z.string(),
  baseline: z.number().min(0),
  tags: z.array(z.string()).optional(),
});

export const updateBudgetLineSchema = z.object({
  costCode: z.string().optional(),
  category: z.nativeEnum(BudgetLineCategory).optional(),
  description: z.string().optional(),
  baseline: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

// Cost Event Schemas
export const costEventSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  type: z.nativeEnum(CostEventType),
  vendorId: z.string().uuid().optional(),
  amount: z.number(),
  tax: z.number().default(0),
  date: z.date(),
  status: z.nativeEnum(CostEventStatus),
  relatedBudgetLineId: z.string().uuid().optional(),
  attachmentId: z.string().uuid().optional(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCostEventSchema = z.object({
  projectId: z.string().uuid(),
  type: z.nativeEnum(CostEventType),
  vendorId: z.string().uuid().optional(),
  amount: z.number(),
  tax: z.number().optional(),
  date: z.string().datetime(),
  relatedBudgetLineId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const updateCostEventStatusSchema = z.object({
  status: z.nativeEnum(CostEventStatus),
  notes: z.string().optional(),
});

// Vendor Schema
export const vendorSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  contact: z.string().optional(),
  taxId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createVendorSchema = z.object({
  name: z.string().min(2),
  contact: z.string().optional(),
  taxId: z.string().optional(),
});

// Comment Schema
export const commentSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.string(),
  visibility: z.nativeEnum(CommentVisibility),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCommentSchema = z.object({
  projectId: z.string().uuid(),
  body: z.string().min(1),
  visibility: z.nativeEnum(CommentVisibility),
});

// Issue/RFI Schema
export const issueSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.nativeEnum(IssueStatus),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createIssueSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});
