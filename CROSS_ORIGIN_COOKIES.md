# Cross-Origin Cookies Guide

## 🔍 Why localhost Frontend Cannot Send Cookies to api.de-id.xyz

### The Problem

When your frontend is on `localhost:3000` and backend is on `api.de-id.xyz`, you have a **cross-origin** situation:

```
Frontend:  http://localhost:3000  (Origin A)
Backend:   https://api.de-id.xyz  (Origin B)
```

### Cookie Domain Restrictions

**Key Rule**: Cookies are **domain-scoped**. A cookie set by `api.de-id.xyz` belongs ONLY to that domain.

1. ❌ **You CANNOT set a cookie for `api.de-id.xyz` from `localhost:3000`**
   - Browsers prevent this for security (prevents cookie hijacking)
   - JavaScript cannot set cookies for other domains

2. ✅ **The browser WILL automatically send cookies when:**
   - The cookie was set by `api.de-id.xyz`
   - The cookie has `SameSite=None; Secure=true`
   - The fetch request uses `credentials: "include"`
   - The request is going to `api.de-id.xyz`

## ✅ The Correct Solution

### Backend Configuration (api.de-id.xyz)

Your backend MUST set the cookie with these attributes:

```python
# In your FastAPI backend
response.set_cookie(
    key="deid_session_id",
    value=session_token,
    httponly=True,
    secure=True,           # REQUIRED for SameSite=None
    samesite="none",      # REQUIRED for cross-origin
    domain="api.de-id.xyz",  # Or don't set domain (defaults to current domain)
    path="/",
    max_age=30*24*60*60  # 30 days
)
```

**Critical Settings:**
- ✅ `secure=True` - Required for `SameSite=None` (even on localhost with HTTPS)
- ✅ `samesite="none"` - Allows cross-origin cookie sending
- ✅ `domain="api.de-id.xyz"` - Cookie belongs to backend domain

### Frontend Configuration (localhost:3000)

**DO NOT try to manually set the cookie!** Just use `credentials: "include"`:

```typescript
// ✅ CORRECT - Browser automatically sends cookie
const response = await fetch("https://api.de-id.xyz/api/v1/decode/my-profile", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Browser sends cookies automatically
});

// ❌ WRONG - This won't work!
// You cannot set a cookie for api.de-id.xyz from localhost
res.cookies.set("deid_session_id", value, {
  domain: "api.de-id.xyz" // ❌ Browser will reject this!
});
```

## 🔄 How It Works

### Step-by-Step Flow

1. **User logs in via SSO**
   ```
   Frontend (localhost:3000) → Backend (api.de-id.xyz) → SSO Provider
   ```

2. **Backend sets cookie**
   ```
   Backend response includes:
   Set-Cookie: deid_session_id=abc123; Domain=api.de-id.xyz; SameSite=None; Secure
   ```

3. **Browser stores cookie**
   ```
   Browser stores cookie for api.de-id.xyz domain
   (You can see it in DevTools → Application → Cookies → api.de-id.xyz)
   ```

4. **Frontend makes request**
   ```typescript
   fetch("https://api.de-id.xyz/api/endpoint", {
     credentials: "include" // ← This tells browser to send cookies
   });
   ```

5. **Browser automatically includes cookie**
   ```
   Request headers:
   Cookie: deid_session_id=abc123
   ```

## 🛠️ Implementation Checklist

### ✅ Frontend (Next.js)

1. **All fetch calls to backend must include `credentials: "include"`**

   ```typescript
   // ✅ Profile page
   fetch(`${backendUrl}/api/v1/decode/my-profile`, {
     credentials: "include",
   });

   // ✅ Identity page
   fetch(`${backendUrl}/api/v1/decode/my-profile`, {
     credentials: "include",
   });

   // ✅ Any API route calling backend
   fetch(`${backendUrl}/api/v1/...`, {
     credentials: "include",
   });
   ```

2. **DO NOT try to manually set backend cookies**

   ```typescript
   // ❌ DON'T DO THIS
   res.cookies.set("deid_session_id", value, {
     domain: "api.de-id.xyz" // Won't work!
   });
   ```

### ✅ Backend (FastAPI)

1. **Set cookies with correct attributes**

   ```python
   from fastapi import Response

   @app.post("/sso-validate")
   async def sso_validate(response: Response, ...):
       # Create session
       session_token = create_session(user_id)

       # Set cookie
       response.set_cookie(
           key="deid_session_id",
           value=session_token,
           httponly=True,
           secure=True,        # REQUIRED
           samesite="none",    # REQUIRED for cross-origin
           max_age=30*24*60*60
       )

       return {"success": True}
   ```

2. **CORS Configuration**

   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:3000",  # Local dev
           "https://de-id.xyz",      # Production frontend
           "https://app.de-id.xyz",  # Production frontend (if different)
       ],
       allow_credentials=True,  # REQUIRED for cookies
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## 🧪 Testing

### Check if Cookie is Being Sent

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Make a request to backend**
4. **Check Request Headers**:
   ```
   Cookie: deid_session_id=abc123...
   ```
   ✅ If you see this, cookies are working!

### Check if Cookie is Stored

1. **DevTools → Application → Cookies**
2. **Select `api.de-id.xyz`**
3. **Look for `deid_session_id`**
   ✅ If you see it, cookie is stored!

### Common Issues

#### ❌ "SSO State is expired"
- **Cause**: `ssoState` cookie not being read
- **Fix**: Ensure `ssoState` cookie is set on frontend domain (localhost)
- **Check**: DevTools → Application → Cookies → localhost:3000

#### ❌ "Session verification failed"
- **Cause**: `deid_session_id` cookie not being sent
- **Fix**:
  1. Backend must set cookie with `SameSite=None; Secure`
  2. Frontend must use `credentials: "include"`
  3. CORS must allow credentials

#### ❌ Cookie not appearing in DevTools
- **Cause**: Cookie attributes incorrect
- **Fix**:
  - `secure=True` (required for `SameSite=None`)
  - `samesite="none"` (required for cross-origin)
  - Check backend response headers

## 📋 Summary

### Key Points

1. ✅ **Backend sets cookie** for `api.de-id.xyz` with `SameSite=None; Secure`
2. ✅ **Frontend uses `credentials: "include"`** in all fetch calls
3. ✅ **Browser automatically sends cookie** - no manual intervention needed
4. ❌ **Don't try to manually set cross-origin cookies** - it won't work

### Cookie Flow

```
Backend (api.de-id.xyz)
  ↓ Sets cookie with SameSite=None; Secure
Browser
  ↓ Stores cookie for api.de-id.xyz
Frontend (localhost:3000)
  ↓ Makes request with credentials: "include"
Browser
  ↓ Automatically includes cookie in request
Backend (api.de-id.xyz)
  ↓ Receives cookie and validates session
```

### Environment Differences

| Environment | Frontend | Backend | Cookie Domain |
|------------|----------|---------|---------------|
| **Local Dev** | `localhost:3000` | `api.de-id.xyz` | `api.de-id.xyz` |
| **Production** | `app.de-id.xyz` | `api.de-id.xyz` | `api.de-id.xyz` |

Both work the same way - browser automatically sends cookies when using `credentials: "include"`!

---

**Remember**: The browser handles cross-origin cookies automatically. You just need:
1. Backend to set cookie correctly (`SameSite=None; Secure`)
2. Frontend to use `credentials: "include"`
3. CORS to allow credentials

That's it! 🎉
