# Project Context: Capital Projects Budgets

## Executive Summary

This application enables Capital Projects Offices to plan, track, and report on capital project budgets across multiple facilities, funding sources (bonds/levies), and project types (small works vs. major projects). The system enforces strict role-based access control where only Directors can view all organizational data, while other users see only their assigned scope.

## Architecture Overview

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite for fast dev and optimized builds
- TanStack Query for server state management
- Zustand for client state (auth)
- React Router v6 for routing
- Tailwind CSS + shadcn/ui for styling
- Mobile-first responsive design

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM with PostgreSQL
- Passport.js with JWT strategy
- Row-level security via middleware
- WebSocket support for real-time updates

**Database:**
- PostgreSQL 14+
- Prisma schema with explicit relationships
- Audit logging for all mutations
- Optimized indexes for performance

**Infrastructure:**
- Monorepo with npm workspaces
- S3-compatible storage for attachments
- Docker support (optional)
- CI/CD with GitHub Actions

---

## Data Model

### Core Entities

#### Organization
```
top-level container for all data; supports multi-tenant architecture
```

#### User
```
email, password, role (Director/PM/Team/Finance/Contractor/Auditor), status
belongs to: Organization
```

#### Facility
```
school or administrative facility
fields: name, type (SCHOOL/FACILITY/ADMINISTRATIVE/OTHER), address, region, code
belongs to: Organization
has many: Projects
```

#### FundingSource
```
bond, levy, grant, or other funding mechanism
fields: name, type (BOND/LEVY/GRANT/OTHER), code, startDate, endDate
belongs to: Organization
has many: Projects
```

#### Project
```
capital project (small works or major)
fields: name, type (SMALL_WORKS/MAJOR), status (PLANNED/ACTIVE/ON_HOLD/CLOSED), 
       description, startDate, endDate
belongs to: Organization, Facility, FundingSource, ProjectManager (User)
has one: Budget
has many: CostEvents, Teams, Comments, Issues
```

#### Budget
```
financial plan for a project
fields: baselineAmount, revisedAmount, contingencyAmount, committedToDate,
        actualsToDate, forecastAtCompletion, variance, currency
one-to-one with: Project
has many: BudgetLines
```

#### BudgetLine
```
line item within a budget
fields: costCode, category (LABOR/MATERIALS/EQUIPMENT/PERMITS/DESIGN/CONTINGENCY/OTHER),
        description, baseline, revisionsTotal, committed, actuals, forecast, variance, tags[]
belongs to: Budget
has many: CostEvents (optional relation)
```

#### CostEvent
```
financial transaction (PO, Invoice, Change Order, Transfer, Credit)
fields: type (PO/INVOICE/CHANGE_ORDER/TRANSFER/CREDIT), amount, tax, date,
        status (DRAFT/SUBMITTED/APPROVED/DENIED/PAID), description
belongs to: Project, Vendor (optional), BudgetLine (optional), Attachment (optional),
           CreatedBy (User), ApprovedBy (User, optional)
```

#### Vendor
```
contractor or supplier
fields: name, contact, taxId
belongs to: Organization
has many: CostEvents
```

#### Team & TeamMember
```
project-scoped teams with members
Team: name, projectId
TeamMember: teamId, userId, roleOnTeam
```

#### Comment
```
project-scoped comments/notes
fields: body, visibility (INTERNAL/TEAM/ORG)
belongs to: Project, Author (User)
```

#### Issue (RFI)
```
request for information or issue tracker
fields: title, description, status (OPEN/IN_PROGRESS/RESOLVED/CLOSED),
        assigneeId, dueDate
belongs to: Project, Assignee (User), CreatedBy (User)
```

#### Attachment
```
file upload (S3)
fields: url, fileName, mimeType, size
belongs to: Organization, CreatedBy (User), optional Project
```

#### AuditLog
```
immutable record of all mutations
fields: entity, entityId, action (CREATE/UPDATE/DELETE/APPROVE/DENY/SUBMIT),
        diffJSON (before/after), createdAt
belongs to: Organization, Actor (User)
```

---

## Role-Based Access Control

### Roles & Permissions

| Role | Description | Access Scope |
|------|-------------|--------------|
| **DIRECTOR** | Org leadership | Full org-wide access; can see **all** projects and budgets |
| **PROJECT_MANAGER** | PM | Full control of **assigned** projects only |
| **TEAM_MEMBER** | Team contributor | Read/write on **assigned** projects only |
| **FINANCE** | Financial officer | View/approve financials org-wide; no project edit |
| **CONTRACTOR** | External vendor | Limited portal for **assigned** projects; submit only |
| **VIEWER** | Read-only | Read-only where assigned |
| **AUDITOR** | Compliance | Read-only org-wide + full audit log access |

### Enforcement

**Server-side (API)**:
1. All routes protected by `passport.authenticate('jwt')`
2. Role middleware (`requireDirector`, `requirePM`, `requireFinance`, etc.)
3. Permission checks in service layer via `hasProjectAccess()` and `getProjectPermissions()`
4. Queries auto-filtered by accessible project IDs for non-Directors

**Client-side (UI)**:
1. Protected routes check `isAuthenticated` in store
2. UI elements conditionally rendered based on role
3. Navigation guards prevent unauthorized access

### Critical Rule
**Only users with role `DIRECTOR` can view ALL projects and budgets.**  
All other users see only projects where they are:
- The assigned Project Manager, OR
- A Team Member

Finance/Auditor roles have special cross-project visibility for approvals and audits but cannot edit.

---

## Budget Calculation Logic

### Formulas

```typescript
// Per budget line and rolled up to project level:
committedToDate = sum(approved POs + approved change orders)
actualsToDate = sum(approved invoices)
revisedAmount = baseline + approved change orders - transfers + credits
forecastAtCompletion (FAC) = actualsToDate + (committedToDate - actualsToDate) + forecastUncommitted
variance = revisedAmount - FAC
percentSpent = (actualsToDate / revisedAmount) * 100
percentCommitted = (committedToDate / revisedAmount) * 100
```

### Triggers for Recalculation
- Cost event approved (PO, Invoice, Change Order)
- Budget line updated
- Change order finalized
- Transfers processed

---

## API Routes

### Base URL
`http://localhost:3001/api`

### Authentication
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/auth/login` | Login with email/password | ❌ | - |
| POST | `/auth/register` | Register (demo only) | ❌ | - |
| GET | `/auth/me` | Get current user | ✅ | Any |

### Users
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/users` | List org users | ✅ | Director |
| GET | `/users/:id` | Get user detail | ✅ | Director |
| POST | `/users` | Create user | ✅ | Director |
| PATCH | `/users/:id` | Update user | ✅ | Director |
| DELETE | `/users/:id` | Delete user | ✅ | Director |

### Facilities
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/facilities` | List facilities | ✅ | Any |
| GET | `/facilities/:id` | Get facility + projects | ✅ | Any (filtered) |
| POST | `/facilities` | Create facility | ✅ | Director |
| PATCH | `/facilities/:id` | Update facility | ✅ | Director |
| DELETE | `/facilities/:id` | Delete facility | ✅ | Director |

### Funding Sources
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/funding-sources` | List funding sources | ✅ | Any |
| GET | `/funding-sources/:id` | Get funding source + summary | ✅ | Any (filtered) |
| POST | `/funding-sources` | Create funding source | ✅ | Director |
| PATCH | `/funding-sources/:id` | Update funding source | ✅ | Director |
| DELETE | `/funding-sources/:id` | Delete funding source | ✅ | Director |

### Projects
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/projects` | List projects (filtered by access) | ✅ | Any |
| GET | `/projects/:id` | Get project detail | ✅ | HasAccess |
| POST | `/projects` | Create project | ✅ | Director/PM |
| PATCH | `/projects/:id` | Update project | ✅ | CanEdit |
| DELETE | `/projects/:id` | Delete project | ✅ | Director |

**Query params**: `?status=ACTIVE&type=MAJOR&facilityId=xxx&search=keyword`

### Budgets
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/projects/:id/budget` | Get project budget | ✅ | HasAccess |
| PATCH | `/projects/:id/budget` | Update budget | ✅ | CanEdit |
| GET | `/projects/:id/budget/lines` | List budget lines | ✅ | HasAccess |
| POST | `/projects/:id/budget/lines` | Create budget line | ✅ | CanEdit |
| PATCH | `/budget-lines/:id` | Update line | ✅ | CanEdit |
| DELETE | `/budget-lines/:id` | Delete line | ✅ | CanEdit |

### Cost Events
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/cost-events` | List (filtered by project access) | ✅ | Any |
| GET | `/cost-events/:id` | Get cost event | ✅ | HasAccess |
| POST | `/cost-events` | Create cost event | ✅ | CanEdit |
| PATCH | `/cost-events/:id` | Update cost event | ✅ | CanEdit |
| POST | `/cost-events/:id/approve` | Approve | ✅ | CanApprove |
| POST | `/cost-events/:id/deny` | Deny | ✅ | CanApprove |

**Query params**: `?type=INVOICE&status=SUBMITTED&dateFrom=2024-01-01&dateTo=2024-12-31`

### Vendors
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/vendors` | List vendors | ✅ | Any |
| POST | `/vendors` | Create vendor | ✅ | Director/Finance |

### Comments
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/projects/:id/comments` | List comments | ✅ | HasAccess |
| POST | `/projects/:id/comments` | Create comment | ✅ | CanEdit |

### Issues (RFIs)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/projects/:id/issues` | List issues | ✅ | HasAccess |
| POST | `/projects/:id/issues` | Create issue | ✅ | CanEdit |
| PATCH | `/issues/:id` | Update issue | ✅ | CanEdit |

### Reports
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/reports/org-summary` | Org-wide summary by funding source | ✅ | Director/Auditor |
| GET | `/reports/facility-summary/:id` | Facility summary | ✅ | HasAccess |
| GET | `/reports/project-status/:id` | Project status report | ✅ | HasAccess |
| POST | `/reports/export` | Export CSV/XLSX | ✅ | CanExport |

### Audit
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/audit` | List audit logs | ✅ | Director/Auditor |
| GET | `/audit/:entity/:entityId` | Logs for specific entity | ✅ | Director/Auditor |

---

## Frontend Structure

### Pages

| Route | Component | Description | Role Access |
|-------|-----------|-------------|-------------|
| `/auth` | AuthPage | Login with demo account picker | Public |
| `/` | DashboardPage | Role-aware landing (Director: org-wide; others: assigned) | Authenticated |
| `/facilities` | FacilitiesPage | List/search facilities | Authenticated |
| `/facilities/:id` | FacilityDetailPage | Facility detail + projects | Authenticated |
| `/funding-sources` | FundingSourcesPage | List funding sources | Authenticated |
| `/funding-sources/:id` | FundingSourceDetailPage | Funding source + summary | Authenticated |
| `/projects` | ProjectsPage | List/filter projects | Authenticated |
| `/projects/:id` | ProjectDetailPage | Project detail with tabs | HasAccess |
| `/projects/:id/budget` | (Tab) | Budget management | HasAccess |
| `/projects/:id/cost-events` | (Tab) | POs/Invoices/COs | HasAccess |
| `/projects/:id/team` | (Tab) | Team management | CanManageTeam |
| `/projects/:id/files` | (Tab) | Attachments | HasAccess |
| `/finance/approvals` | ApprovalsPage | Approval queue | Finance |
| `/reports` | ReportsPage | Generate/export reports | CanExport |
| `/admin/users` | UsersAdminPage | Manage users | Director |
| `/audit` | AuditPage | Audit log viewer | Director/Auditor |

### State Management

**Auth State (Zustand)**:
- `user`: Current user object
- `token`: JWT token
- `isAuthenticated`: Boolean
- `login(user, token)`: Set auth state
- `logout()`: Clear auth state

**Server State (TanStack Query)**:
- Projects, budgets, cost events, etc. fetched via API
- Automatic caching, refetching, and optimistic updates

### Key Components

**Layout Components**:
- `Layout`: Main app shell with header, nav, footer
- `ProtectedRoute`: Auth guard wrapper

**UI Components** (shadcn/ui based):
- `Button`, `Input`, `Card`, `Dialog`, `Select`, `Tabs`, etc.
- Mobile-optimized with Tailwind responsive utilities

**Domain Components**:
- `ProjectCard`: Project summary card
- `BudgetSummary`: Budget KPIs widget
- `CostEventList`: List of POs/Invoices/COs
- `ApprovalQueue`: Pending approvals list

---

## Mobile-First UX

### Responsive Breakpoints (Tailwind)
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

### Mobile Patterns
- Tables collapse to cards on small screens
- Sticky headers and bottom action bars
- Tap targets ≥44px
- Simplified navigation (hamburger menu on mobile)
- Progressive disclosure (show key info first, expand for details)

---

## Security & Compliance

### Authentication
- JWT tokens (7-day expiry by default)
- Secure password hashing with bcrypt (10 rounds)
- Token stored in localStorage (zustand persist)
- Auto-logout on 401 response

### Authorization
- Every API request validates JWT
- Role checked on every endpoint
- Project access verified via `hasProjectAccess()`
- Director bypass for org-wide queries

### Audit Trail
- All CREATE/UPDATE/DELETE actions logged
- Approval/Deny actions logged
- Actor, timestamp, before/after diff stored
- Immutable audit log (append-only)

### Data Validation
- Zod schemas for all inputs (client + server)
- Prisma prevents SQL injection (parameterized queries)
- File upload validation (type, size)

### CORS & Rate Limiting
- CORS restricted to frontend origin
- Rate limiting: 100 requests per 15 minutes per IP

---

## Testing Strategy

### Unit Tests (Vitest)
- Budget calculation logic
- Permission helpers
- Utility functions
- Component logic

### Integration Tests
- API endpoint tests
- Database interactions
- RBAC enforcement

### E2E Tests (Playwright)
- User login flows
- Project creation
- Cost event approval workflow
- Dashboard navigation

### Quality Bots (In-Repo Scripts)
1. **User Test Bot**: Playwright scenarios for common tasks
2. **UI Test Bot**: Visual regression checks
3. **UX Test Bot**: Lighthouse + accessibility audits
4. **QA Test Bot**: API contract tests + RBAC negative tests
5. **Aggregator**: Compiles bot outputs → `reports/quality/summary.md`

---

## Deployment Checklist

### Environment Variables
- [ ] `DATABASE_URL` configured
- [ ] `JWT_SECRET` set to secure random value
- [ ] `S3_*` variables for file uploads
- [ ] `CORS_ORIGIN` set to production domain
- [ ] `NODE_ENV=production`

### Database
- [ ] Migrations applied
- [ ] Seed data (if demo)
- [ ] Indexes optimized
- [ ] Backups configured

### API Server
- [ ] Build: `npm run build:api`
- [ ] Health check endpoint accessible
- [ ] Logging configured
- [ ] Rate limiting active
- [ ] HTTPS enabled

### Frontend
- [ ] Build: `npm run build:web`
- [ ] Environment variables set
- [ ] CDN for static assets (optional)
- [ ] Error tracking (Sentry, etc.)

### Monitoring
- [ ] API uptime monitoring
- [ ] Database performance monitoring
- [ ] Error alerts
- [ ] Audit log retention policy

---

## Future Enhancements

- [ ] Milestone Gantt charts
- [ ] Scheduled email reports
- [ ] Advanced filtering and saved views
- [ ] Real-time WebSocket notifications
- [ ] Mobile native app (React Native)
- [ ] Advanced analytics dashboard
- [ ] OCR for invoice scanning
- [ ] Integration with ERP systems

---

## Development Workflow

### Adding a New Feature

1. **Define**: Create issue/ticket with acceptance criteria
2. **Database**: Update Prisma schema if needed, migrate
3. **Backend**: Add/update API endpoints with RBAC
4. **Frontend**: Build UI components and pages
5. **Test**: Write unit + E2E tests
6. **Document**: Update this file and README
7. **Review**: PR with tests passing, code reviewed
8. **Deploy**: Merge to main, auto-deploy

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- No `any` types (use `unknown` and type guards)
- Functional components with hooks
- Descriptive variable names
- Comments for complex logic only

---

## Contact & Support

For questions, bugs, or feature requests, contact the development team or open an issue in the repository.

**Project Status**: ✅ **Scaffolded and ready for development**

**Last Updated**: October 18, 2025
