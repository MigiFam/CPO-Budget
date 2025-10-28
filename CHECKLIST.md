# Development Checklist

Use this checklist to track implementation progress.

## ✅ Phase 1: Core Infrastructure (COMPLETED)

- [x] Monorepo setup with npm workspaces
- [x] TypeScript, ESLint, Prettier configuration
- [x] Prisma schema for all entities
- [x] JWT authentication + Passport.js
- [x] RBAC middleware and permission helpers
- [x] React + Vite + Tailwind setup
- [x] Basic UI components (Button, Input, Card)
- [x] Auth page with demo accounts
- [x] Dashboard page skeleton
- [x] Documentation (README, PROJECT_CONTEXT, SETUP, STATUS)
- [x] Database seed script
- [x] GitHub Actions CI workflow

---

## 🚧 Phase 2: Core Features (IN PROGRESS)

### Backend API Implementation

#### Facilities
- [ ] GET /facilities - List with filters
- [ ] GET /facilities/:id - Detail + projects
- [ ] POST /facilities - Create (Director only)
- [ ] PATCH /facilities/:id - Update
- [ ] DELETE /facilities/:id - Delete
- [ ] Add audit logging to all mutations

#### Funding Sources
- [ ] GET /funding-sources - List
- [ ] GET /funding-sources/:id - Detail with project summary
- [ ] POST /funding-sources - Create
- [ ] PATCH /funding-sources/:id - Update
- [ ] DELETE /funding-sources/:id - Delete
- [ ] Calculate totals across projects

#### Projects
- [ ] GET /projects - List filtered by user access
- [ ] GET /projects/:id - Detail with access check
- [ ] POST /projects - Create with PM assignment
- [ ] PATCH /projects/:id - Update with permission check
- [ ] DELETE /projects/:id - Delete (Director only)
- [ ] Add query filters (status, type, facility, PM)
- [ ] Return accessible projects only for non-Directors

#### Budgets
- [ ] GET /projects/:id/budget - Get project budget
- [ ] PATCH /projects/:id/budget - Update budget
- [ ] GET /projects/:id/budget/lines - List budget lines
- [ ] POST /projects/:id/budget/lines - Create line
- [ ] PATCH /budget-lines/:id - Update line
- [ ] DELETE /budget-lines/:id - Delete line
- [ ] Implement budget calculation service
- [ ] Add unit tests for calculations
- [ ] Trigger recalculation on cost event approval

#### Cost Events
- [ ] GET /cost-events - List filtered by access
- [ ] GET /cost-events/:id - Get detail
- [ ] POST /cost-events - Create (draft status)
- [ ] PATCH /cost-events/:id - Update (if not approved)
- [ ] POST /cost-events/:id/submit - Submit for approval
- [ ] POST /cost-events/:id/approve - Approve (Finance/Director)
- [ ] POST /cost-events/:id/deny - Deny
- [ ] Implement approval workflow state machine
- [ ] Trigger budget recalculation on approve
- [ ] Add validation for amounts and dates

#### Vendors
- [ ] GET /vendors - List org vendors
- [ ] POST /vendors - Create vendor
- [ ] PATCH /vendors/:id - Update
- [ ] DELETE /vendors/:id - Delete

#### Comments
- [ ] GET /projects/:id/comments - List comments
- [ ] POST /projects/:id/comments - Create comment
- [ ] PATCH /comments/:id - Update (author only)
- [ ] DELETE /comments/:id - Delete (author/Director)
- [ ] Filter by visibility (internal/team/org)
- [ ] Implement @mention parsing

#### Issues (RFIs)
- [ ] GET /projects/:id/issues - List issues
- [ ] POST /projects/:id/issues - Create issue
- [ ] PATCH /issues/:id - Update issue
- [ ] PATCH /issues/:id/status - Change status
- [ ] PATCH /issues/:id/assign - Assign to user
- [ ] Delete /issues/:id - Delete

#### Reports
- [ ] GET /reports/org-summary - Org-wide by funding source
- [ ] GET /reports/facility-summary/:id - Facility roll-up
- [ ] GET /reports/project-status/:id - Project report
- [ ] POST /reports/export - CSV export
- [ ] POST /reports/export-xlsx - XLSX export
- [ ] Implement funding source roll-up logic
- [ ] Implement facility roll-up logic

#### Audit
- [ ] GET /audit - List audit logs (Director/Auditor)
- [ ] GET /audit/:entity/:entityId - Entity-specific logs
- [ ] Add pagination for audit logs

### Frontend Implementation

#### Components
- [ ] DataTable component with mobile responsive cards
- [ ] Modal/Dialog for forms
- [ ] Select/Dropdown components
- [ ] DatePicker component
- [ ] Badge/Chip component
- [ ] Toast/notification system
- [ ] Loading skeletons
- [ ] Error boundaries

#### Pages - Facilities
- [ ] FacilitiesPage - List with search/filter
- [ ] FacilityDetailPage - Detail + projects list
- [ ] FacilityForm - Create/edit modal

#### Pages - Funding Sources
- [ ] FundingSourcesPage - List by type
- [ ] FundingSourceDetailPage - Summary with charts
- [ ] FundingSourceForm - Create/edit

#### Pages - Projects
- [ ] ProjectsPage - List with filters
- [ ] ProjectDetailPage - Tabs layout
  - [ ] Overview tab
  - [ ] Budget tab
  - [ ] Cost Events tab
  - [ ] Team tab
  - [ ] Files tab
  - [ ] Activity tab
- [ ] ProjectForm - Create/edit

#### Pages - Budget Management
- [ ] BudgetOverview - Summary KPIs
- [ ] BudgetLinesTable - CRUD for lines
- [ ] BudgetLineForm - Create/edit line
- [ ] BudgetCalculations - Display formulas and results

#### Pages - Cost Events
- [ ] CostEventsPage - List with filters
- [ ] CostEventForm - Create/edit (type-specific fields)
- [ ] CostEventDetail - View with attachments
- [ ] ApprovalQueue - For Finance users

#### Pages - Reports
- [ ] ReportsPage - Select report type
- [ ] OrgSummaryReport - By funding source
- [ ] FacilitySummaryReport - By facility
- [ ] ProjectStatusReport - Single project
- [ ] ExportDialog - Choose format (CSV/XLSX/PDF)

#### Pages - Admin
- [ ] UsersPage - List users (Director)
- [ ] UserForm - Create/edit user
- [ ] RoleAssignment - Assign roles

#### Pages - Audit
- [ ] AuditLogPage - Searchable log viewer
- [ ] AuditLogFilters - Filter by entity, action, date
- [ ] AuditLogDetail - Diff viewer

#### React Query Hooks
- [ ] useProjects(filters)
- [ ] useProject(id)
- [ ] useBudget(projectId)
- [ ] useBudgetLines(budgetId)
- [ ] useCreateBudgetLine()
- [ ] useUpdateBudgetLine()
- [ ] useCostEvents(filters)
- [ ] useCreateCostEvent()
- [ ] useApproveCostEvent()
- [ ] useFacilities(filters)
- [ ] useFundingSources(filters)
- [ ] useComments(projectId)
- [ ] useIssues(projectId)
- [ ] useAuditLogs(filters)

---

## 🚀 Phase 3: Enhanced Features

### File Uploads
- [ ] S3 client setup (or local storage)
- [ ] Presigned URL generation endpoint
- [ ] File upload component (drag & drop)
- [ ] Attachment list/preview component
- [ ] File type validation
- [ ] File size limits
- [ ] Virus scanning placeholder

### Team Management
- [ ] Team list on project detail
- [ ] Add team member form
- [ ] Remove team member action
- [ ] Role-on-team assignment
- [ ] Email invitation workflow (placeholder)

### Real-time Updates
- [ ] WebSocket server setup
- [ ] Client-side WebSocket hook
- [ ] Comment live notifications
- [ ] Status change broadcasts
- [ ] User presence indicators

### Advanced Dashboards
- [ ] Chart components (bar, line, pie)
- [ ] Director dashboard with funding source cards
- [ ] PM dashboard with assigned projects
- [ ] Finance dashboard with approval queue
- [ ] Risk indicators (over-budget projects)
- [ ] Sparkline trend charts

### Contractor Portal
- [ ] Separate layout for contractors
- [ ] Restricted project view
- [ ] Submit bid form
- [ ] Invoice submission form
- [ ] Progress update form

---

## 🧪 Phase 4: Testing & Quality

### Unit Tests
- [ ] Budget calculation functions
- [ ] Permission helper functions
- [ ] Utility functions (formatCurrency, etc.)
- [ ] Zod schema validation
- [ ] React component unit tests

### Integration Tests
- [ ] Auth flow tests
- [ ] Project CRUD tests
- [ ] Budget calculation integration
- [ ] Cost event approval workflow
- [ ] RBAC enforcement tests

### E2E Tests (Playwright)
- [ ] User login flow (all roles)
- [ ] Director: view all projects
- [ ] PM: create and manage project
- [ ] Team member: view assigned project
- [ ] Finance: approve cost event
- [ ] Contractor: submit invoice
- [ ] Mobile responsive tests

### Quality Bots
- [ ] User Test Bot - Scenario runner
- [ ] UI Test Bot - Visual regression
- [ ] UX Test Bot - Lighthouse + a11y
- [ ] QA Test Bot - API contract tests
- [ ] Aggregator - Compile bot reports

---

## 🎨 Phase 5: Polish & UX

### Mobile Optimization
- [ ] Test all pages on 375px viewport
- [ ] Table → card transformations
- [ ] Bottom action bars
- [ ] Touch-friendly interactions
- [ ] Swipe gestures for navigation

### Accessibility
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Focus management in modals
- [ ] Screen reader testing
- [ ] WCAG AA compliance

### Performance
- [ ] Code splitting for routes
- [ ] Image optimization
- [ ] API response caching
- [ ] Debounced search inputs
- [ ] Lazy loading for large lists

### Error Handling
- [ ] Global error boundary
- [ ] Network error handling
- [ ] Form validation errors
- [ ] API error messages
- [ ] Retry logic for failed requests

---

## 🚢 Phase 6: Deployment

### Production Setup
- [ ] Environment variables secured
- [ ] Database migrations on production
- [ ] SSL certificates
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Logging infrastructure

### Monitoring
- [ ] API uptime monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Database query performance
- [ ] User analytics (optional)

### Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User manual
- [ ] Admin guide
- [ ] Deployment guide
- [ ] Troubleshooting guide

### DevOps
- [ ] Docker Compose for local dev
- [ ] Dockerfile for API
- [ ] Dockerfile for web
- [ ] CI/CD pipeline for deployment
- [ ] Automated backups

---

## 📊 Progress Tracking

Update this section as you complete items:

**Phase 1 (Infrastructure)**: ✅ 100% (12/12)  
**Phase 2 (Core Features)**: ⏳ 0% (0/100+)  
**Phase 3 (Enhanced Features)**: ⏳ 0% (0/30)  
**Phase 4 (Testing & Quality)**: ⏳ 0% (0/20)  
**Phase 5 (Polish & UX)**: ⏳ 0% (0/15)  
**Phase 6 (Deployment)**: ⏳ 0% (0/15)

**Overall**: ~6% Complete

---

## 🎯 This Week's Goals

Set weekly goals here:

### Week 1 (Current)
- [ ] Install dependencies and set up database
- [ ] Implement Facilities CRUD (backend + frontend)
- [ ] Implement Projects list with RBAC filtering
- [ ] Test with all demo accounts

### Week 2
- [ ] Budget management (backend + frontend)
- [ ] Cost events CRUD
- [ ] Approval workflow

### Week 3
- [ ] Dashboards with real data
- [ ] Reports and exports
- [ ] Team management

---

**Use this checklist to stay organized and track progress. Update it as you go!** ✅
