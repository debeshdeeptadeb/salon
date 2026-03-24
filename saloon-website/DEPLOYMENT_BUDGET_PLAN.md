# Budget-First Production Deployment Runbook

This guide is for launching the salon product as a paid service with minimum recurring cost and no free-tier sleep risks.

## 1) Recommended stack and budget

### Option A (best budget-to-reliability)
- Frontend: Vercel (Hobby)
- Backend: Render Starter (always on)
- Database: Neon Launch (with backups)
- Domain + DNS: Cloudflare Registrar + Cloudflare DNS

Estimated recurring cost:
- Backend: ~USD 7/month
- Database: ~USD 5-10/month
- Frontend: USD 0/month (upgrade later if needed)
- Total: ~USD 12-17/month (domain billed yearly)

### Option B (balanced)
- Frontend: Vercel
- Backend: Railway paid service
- Database: Railway Postgres or Supabase paid

Estimated recurring cost:
- ~USD 20-35/month depending usage.

## 2) Domain purchase and DNS setup

1. Buy domain (prefer short brand name).
2. Add domain in Cloudflare DNS.
3. Create records:
   - `CNAME app` -> frontend host target (from Vercel/Netlify dashboard)
   - `CNAME api` -> backend host target (from Render/Railway dashboard)
4. SSL/TLS mode in Cloudflare: `Full (strict)`.
5. Final expected URLs:
   - Frontend: `https://app.yourbrand.com`
   - API: `https://api.yourbrand.com`

## 3) Production environment variables

### Frontend (`.env` in hosting dashboard)
```env
VITE_API_URL=https://api.yourbrand.com/api
VITE_DEFAULT_SALON_SLUG=default
```

### Backend (Render/Railway env dashboard)
Use `backend/.env.production.example` as template:
```env
NODE_ENV=production
PORT=5000

DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=salon_db
DB_USER=salon_user
DB_PASSWORD=strong_password
DB_SSL=true

JWT_SECRET=long_random_secret
JWT_EXPIRE=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

FRONTEND_URL=https://app.yourbrand.com,https://www.yourbrand.com

RATE_LIMIT_MAX=400
AUTH_RATE_LIMIT_MAX=20
```

## 4) Database deployment and migration

1. Create managed Postgres (Neon recommended).
2. Set backend env values from DB console.
3. Run migrations from your local machine against production DB:

```bash
cd backend
npm ci
npm run setup:db
npm run migrate:007
```

4. Create super admin for production:

```bash
cd backend
npm run promote-super
```

## 5) Deploy backend (Render)

1. Create Web Service from GitHub repo.
2. Root directory: `backend`
3. Build command: `npm ci`
4. Start command: `npm start`
5. Set all production env variables.
6. (Important) Add persistent disk for uploads if using local filesystem uploads.
7. Verify:
   - `https://api.yourbrand.com/api/health`

## 6) Deploy frontend (Vercel)

1. Import repository in Vercel.
2. Root: project root.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env var `VITE_API_URL=https://api.yourbrand.com/api`
6. Confirm SPA fallback via `vercel.json` (already included).

## 7) Security hardening checklist

- CORS restricted by `FRONTEND_URL` in backend.
- HTTP security headers via `helmet`.
- API rate limit and stricter auth rate limit enabled.
- Secrets only in host env dashboard; never in git.
- Use HTTPS-only production URLs in all envs.
- Database SSL enabled using `DB_SSL=true`.

## 8) Full production test flow

### Public flow
1. Open `https://app.yourbrand.com`.
2. Check services, catalogue, gallery load.
3. Submit enquiry.
4. Create booking and verify status in admin.

### Admin flow
1. Login at `/admin/login`.
2. Verify Services CRUD.
3. Verify Offers CRUD and active offer.
4. Verify Bookings status updates and payment status.
5. Verify tenant switching for super admin.

### API checks
- Health endpoint returns 200.
- Browser console has no CORS errors.
- Uploaded images load over HTTPS from backend.

## 9) CI/CD

GitHub Actions workflow exists at:
- `.github/workflows/ci.yml`

What it does:
- Frontend: install, lint, build
- Backend: dependency install check

Enable auto-deploy:
- Vercel: auto deploy on `main`
- Render/Railway: auto deploy on `main`

## 10) Handoff package for client

Provide this bundle:
1. Production URLs (`app`, `api`)
2. Admin super credentials (shared securely)
3. Backup and restore process (DB provider snapshot flow)
4. Monthly billing owners and renewal reminders
5. Incident contacts and SLA (response time)

## 11) Common mistakes to avoid

1. Missing `/api` in `VITE_API_URL`.
2. Using `http://` instead of `https://` in production env vars.
3. CORS mismatch between frontend URL and backend `FRONTEND_URL`.
4. Uploads lost due to ephemeral disk without persistent storage.
5. Running migrations against wrong database.
