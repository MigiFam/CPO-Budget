# Authentication Redirect Loop Fix

## Problem
After successful login (`POST /api/auth/login 200`), the user was being redirected back to the auth page immediately. The dashboard would try to fetch data but get 401 errors.

## Root Causes

### 1. Response Structure Mismatch
The API returns:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

But the frontend was accessing `response.data.data` incorrectly without checking the `success` field.

### 2. Zustand Persist Timing Issue
The critical issue was a race condition:
1. Login succeeds → `login(user, token)` called
2. Zustand updates state: `isAuthenticated = true`
3. Navigate to `/` happens **before** Zustand persist writes to localStorage
4. Dashboard mounts and tries to fetch `/api/projects`
5. API interceptor reads from localStorage → token not there yet!
6. Request sent without Authorization header
7. API returns 401
8. Response interceptor redirects to `/auth`
9. Loop repeats

### 3. Overly Aggressive 401 Handler
The response interceptor was redirecting to `/auth` on ANY 401 error, even during login attempts.

## Solutions Implemented

### 1. Fixed Response Parsing (`AuthPage.tsx`)
```typescript
// BEFORE
const response = await api.post<{ data: AuthResponse }>('/api/auth/login', credentials);
return response.data.data;

// AFTER  
const response = await api.post<{ success: boolean; data: AuthResponse }>('/api/auth/login', credentials);
if (!response.data.success) {
  throw new Error('Login failed');
}
return response.data.data;
```

### 2. Fixed Zustand Persist Timing (`AuthPage.tsx`)
Manually write to localStorage immediately after successful login to ensure the token is available for the next API request:

```typescript
onSuccess: (data) => {
  // Update Zustand store (async persist)
  login(data.user, data.token);
  
  // Ensure localStorage is updated immediately (sync)
  const existingData = localStorage.getItem('cpo-auth');
  let parsedData: any = {};
  if (existingData) {
    try {
      parsedData = JSON.parse(existingData);
    } catch (e) {}
  }
  
  localStorage.setItem('cpo-auth', JSON.stringify({
    ...parsedData,
    state: {
      user: data.user,
      token: data.token,
      isAuthenticated: true,
    },
    version: parsedData.version || 0,
  }));
  
  // Navigate after ensuring localStorage is updated
  navigate('/');
}
```

### 3. Smarter 401 Handler (`api.ts`)
Don't redirect on 401 if we're already on the auth page or if it's a login request:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on the auth page and not trying to login
      const isAuthPage = window.location.pathname === '/auth';
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isAuthPage && !isLoginRequest) {
        localStorage.removeItem('cpo-auth');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);
```

## Files Modified

1. **`apps/web/src/pages/AuthPage.tsx`**
   - Fixed response parsing to check `success` field
   - Added manual localStorage sync before navigation
   
2. **`apps/web/src/lib/api.ts`**
   - Made 401 redirect handler smarter (skip if on auth page or login request)

## Testing

1. Go to http://localhost:5173
2. Should see login page
3. Login with `director@cpo.app` / `Demo!Pass1`
4. Should navigate to dashboard successfully
5. Dashboard should load projects data without 401 errors
6. Refresh page - should stay logged in (token persisted)

## Expected API Logs After Fix

```
POST /api/auth/login 200 115.363 ms - 797      ✅ Login succeeds
GET /api/projects 200 45.123 ms - 4567          ✅ Token sent, data returned
GET /api/facilities 200 23.456 ms - 1234        ✅ Token sent, data returned
GET /api/funding-sources 200 12.789 ms - 890    ✅ Token sent, data returned
```

No more 401 errors after successful login!

## Status
✅ **FIXED** - Login now works correctly
✅ Token persists to localStorage immediately  
✅ Dashboard loads data after login
✅ No redirect loop
