CREDICUS — cPanel deploy (UPDATED)
==================================

ERROR: "500 Internal Server Error" after Run NPM Install
CAUSE:  Usually one of:
        - Missing .next/BUILD_ID (build not uploaded)
        - Prisma client not generated
        - App crash on startup (see Passenger log)

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
       Node version:      24.x is OK (use whatever your host offers)
       Mode:              Production

  5. Environment variables (EXACT names — do not invent custom names):
       Name: JWT_SECRET
       Value: credicus-test-secret-min-32-characters-long

       Name: NODE_ENV
       Value: production

       If HTTPS/SSL is ON:
       Name: COOKIE_SECURE
       Value: true

       If HTTPS/SSL is OFF (HTTP testing only):
       Name: ALLOW_INSECURE_COOKIES
       Value: true

  WRONG: credicusemployeemanagement=production  (this breaks the app)
  RIGHT: NODE_ENV=production  and  JWT_SECRET=your-secret

  5b. Node.js version: if only 24.x is available, use it — Credicus works on Node 24.

  6. Click "Run NPM Install"
  7. In Terminal: cd ~/public_html/credicus.in && npx prisma generate
  8. Click "Restart"

  STILL 500? Run diagnostic from cPanel:
  - Setup Node.js App -> "Run JS script" -> scripts/cpanel-diagnose.js
  OR Terminal: node scripts/cpanel-diagnose.js

  Then open the Passenger log (link in Setup Node.js App) and look for
  lines starting with [credicus] — paste the error if you need help.

Demo logins (no database required):
  recruiter@credicus.com / Recruiter@123
  teamleader@credicus.com / TeamLeader@123
  admin@credicus.com / Admin@123
