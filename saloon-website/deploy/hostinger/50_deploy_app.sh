#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/salon"
API_DOMAIN="${1:-api.yourdomain.in}"
APP_DOMAIN="${2:-app.yourdomain.in}"

echo "[1/8] Pull latest code"
cd "${APP_DIR}"
git pull --rebase

echo "[2/8] Backend install"
cd "${APP_DIR}/backend"
npm ci

echo "[3/8] Preflight backend env"
npm run preflight:prod

echo "[4/8] Run migrations"
npm run setup:db
npm run migrate:007

echo "[5/8] Start backend with PM2"
pm2 delete salon-api >/dev/null 2>&1 || true
pm2 start server.js --name salon-api
pm2 save

echo "[6/8] Frontend install and build"
cd "${APP_DIR}"
npm ci
npm run build

echo "[7/8] Install Nginx configs"
sudo cp "${APP_DIR}/deploy/hostinger/40_nginx_api.conf" /etc/nginx/sites-available/salon-api
sudo cp "${APP_DIR}/deploy/hostinger/41_nginx_app.conf" /etc/nginx/sites-available/salon-app
sudo sed -i "s/api\\.yourdomain\\.in/${API_DOMAIN}/g" /etc/nginx/sites-available/salon-api
sudo sed -i "s/app\\.yourdomain\\.in/${APP_DOMAIN}/g" /etc/nginx/sites-available/salon-app
sudo ln -sf /etc/nginx/sites-available/salon-api /etc/nginx/sites-enabled/salon-api
sudo ln -sf /etc/nginx/sites-available/salon-app /etc/nginx/sites-enabled/salon-app
sudo nginx -t
sudo systemctl reload nginx

echo "[8/8] Deployment finished"
echo "Next: run certbot for SSL"
