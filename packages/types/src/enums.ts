// User Roles
export enum UserRole {
  DIRECTOR = 'DIRECTOR',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  FINANCE = 'FINANCE',
  CONTRACTOR = 'CONTRACTOR',
  VIEWER = 'VIEWER',
  AUDITOR = 'AUDITOR',
}

// User Status
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

// Facility Types
export enum FacilityType {
  SCHOOL = 'SCHOOL',
  FACILITY = 'FACILITY',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  OTHER = 'OTHER',
}

// Funding Source Types
export enum FundingSourceType {
  BOND = 'BOND',
  LEVY = 'LEVY',
  GRANT = 'GRANT',
  OTHER = 'OTHER',
}

// Project Types
export enum ProjectType {
  SMALL_WORKS = 'SMALL_WORKS',
  MAJOR = 'MAJOR',
}

// Project Status
export enum ProjectStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
}

// Budget Line Categories
export enum BudgetLineCategory {
  LABOR = 'LABOR',
  MATERIALS = 'MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  PERMITS = 'PERMITS',
  DESIGN = 'DESIGN',
  CONTINGENCY = 'CONTINGENCY',
  OTHER = 'OTHER',
}

// Cost Event Types
export enum CostEventType {
  PO = 'PO', // Purchase Order
  INVOICE = 'INVOICE',
  CHANGE_ORDER = 'CHANGE_ORDER',
  TRANSFER = 'TRANSFER',
  CREDIT = 'CREDIT',
}

// Cost Event Status
export enum CostEventStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  PAID = 'PAID',
}

// Comment Visibility
export enum CommentVisibility {
  INTERNAL = 'INTERNAL',
  TEAM = 'TEAM',
  ORG = 'ORG',
}

// RFI/Issue Status
export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// Audit Actions
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  DENY = 'DENY',
  SUBMIT = 'SUBMIT',
}

// Currency
export const DEFAULT_CURRENCY = 'USD';
