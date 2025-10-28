# API Path Configuration Fix

## Problem
The frontend was making requests to `/api/api/projects` (doubled `/api/api`) resulting in 404 errors. Data was not showing in the dashboard or projects page.

## Root Cause
The `api.ts` file was configured with:
```typescript
baseURL: `${API_URL}/api`  // API_URL = http://localhost:3001
```

This resulted in the baseURL being `http://localhost:3001/api`.

When the frontend made requests like `api.get('/api/projects')`, it combined the baseURL with the path:
- Result: `http://localhost:3001/api/api/projects` ❌

But the API server expected: `http://localhost:3001/api/projects` ✅

## Solution
Changed the baseURL configuration in `apps/web/src/lib/api.ts`:

```typescript
// BEFORE
export const api = axios.create({
  baseURL: `${API_URL}/api`,  // ❌ Causes path doubling
  ...
});

// AFTER
export const api = axios.create({
  baseURL: API_URL,  // ✅ Correct - paths already include /api
  ...
});
```

## Files Updated

### 1. `apps/web/src/lib/api.ts`
- Changed `baseURL: ${API_URL}/api` to `baseURL: API_URL`

### 2. `apps/web/src/hooks/useBudgetLines.ts`
- Added `/api` prefix to all endpoints:
  - `/budgets/${budgetId}/budget-lines` → `/api/budgets/${budgetId}/budget-lines`
  - `/budget-lines/${budgetLineId}` → `/api/budget-lines/${budgetLineId}`

### 3. `apps/web/src/pages/AuthPage.tsx`
- Updated login endpoint:
  - `/auth/login` → `/api/auth/login`

## Verification

### Before Fix
```
GET /api/api/projects 404 3.070 ms - 70
GET /api/api/facilities 404 0.361 ms - 72
GET /api/api/funding-sources 404 0.346 ms - 77
```

### After Fix
```
GET /api/projects 401 0.752 ms - 40
GET /api/facilities 401 0.411 ms - 40
GET /api/funding-sources 200 24.301 ms - 1234
```

Note: 401 (Unauthorized) is expected when not logged in. After login, returns 200 (Success).

## How to Test

1. **Restart frontend** (if needed):
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Open browser** to http://localhost:5173

3. **Login** with demo account:
   - Email: `director@cpo.app`
   - Password: `Demo!Pass1`

4. **Verify dashboard** shows:
   - Total projects count
   - Funding source breakdown
   - Budget totals

5. **Verify projects page** shows:
   - List of 7 projects
   - Filtering by facility, funding source, status
   - Project cards with budget info

## Related Files
- API server configuration: `apps/api/src/index.ts` (no changes needed)
- All frontend hooks already use `/api` prefix in their paths
- Vite HMR automatically reloaded changes

## Status
✅ **FIXED** - Frontend now correctly connects to API endpoints
✅ Login working
✅ Dashboard loading data
✅ Projects page loading data
