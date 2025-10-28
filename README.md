# Capital Projects Budgets Application

A production-ready application for planning, tracking, and reporting capital project budgets across schools and facilities.

## Features

- **Role-Based Access Control (RBAC)**: Director, Project Manager, Team Member, Finance, Contractor, Viewer/Auditor roles
- **Combined Dashboard**: View budgets by bond/levy with facility roll-ups
- **Budget Management**: Track baseline, committed, actuals, and forecast at completion
- **Cost Events**: POs, invoices, change orders with approval workflows
- **Team Collaboration**: Comments, @mentions, real-time updates
- **Audit Trail**: Complete history of all changes
- **Mobile-First**: Responsive design works great on phones
- **Secure**: JWT authentication, row-level security, audit logging

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite for build tooling
- React Router for routing
- TanStack Query for data fetching
- Tailwind CSS + shadcn/ui for styling
- Zustand for state management

### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Passport.js + JWT for authentication
- WebSockets for real-time updates

### Infrastructure
- Docker support
- PostgreSQL database
- S3-compatible storage for attachments

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- (Optional) Docker

### Installation

1. **Clone and install dependencies**

```powershell
cd "d:\Git\CPO budget app"
npm install
```

2. **Set up environment variables**

```powershell
Copy-Item .env.example .env
# Edit .env with your database credentials and secrets
```

3. **Initialize database**

```powershell
# Navigate to API directory
cd apps\api

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

4. **Start development servers**

In the root directory:

```powershell
# Start both API and web servers
npm run dev:all

# Or start them separately:
npm run dev:api   # API on port 3001
npm run dev:web   # Frontend on port 5173
```

5. **Access the application**

- **Web App**: http://localhost:5173
- **API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

### Demo Accounts

After seeding the database, use these accounts to test different roles:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Director | director@cpo.app | Demo!Pass1 | Full org access, all projects |
| Finance | finance@cpo.app | Demo!Pass1 | Financial approvals, reports |
| Project Manager | pm1@cpo.app | Demo!Pass1 | Assigned projects management |
| Project Manager | pm2@cpo.app | Demo!Pass1 | Assigned projects management |
| Team Member | team1@cpo.app | Demo!Pass1 | Read/write on assigned projects |
| Team Member | team2@cpo.app | Demo!Pass1 | Read/write on assigned projects |
| Contractor | contractor@cpo.app | Demo!Pass1 | Limited project portal |
| Auditor | auditor@cpo.app | Demo!Pass1 | Read-only + audit logs |

**On the login page**, click any demo account to auto-populate and sign in!

## Project Structure

```
capital-projects-budgets/
├── apps/
│   ├── api/                    # Express API server
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── middleware/     # Auth, RBAC, error handling
│   │   │   ├── lib/            # Prisma, utilities
│   │   │   └── index.ts        # Server entry point
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── seed.ts         # Demo data seeder
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Page components
│       │   ├── lib/            # API client, utils
│       │   ├── store/          # State management
│       │   └── main.tsx        # App entry point
│       └── index.html
├── packages/
│   ├── types/                  # Shared TypeScript types
│   │   └── src/
│   │       ├── enums.ts
│   │       ├── schemas.ts      # Zod validation schemas
│   │       └── types.ts
│   └── ui/                     # (Future) Shared UI components
└── package.json                # Monorepo root
```

## Development Scripts

### Root (all packages)
```powershell
npm run dev            # Start all dev servers
npm run dev:all        # Start API + web concurrently
npm run dev:api        # Start API only
npm run dev:web        # Start web only
npm run build          # Build all packages
npm run lint           # Lint all packages
npm run format         # Format code with Prettier
npm test               # Run all tests
npm run test:unit      # Unit tests (Vitest)
npm run test:e2e       # E2E tests (Playwright)
```

### API (apps/api)
```powershell
npm run dev            # Start dev server with watch
npm run build          # Build TypeScript
npm start              # Run production build
npm run db:migrate     # Run Prisma migrations
npm run db:seed        # Seed demo data
npm run db:reset       # Reset database and reseed
npm run db:studio      # Open Prisma Studio
npm run db:generate    # Generate Prisma client
```

### Web (apps/web)
```powershell
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Lint frontend code
```

## Feature Flags

Set `VITE_DATA_MODE` in `.env`:

- **`mock`**: Use mock data (no API calls)
- **`demo`**: Use seeded demo database (default)
- **`live`**: Use production database

## API Endpoints

Base URL: `http://localhost:3001/api`

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user (demo only)
- `GET /auth/me` - Get current user

### Resources (all require authentication)
- `/facilities` - Facilities CRUD
- `/funding-sources` - Funding sources (bonds/levies)
- `/projects` - Projects with RBAC filtering
- `/budgets` - Budget management
- `/cost-events` - POs, invoices, change orders
- `/vendors` - Vendor management
- `/comments` - Project comments
- `/issues` - RFIs and issues
- `/reports` - Export and report generation
- `/audit` - Audit logs (Director/Auditor only)

See `PROJECT_CONTEXT.md` for detailed API documentation.

## Role-Based Access Control

### Permission Matrix

| Role | View All Projects | Edit Projects | Approve Financials | Manage Users | Export Reports |
|------|------------------|---------------|-------------------|--------------|----------------|
| **Director** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Project Manager** | Own only | ✅ Own | ✅ Own | ❌ | ✅ Own |
| **Team Member** | Assigned | ✅ Assigned | ❌ | ❌ | ❌ |
| **Finance** | All | ❌ | ✅ | ❌ | ✅ |
| **Contractor** | Assigned | Limited | ❌ | ❌ | ❌ |
| **Auditor** | All | ❌ | ❌ | ❌ | ✅ |

**Key Rule**: Only **Director** can see **all** projects and budgets. Others see only what they're assigned to.

## Testing

### Unit Tests
```powershell
npm run test:unit
```

### E2E Tests
```powershell
npm run test:e2e
```

### Quality Bots (TODO)
```powershell
npm run bot:user-test      # User scenario tests
npm run bot:ui-test        # Visual regression
npm run bot:ux-test        # Lighthouse + accessibility
npm run bot:qa-test        # API contract tests
npm run bot:aggregate      # Compile all bot reports
```

## Deployment

### Build for Production

```powershell
# Build all packages
npm run build

# Build API only
npm run build:api

# Build web only
npm run build:web
```

### Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `S3_*` - S3 configuration for file uploads
- `CORS_ORIGIN` - Allowed frontend origin

### Docker (TODO)

```powershell
docker-compose up
```

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `npm run lint` and `npm run format`
4. Submit PR

## Security

- All API endpoints require authentication
- Row-level security enforced via RBAC middleware
- Sensitive data encrypted in transit (HTTPS)
- All mutations logged to audit trail
- Input validation with Zod schemas
- SQL injection prevention via Prisma parameterized queries

## License

Proprietary - Capital Projects Office

## Support

For questions or issues, contact the development team or open an issue in the repository.

---

**Current Status**: ✅ Project scaffolded and ready for development

**Next Steps**:
1. Install dependencies: `npm install`
2. Set up database and run migrations
3. Seed demo data
4. Start dev servers: `npm run dev:all`
5. Login with demo accounts at http://localhost:5173/auth
