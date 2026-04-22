# Google OAuth Origin Mismatch - Fix Checklist

## Error Details
```
Error 400: origin_mismatch
origin=http://localhost:5173
flowName=GeneralOAuthFlow
```

This means: Google rejected your frontend origin because it's not registered in Google Cloud Console.

---

## ✅ Complete Fix Procedure

### 1️⃣ Update Google Cloud Console

**Go to:** https://console.cloud.google.com/

**Steps:**
1. Select your project
2. Go to: **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID: `194337731331-kv55hq4n86bln9honk84e7ida235o02f.apps.googleusercontent.com`
4. In **"Authorized JavaScript origins"** section, add:
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   http://localhost
   ```
5. In **"Authorized redirect URIs"** section, ensure:
   ```
   http://localhost:8080/api/auth/google/callback
   http://localhost:8080/login/oauth2/code/google
   ```
6. Click **SAVE**
7. **Wait 30-60 seconds** for changes to propagate to Google's servers

### 2️⃣ Verify Frontend Configuration

**File:** `/frontend/vite.config.js`
```javascript
server: {
  port: 5173,
  host: 'localhost',
}
```

✅ Port must be: **5173**

### 3️⃣ Verify Environment Variables

**File:** `/.env`
```
VITE_GOOGLE_CLIENT_ID=194337731331-kv55hq4n86bln9honk84e7ida235o02f.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8080/api
```

✅ These must match your Google Console settings

### 4️⃣ Verify Backend Configuration

**File:** `/backend/src/main/resources/application.properties`
```properties
app.cors.allowed-origins=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:5173
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
```

✅ CORS must allow `localhost:5173`

### 5️⃣ Clear Browser Cache

1. Open **Dev Tools** (F12)
2. Go to **Application** tab
3. **Clear Storage** → **Clear site data**
4. Close and reopen browser
5. Hard refresh: **Ctrl + Shift + R**

### 6️⃣ Test the Setup

**Steps:**
1. Start Backend: `mvn spring-boot:run` (port 8080)
2. Start Frontend: `npm run dev` (port 5173)
3. Open: http://localhost:5173/
4. Click "Sign in with Google"
5. Complete the Google login flow

---

## 🔍 Debugging Tips

If you still get the error:

1. **Check browser console (F12 → Console):**
   - Should see request to Google API
   - Look for CORS errors or network failures

2. **Check backend logs:**
   - Run: `mvn spring-boot:run -X`  (verbose mode)
   - Look for: "AuthController", "AuthService", "OAuth"

3. **Verify Google Client ID:**
   - Frontend: `VITE_GOOGLE_CLIENT_ID`
   - Backend: `spring.security.oauth2.client.registration.google.client-id`
   - Both must match the same Client ID from Google Console

4. **Check if Google Console changes are propagated:**
   - Wait 1-2 minutes after saving
   - Try in incognito/private mode
   - Try different browser

---

## 🚀 Common Solutions

| Problem | Solution |
|---------|----------|
| "origin_mismatch" | Add `http://localhost:5173` to Authorized JavaScript origins in Google Console |
| No Google button appears | Check `VITE_GOOGLE_CLIENT_ID` in `.env` file |
| Button appears but clicking does nothing | Check browser console for CORS errors |
| "Invalid client" error | Verify Google Client ID matches between frontend and backend |
| Login succeeds but redirects to error page | Check backend logs for user approval/suspension status |

---

## 📞 Still Having Issues?

Check these logs:

**From Spring Boot:**
```bash
mvn spring-boot:run -X | grep -i "oauth\|google\|auth"
```

**From Browser Console:**
- Press F12 → Console tab
- Try login and note the exact error message

---
