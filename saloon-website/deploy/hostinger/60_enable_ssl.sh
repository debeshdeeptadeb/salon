#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="${1:-app.yourdomain.in}"
API_DOMAIN="${2:-api.yourdomain.in}"
EMAIL="${3:-you@domain.com}"

sudo apt update
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx \
  -d "${APP_DOMAIN}" \
  -d "${API_DOMAIN}" \
  --redirect \
  -m "${EMAIL}" \
  --agree-tos \
  -n

echo "SSL enabled for ${APP_DOMAIN} and ${API_DOMAIN}"
