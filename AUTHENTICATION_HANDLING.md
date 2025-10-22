# Authentication & Session Management

## Overview

This document describes the centralized authentication and session management system for handling backend API calls.

## Problem Statement

When a user's session expires (401 Unauthorized), the application should:

1. Automatically detect the 401 error
2. Delete the session cookie (`deid_session_id`)
3. Clear session storage
4. Show a user-friendly message
5. Redirect to login page

## Solution: Backend Utilities

### File: `/src/utils/backend.utils.ts`

A centralized module for all backend API interactions with built-in authentication handling.

## Key Functions

### 1. `handleUnauthorized()`

Handles logout when a 401 error is detected.

```typescript
export function handleUnauthorized() {
  // Delete session cookie
  document.cookie =
    "deid_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Clear session storage
  sessionStorage.clear();

  // Show error message
  toastError("Session expired. Please log in again.");

  // Redirect to login
  window.location.href = "/login";
}
```

**Usage**: Automatically called when 401 is detected, or can be called manually.

### 2. `backendFetch()`

Makes authenticated requests with automatic 401 handling.

```typescript
const response = await backendFetch("/api/v1/task/123/validate", {
  method: "POST",
  body: JSON.stringify({ data: "..." }),
});
```

**Features**:

- Automatically includes credentials (cookies)
- Detects 401 and calls `handleUnauthorized()`
- Adds proper headers
- Logs requests for debugging

### 3. `backendFetchJSON()`

Same as `backendFetch()` but automatically parses JSON response.

```typescript
const data = await backendFetchJSON("/api/v1/user/profile");
// data is already parsed JSON
```

### 4. Helper Functions

Convenience wrappers for common HTTP methods:

```typescript
// POST request
const data = await backendPost("/api/v1/task/create", { title: "..." });

// GET request
const tasks = await backendGet("/api/v1/task/list");

// PUT request
const updated = await backendPut("/api/v1/profile", { bio: "..." });

// DELETE request
await backendDelete("/api/v1/task/123");
```

## Implementation in API Routes

### Pattern: Forward Cookies & Handle 401

API routes should forward cookies to the backend and handle 401 responses:

```typescript
export async function POST(request: NextRequest) {
  // Get cookies from client
  const cookies = request.headers.get("cookie") || "";

  // Forward to backend
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies, // ← Forward cookies
    },
    credentials: "include",
  });

  // Handle 401
  if (response.status === 401) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        shouldLogout: true, // ← Signal to frontend
      },
      { status: 401 }
    );
  }

  return NextResponse.json(await response.json());
}
```

## Implementation in Client Components

### Pattern: Check for 401 & Call Logout

```typescript
const response = await fetch("/api/task/123/validate", {
  method: "POST",
  credentials: "include",
});

if (!response.ok) {
  const errorData = await response.json();

  // Handle 401 - logout user
  if (response.status === 401 || errorData.shouldLogout) {
    handleUnauthorized();
    return; // Stop execution
  }

  throw new Error(errorData.error);
}
```

## Complete Flow

```
1. User action (e.g., click "Verify Task")
   ↓
2. Frontend sends request to Next.js API route
   Includes: credentials: "include"
   ↓
3. API route forwards request to backend
   Includes: Cookie header with session
   ↓
4. Backend validates session

   If valid:
   ✅ Returns data

   If invalid (401):
   ❌ Returns 401 Unauthorized
   ↓
5. API route detects 401
   Returns: { shouldLogout: true }
   ↓
6. Frontend detects 401
   Calls: handleUnauthorized()
   ↓
7. User is logged out
   - Cookie deleted
   - Session cleared
   - Redirected to /login
```

## Migration Guide

### Before (Manual Handling)

```typescript
// ❌ Old way - manual 401 handling
try {
  const response = await fetch(`${backendUrl}/api/v1/task`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (response.status === 401) {
    // Manual logout logic (duplicated everywhere)
    document.cookie = "...";
    sessionStorage.clear();
    window.location.href = "/login";
    return;
  }

  const data = await response.json();
  // ...
} catch (error) {
  // ...
}
```

### After (Centralized Handling)

```typescript
// ✅ New way - automatic 401 handling
try {
  const data = await backendGet("/api/v1/task");
  // 401 is automatically handled
  // ...
} catch (error) {
  // Other errors only
  // ...
}
```

## Files Modified

1. **Created**: `/src/utils/backend.utils.ts` - Core utilities
2. **Updated**: `/src/utils/index.utils.ts` - Re-exports
3. **Updated**: `/src/app/api/task/[taskId]/validate/route.ts` - Example implementation
4. **Updated**: `/src/components/cards/TaskCard.tsx` - Example usage

## Benefits

### ✅ Centralized Logic

- Single source of truth for authentication handling
- No duplicate logout code across components
- Easier to maintain and update

### ✅ Consistent UX

- Same error message everywhere
- Consistent logout behavior
- User always redirected to login

### ✅ Developer Experience

- Simple API: `backendPost()`, `backendGet()`, etc.
- Automatic error handling
- TypeScript support with generics

### ✅ Security

- Properly deletes session cookies
- Clears all session data
- Prevents stale authentication state

## Best Practices

### 1. Always Use Backend Utilities for Backend Calls

```typescript
// ✅ Good
import { backendGet } from "@/utils/backend.utils";
const data = await backendGet("/api/v1/user/profile");

// ❌ Avoid
const response = await fetch("http://localhost:8888/api/v1/user/profile");
```

### 2. Include Credentials in API Routes

```typescript
// ✅ Good
const response = await fetch(backendUrl, {
  credentials: "include",
  headers: { Cookie: cookies },
});

// ❌ Missing credentials
const response = await fetch(backendUrl, {
  headers: { "Content-Type": "application/json" },
});
```

### 3. Forward shouldLogout Signal

```typescript
// ✅ Good - API route signals logout
if (response.status === 401) {
  return NextResponse.json(
    { success: false, shouldLogout: true },
    { status: 401 }
  );
}

// ❌ Missing signal
if (response.status === 401) {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}
```

### 4. Check for 401 in Components

```typescript
// ✅ Good - checks both status and signal
if (response.status === 401 || errorData.shouldLogout) {
  handleUnauthorized();
  return;
}

// ❌ Only checks status (might miss some cases)
if (response.status === 401) {
  handleUnauthorized();
}
```

## Testing Checklist

- [ ] Test with valid session (should work normally)
- [ ] Test with expired session (should logout)
- [ ] Test with deleted cookie (should logout)
- [ ] Verify cookie is deleted after logout
- [ ] Verify sessionStorage is cleared after logout
- [ ] Verify redirect to /login page
- [ ] Verify toast message appears
- [ ] Test on multiple pages/components
- [ ] Test rapid requests (rate limiting)
- [ ] Test network errors (different from 401)

## Troubleshooting

### "Cookie not being forwarded"

**Solution**: Make sure to get cookies from request headers:

```typescript
const cookies = request.headers.get("cookie") || "";
```

### "Infinite redirect loop"

**Check**: Make sure /login page doesn't require authentication

### "Session cookie not deleted"

**Check**: Cookie path and domain match your application:

```typescript
document.cookie = "deid_session_id=; path=/;";
```

## Future Enhancements

1. **Refresh Token Support**: Auto-refresh tokens before expiry
2. **Retry Logic**: Retry failed requests after re-authentication
3. **Offline Mode**: Queue requests when offline
4. **Request Interceptors**: Global request/response middleware
5. **Rate Limiting**: Client-side rate limiting for API calls

## Support

For issues related to authentication:

1. Check browser console for error logs
2. Verify cookies in DevTools → Application → Cookies
3. Check sessionStorage in DevTools → Application → Session Storage
4. Test with backend API directly (curl/Postman)
5. Review backend logs for authentication errors
