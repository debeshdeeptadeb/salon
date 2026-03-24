# DNS Checklist (Hostinger VPS + Cloudflare)

Use this before server setup.

## Required values
- Domain: `yourdomain.in`
- VPS public IP: `x.x.x.x`
- App host: `app.yourdomain.in`
- API host: `api.yourdomain.in`

## Cloudflare DNS records
- `A` record
  - Name: `app`
  - IPv4: `<VPS_PUBLIC_IP>`
  - Proxy: DNS only (gray cloud) during SSL setup, then proxy optional
- `A` record
  - Name: `api`
  - IPv4: `<VPS_PUBLIC_IP>`
  - Proxy: DNS only (gray cloud) during SSL setup

## Verify propagation
```bash
nslookup app.yourdomain.in
nslookup api.yourdomain.in
```

Both should resolve to your VPS IP.
