# Credicus — cPanel Full Deploy Guide

Your app is **one Node.js project** = frontend (React/Next.js pages) **+ backend** (API routes under `/api/*`).  
You do **not** need separate PHP files. Upload the ZIP, configure Node.js App, and it runs end-to-end.

---

## What runs on cPanel

| Layer | Technology | Location |
|-------|------------|----------|
| Frontend | Next.js pages | `/`, `/sign-in`, `/dashboard/*` |
| Backend API | Next.js API routes | `/api/auth/*`, `/api/candidates/*`, etc. |
| Data (demo) | In-memory store | Works **without** database |
| Data (production) | MySQL via Prisma | Optional — set `DATABASE_URL` |

---

## Step 1 — Build ZIP on your PC

```powershell
cd "E:\My Cursor Projects\Credicus Business"
powershell -ExecutionPolicy Bypass -File scripts\create-cpanel-package.ps1
```

This creates **`credicus-cpanel.zip`** (includes pre-built `.next` folder).

---

## Step 2 — Upload to cPanel

1. **File Manager** → open your site folder (e.g. `public_html/credicus.in` or `public_html`)
2. Upload **`credicus-cpanel.zip`**
3. **Extract** → overwrite all files
4. Confirm these exist in the **same folder**:
   ```
   app.js
   package.json
   .next/BUILD_ID
   app/
   components/
   lib/
   prisma/schema.prisma
   scripts/
   ```

---

## Step 3 — Create Node.js Application

**cPanel → Software → Setup Node.js App**

| Setting | Value |
|---------|--------|
| Node.js version | 20.x or 24.x |
| Application mode | Production |
| Application root | `public_html/credicus.in` (your extract folder) |
| Application URL | your domain |
| Application startup file | `app.js` |

---

## Step 4 — Environment variables

In the Node.js app panel, add:

| Name | Value |
|------|--------|
| `JWT_SECRET` | long random string (32+ chars) |
| `NODE_ENV` | `production` |
| `COOKIE_SECURE` | `true` (if SSL is active) |
| `CREDICUS_DEMO_MODE` | `true` (recommended — saves candidates in memory; no MySQL required) |

See `.env.cpanel.example` for full list.

**Demo mode (no database):** Leave `DATABASE_URL` empty. These logins work:

- `recruiter@credicus.com` / `Recruiter@123`
- `teamleader@credicus.com` / `TeamLeader@123`
- `admin@credicus.com` / `Admin@123`

---

## Step 5 — Install & start

1. Click **Run NPM Install**
2. In **Terminal**:
   ```bash
   cd ~/public_html/credicus.in
   npx prisma generate
   ```
3. Click **Restart** on the Node.js app
4. Open your domain in the browser

---

## Optional — MySQL database (persistent data)

1. **cPanel → MySQL Databases**
   - Create database: e.g. `n9sob8k7nnbt_credicus`
   - Create user + password
   - Add user to database (ALL PRIVILEGES)

2. Add environment variable:
   ```
   DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME
   ```

3. In Terminal (first time only):
   ```bash
   cd ~/public_html/credicus.in
   npx prisma db push
   npm run prisma:seed
   ```

4. Restart Node.js app

> **Note:** Demo mode works without MySQL. Use MySQL when you need contact form, file uploads, and data saved across restarts.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Build error on PC | Run `npm run build` locally; fix CSS/TypeScript errors first |
| 500 after upload | Run `node scripts/cpanel-diagnose.js` in Terminal |
| Missing BUILD_ID | Re-run `create-cpanel-package.ps1` on PC (includes `.next`) |
| Wrong app root | Root must contain `package.json` + `app.js` together, NOT `/lib` subfolder |
| Login cookie fails | Set `COOKIE_SECURE=true` with HTTPS, or `ALLOW_INSECURE_COOKIES=true` on HTTP |

Passenger log: **Setup Node.js App** → view log file for lines starting with `[credicus]`.

---

## Your server info (from cPanel)

- **Home directory:** `/home/n9sob8k7nnbt`
- **Primary domain:** `1xs.5cf.mytemp.website`
- **SSL:** Active — use `COOKIE_SECURE=true`
