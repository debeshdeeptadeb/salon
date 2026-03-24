#!/usr/bin/env bash
set -euo pipefail

APP_URL="${1:-https://app.yourdomain.in}"
API_URL="${2:-https://api.yourdomain.in}"

echo "Checking API health..."
curl -fsS "${API_URL}/api/health" | python3 -m json.tool

echo "Checking app root..."
curl -I "${APP_URL}" | head -n 5

echo "Checking API CORS preflight..."
curl -i -X OPTIONS "${API_URL}/api/health" \
  -H "Origin: ${APP_URL}" \
  -H "Access-Control-Request-Method: GET" | head -n 20

echo "Smoke tests completed."
