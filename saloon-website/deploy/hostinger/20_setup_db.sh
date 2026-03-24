#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-salon_db}"
DB_USER="${2:-salon_user}"
DB_PASS="${3:-ChangeMe@123}"

echo "Creating PostgreSQL database and user..."
if [ "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")" != "1" ]; then
  sudo -u postgres createdb "${DB_NAME}"
fi

# Simpler and idempotent user/db grants
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}') THEN CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}'; END IF; END \$\$;"
sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};"
sudo -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"

echo "Database setup completed: ${DB_NAME}, user: ${DB_USER}"
