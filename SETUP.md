# Quick Setup Guide

Follow these steps to get the Capital Projects Budgets app running on your machine.

## Prerequisites

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: Version 14 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control
- **Code Editor**: VS Code recommended

## Step-by-Step Setup

### 1. Install Dependencies

Open PowerShell in the project root directory:

```powershell
cd "d:\Git\CPO budget app"
npm install
```

This will install all dependencies for the monorepo (API, web, and shared packages).

### 2. Set Up PostgreSQL Database

Create a new database for the application:

```powershell
# Using psql (PostgreSQL command line)
psql -U postgres

# In psql:
CREATE DATABASE cpo_budgets;
CREATE USER cpo_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cpo_budgets TO cpo_user;
\q
```

### 3. Configure Environment Variables

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env with your favorite editor
notepad .env
```

**Update these critical variables:**

```env
# Database connection
DATABASE_URL="postgresql://cpo_user:your_secure_password@localhost:5432/cpo_budgets?schema=public"

# JWT secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Session secret
SESSION_SECRET=your-super-secret-session-key-change-in-production
```

> **Tip**: Generate secure secrets with:
> ```powershell
> # PowerShell command to generate random string
> -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
> ```

### 4. Set Up Database Schema

```powershell
# Navigate to API directory
cd apps\api

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Go back to root
cd ..\..
```

When prompted for a migration name, enter: `init`

### 5. Seed Demo Data

```powershell
cd apps\api
npm run db:seed
cd ..\..
```

This creates:
- 1 demo organization
- 8 demo users (all roles)
- 4 facilities
- 2 funding sources (1 bond, 1 levy)
- 3 sample projects with budgets and teams

### 6. Start Development Servers

From the project root:

```powershell
# Start both API and web servers
npm run dev:all
```

Or start them separately in different terminals:

```powershell
# Terminal 1: API Server
npm run dev:api

# Terminal 2: Web Frontend
npm run dev:web
```

### 7. Access the Application

- **Web App**: Open http://localhost:5173 in your browser
- **API**: Running at http://localhost:3001
- **API Health**: http://localhost:3001/health

### 8. Login with Demo Accounts

On the login page (http://localhost:5173/auth), click any demo account button to auto-populate credentials:

- **Director**: `director@cpo.app` / `Demo!Pass1`
- **Finance**: `finance@cpo.app` / `Demo!Pass1`
- **Project Manager**: `pm1@cpo.app` / `Demo!Pass1`
- **Team Member**: `team1@cpo.app` / `Demo!Pass1`

## Troubleshooting

### "Cannot connect to database"

- Ensure PostgreSQL is running: `Get-Service postgresql*`
- Check DATABASE_URL in `.env` matches your setup
- Verify database exists: `psql -U postgres -l`

### "Module not found" errors

- Run `npm install` in the root directory
- Clear node_modules and reinstall: `Remove-Item -Recurse -Force node_modules; npm install`

### Port already in use

- Change API_PORT in `.env` (default 3001)
- Or kill the process using the port:
  ```powershell
  # Find process on port 3001
  netstat -ano | findstr :3001
  # Kill it (replace PID with actual process ID)
  taskkill /PID <PID> /F
  ```

### Prisma Client errors

- Regenerate client: `cd apps\api; npm run db:generate`
- Reset database: `npm run db:reset` (⚠️ This deletes all data!)

### TypeScript errors in VS Code

- Ensure VS Code is using workspace TypeScript version
- Reload window: `Ctrl+Shift+P` → "Reload Window"
- Run `npm run build` to check for actual errors

## Development Tools

### Prisma Studio

Visual database editor:

```powershell
cd apps\api
npm run db:studio
```

Opens at http://localhost:5555

### Database Reset

To start fresh with clean demo data:

```powershell
cd apps\api
npm run db:reset
cd ..\..
```

⚠️ **Warning**: This deletes all data and re-seeds!

### Linting and Formatting

```powershell
# Lint all code
npm run lint

# Format all code
npm run format
```

## Next Steps

1. ✅ Application is running
2. 🔐 Test different user roles
3. 📊 Explore the dashboard
4. 🏗️ View facilities and projects
5. 💰 Check budget management features

## Need Help?

- Check `README.md` for full documentation
- Review `PROJECT_CONTEXT.md` for architecture details
- Search existing issues in the repository
- Contact the development team

---

**Congratulations! Your development environment is ready.** 🎉

Start building features or exploring the codebase!
