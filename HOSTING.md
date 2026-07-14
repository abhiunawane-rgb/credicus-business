# Credicus — Demo Hosting Guide

## Is it ready for demo?

**Yes — for a client/stakeholder demo**, with these expectations:

| Feature | Works without database? |
|---------|-------------------------|
| Marketing website (Home, About, Services, Clients, Contact) | Yes |
| Login page + admin bootstrap | Yes |
| Recruiter / Team Leader / Admin dashboards (UI) | Yes (create users first) |
| Contact form submission | Needs PostgreSQL |
| Excel candidate upload | Needs PostgreSQL |
| Resume upload | Needs PostgreSQL |
| Admin user management (full CRUD) | Works in demo (in-memory) and PostgreSQL |

**Bootstrap login (starts from zero — no recruiters or candidates):**

- `admin@credicus.com` / `Admin@123`

---

## Important: This is NOT a static website

Credicus is a **Next.js app** (Node.js). You cannot upload only HTML files to basic shared hosting.

Use one of these:

1. **Vercel** (recommended, free tier) — best for Next.js
2. **Railway** or **Render** — Node.js + PostgreSQL together
3. **VPS** (DigitalOcean, AWS EC2, Hostinger VPS) — full control

---

## Files to upload / deploy

Upload the **entire project folder**, except:

```
DO NOT upload:
  node_modules/
  .next/
  .env
  .git/          (optional — use Git deploy instead)

MUST include:
  app/
  components/
  lib/
  prisma/          ← REQUIRED (schema.prisma) — missing this causes npm install to fail
  public/
  scripts/
  app.js           ← cPanel startup file
  package.json
  package-lock.json
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  postcss.config.js (or .mjs)
  .env.production.example
```

**Easiest method:** Push to GitHub and connect Vercel/Railway to auto-deploy.

---

## Option A — Deploy on Vercel (recommended)

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo **or** open the existing project linked to `credicus-business`
3. Add environment variables (Project → Settings → Environment Variables):
   - `JWT_SECRET` = long random string (required)
   - `CREDICUS_DEMO_MODE` = `true` (required if you have no Postgres yet — stops create-user DB errors)
   - `DATABASE_URL` = `postgresql://...` from Neon/Supabase (optional, for permanent users)
4. Deploy / Redeploy — Vercel runs `npm run build` automatically
5. Live URL example: `https://credicus-business.vercel.app`

**If Create user still shows the old DATABASE_URL error:** the live site is on an old build. In Vercel → Deployments → open the latest → **Redeploy** (or push a new commit to `main`).

**Database (for permanent users):** Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) free PostgreSQL, set `DATABASE_URL`, set `CREDICUS_DEMO_MODE=false`, then run locally against that URL:

```bash
npx prisma db push
npm run prisma:seed
```

Then Redeploy on Vercel.

---

## Option B — Deploy on VPS (manual)

On your server (Ubuntu):

```bash
# 1. Upload project (ZIP or git clone)
# 2. Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install dependencies
cd credicus-business
npm install

# 4. Set environment variables
cp .env.production.example .env
# Edit .env with real JWT_SECRET and DATABASE_URL

# 5. Setup database (if using PostgreSQL)
npm run prisma:setup

# 6. Build and run
npm run build
npm start
# App runs on port 3000 — use Nginx reverse proxy + SSL
```

Use **PM2** to keep it running:

```bash
npm install -g pm2
pm2 start npm --name credicus -- start
pm2 save
pm2 startup
```

---

## Option C — Deploy on cPanel (Node.js App)

### Prerequisites
- cPanel must have **Setup Node.js App** (not PHP-only hosting)
- Node.js **20.x** or newer

### Step-by-step

1. **Create deploy package on your PC**
   ```powershell
   cd "E:\My Cursor Projects\Credicus Business"
   powershell -ExecutionPolicy Bypass -File scripts\create-deploy-package.ps1
   ```
   Upload `credicus-deploy.zip` to cPanel File Manager and extract it.

2. **Verify folder structure** (this fixes the Prisma error)
   Your app root must contain:
   ```
   app/
   components/
   lib/
   prisma/
     schema.prisma    ← must exist
   public/
   scripts/
   app.js
   package.json
   ```

3. **Create Node.js application** in cPanel → Setup Node.js App
   | Setting | Value |
   |---------|--------|
   | Node.js version | 20.x |
   | Application mode | Production |
   | Application startup file | `app.js` |
   | Application root | folder where you extracted the ZIP |

4. **Environment variables** (in Node.js app panel)
   ```
   JWT_SECRET=your-long-random-secret-min-32-chars
   NODE_ENV=production
   DATABASE_URL=postgresql://...   (optional for demo)
   ```

5. **Install & build**
   - Click **Run NPM Install**
   - Then run build via Terminal or **Run JS script**:
     ```bash
     npm run build
     ```
   - Click **Restart** on the Node.js app

### Fix: "Cannot find module scripts/postinstall.js"

This means **Application root is set to the wrong folder**.

The error path will look like:
```
.../credicus.in/24/lib/scripts/postinstall.js
```

Your project has a **source code folder named `lib/`** — that is NOT the Node.js app root.

**Fix in cPanel → Setup Node.js App:**
1. Set **Application root** to the folder that contains **all** of these together:
   ```
   package.json
   app.js
   app/
   components/
   lib/
   prisma/
   scripts/
   ```
2. Application root should be something like:
   `public_html/credicus.in`
   **NOT** `public_html/credicus.in/lib`
3. Save, then click **Run NPM Install** again

### Fix: "Could not find Prisma Schema"

This error means **`prisma/schema.prisma` was not uploaded** to the server.

**Fix:**
1. In cPanel File Manager, open your app folder
2. Confirm you see a `prisma` folder with `schema.prisma` inside
3. If missing, upload the `prisma` folder from your PC project
4. Click **Run NPM Install** again, then `npm run build`

### Fix: Build runs out of memory

Build on your PC, then upload the `.next` folder:
```powershell
npm run build
```
Upload the `.next` folder to the server, then on cPanel only run `npm install` and restart.

---

## Environment variables (required on hosting)

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Random secret for login sessions |
| `DATABASE_URL` | For DB features | PostgreSQL connection string |

---

## Post-deploy checklist

- [ ] Home page loads with logo and branding
- [ ] `/sign-in` — demo login works for all 3 roles
- [ ] Each role lands on correct dashboard
- [ ] `/contact` works (if DB configured)
- [ ] HTTPS enabled (hosting provider usually handles this)

---

## Quick local production test (before uploading)

```bash
npm run build
npm start
```

Open http://localhost:3000
