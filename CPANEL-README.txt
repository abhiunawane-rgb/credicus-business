CREDICUS — cPanel deploy (UPDATED)
==================================

ERROR: "500 Internal Server Error" after Run NPM Install
CAUSE:  App was not built — missing .next folder on server.
        cPanel starts the app immediately and health-check fails.

SOLUTION: Upload a PRE-BUILT package (includes .next folder)
------------------------------------------------------------

ON YOUR PC (Windows):
  cd "E:\My Cursor Projects\Credicus Business"
  powershell -ExecutionPolicy Bypass -File scripts\create-cpanel-package.ps1

This creates: credicus-cpanel.zip  (includes .next build)

ON CPANEL:
  1. File Manager -> public_html/credicus.in/
  2. Upload credicus-cpanel.zip -> Extract -> Overwrite all
  3. Verify these exist in the SAME folder:
       package.json
       app.js
       .next/BUILD_ID    <-- CRITICAL
       app/
       prisma/schema.prisma

  4. Setup Node.js App:
       Application root:  public_html/credicus.in
       Startup file:      app.js
       Node version:      20.x  (recommended — avoid 24 if possible)
       Mode:              Production

  5. Environment variables:
       JWT_SECRET = long-random-secret-min-32-chars
       NODE_ENV   = production
       COOKIE_SECURE = true          (set when HTTPS/SSL is enabled)

  If login works but you are immediately signed out, set COOKIE_SECURE=true
  after SSL is enabled, or ALLOW_INSECURE_COOKIES=true only for HTTP testing.

  6. Click "Run NPM Install"
  7. Click "Restart"
     (Do NOT need npm run build on server — already built)

package.json on server must NOT have postinstall script.
Build command is only needed if you upload source without .next:
  npm run build

Demo logins (no database required):
  recruiter@credicus.com / Recruiter@123
  teamleader@credicus.com / TeamLeader@123
  admin@credicus.com / Admin@123
