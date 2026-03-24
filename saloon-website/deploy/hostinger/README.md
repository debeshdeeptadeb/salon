# Hostinger 30-Minute Deployment Kit

This folder contains copy-paste templates/scripts for the single-VPS deployment path.

## Files
- `00_dns_checklist.md` - DNS setup before server work
- `10_bootstrap_server.sh` - installs Node/Nginx/Postgres/PM2 and clones repo
- `20_setup_db.sh` - creates database and app user
- `30_backend_env.template` - backend production env template
- `31_frontend_env.template` - frontend production env template
- `40_nginx_api.conf` - API reverse proxy config
- `41_nginx_app.conf` - SPA static hosting config
- `50_deploy_app.sh` - full deploy script (build + PM2 + Nginx)
- `60_enable_ssl.sh` - certbot HTTPS setup
- `70_smoke_test.sh` - basic post-deploy validation

## Quick sequence
```bash
# 1) Bootstrap server once
bash deploy/hostinger/10_bootstrap_server.sh

# 2) DB init once
bash deploy/hostinger/20_setup_db.sh salon_db salon_user 'StrongPassword@123'

# 3) Prepare env files
cp deploy/hostinger/30_backend_env.template backend/.env
cp deploy/hostinger/31_frontend_env.template .env
# edit domains/passwords/secrets

# 4) Deploy app
bash deploy/hostinger/50_deploy_app.sh api.yourdomain.in app.yourdomain.in

# 5) Enable SSL
bash deploy/hostinger/60_enable_ssl.sh app.yourdomain.in api.yourdomain.in you@domain.com

# 6) Smoke test
bash deploy/hostinger/70_smoke_test.sh https://app.yourdomain.in https://api.yourdomain.in
```

## Notes
- Use DNS-only mode in Cloudflare during first SSL issuance.
- Keep `DB_SSL=false` when DB is local on the same VPS.
- If using managed external Postgres later, switch to `DB_SSL=true`.
