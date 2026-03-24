#!/usr/bin/env bash
set -euo pipefail

echo "[1/7] Updating OS packages"
sudo apt update && sudo apt upgrade -y

echo "[2/7] Installing Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

echo "[3/7] Installing system packages"
sudo apt install -y nodejs nginx postgresql postgresql-contrib git ufw

echo "[4/7] Installing PM2"
sudo npm i -g pm2

echo "[5/7] Creating app directory"
sudo mkdir -p /var/www/salon
sudo chown -R "$USER":"$USER" /var/www/salon

echo "[6/7] Cloning repository"
cd /var/www/salon
if [ -d .git ]; then
  echo "Repository already exists, pulling latest..."
  git pull --rebase
else
  git clone https://github.com/debeshdeeptadeb/salon.git .
fi

echo "[7/7] Basic firewall rules"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "Server bootstrap completed."
