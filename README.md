# Credicus Business

Recruitment CRM and marketing website for Credicus. Demo-ready with in-memory data (no database required for testing).

## Links

| Resource | URL |
|----------|-----|
| **GitHub repository** | https://github.com/abhiunawane-rgb/credicus-business |
| **Live site (when hosted)** | https://credicus.in |
| **Local demo** | http://localhost:3000 |

> **Note:** Production deploy on credicus.in is still being fixed on cPanel. For team review, run locally (steps below) or clone from GitHub.

## Quick start (for your team)

```bash
git clone https://github.com/abhiunawane-rgb/credicus-business.git
cd credicus-business
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

## Bootstrap admin login

The app starts with **one admin account only**. Create recruiters, team leaders, and other admins from **Users**. Candidate data starts empty.

| Role | Email | Password | After login |
|------|-------|----------|-------------|
| **Admin** | `admin@credicus.com` | `Admin@123` | `/dashboard/admin` |

Sign in at: http://localhost:3000/sign-in

Then: **Users → Create user** (Recruiter / Team Leader / Admin) → those users add candidates.

## Flows to test

### Public website
- Home, About, Services, Clients, Contact
- Contact form submission

### Recruiter
- Dashboard → Candidates (4 demo candidates)
- Add candidate, upload Excel, resumes, follow-ups, invitations, talent pool

### Team Leader
- Dashboard → Team candidates and talent pool

### Admin
- Dashboard → Employees, talent pool, reports, admin panel, data import/export

## Automated checks

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-flows.ps1
```

(Requires dev server running on port 3000.)

## cPanel hosting

See `HOSTING.md` and `CPANEL-README.txt` for production deployment.
