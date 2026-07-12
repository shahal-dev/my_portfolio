#!/usr/bin/env bash
# One-time TLS bootstrap. Run this once, on the VM, after `cms/.env` exists.
#
# Usage: ./init-tls.sh <vm-public-ip>
#
# What it does:
#   1. Derives a sslip.io hostname from the IP (no domain purchase needed —
#      sslip.io resolves <ip-with-dashes>.sslip.io back to that IP).
#   2. Pulls the pre-built Strapi image (built by GitHub Actions — this VM
#      doesn't have enough RAM to build it locally) and brings up Strapi +
#      nginx with a temporary HTTP-only config.
#   3. Runs certbot (webroot mode) against that hostname to get a real,
#      free Let's Encrypt certificate.
#   4. Swaps nginx to the real HTTPS config and reloads.
#
# Re-running is safe (idempotent) — certbot skips issuance if a valid cert
# already exists for the hostname.

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <vm-public-ip>" >&2
  exit 1
fi

VM_IP="$1"
SSLIP_HOST="$(echo "$VM_IP" | tr '.' '-').sslip.io"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$SCRIPT_DIR/cms/.env" ]; then
  echo "cms/.env not found. Create it first (see README.md) — it holds the" >&2
  echo "real Strapi secrets and must exist before Strapi can start." >&2
  exit 1
fi

echo "==> Target hostname: $SSLIP_HOST"

echo "==> Phase 1: bringing up Strapi + nginx with a temporary HTTP-only config"
mkdir -p "$SCRIPT_DIR/nginx/conf.d"
cp "$SCRIPT_DIR/nginx/available/http-only.conf" "$SCRIPT_DIR/nginx/conf.d/default.conf"

cd "$SCRIPT_DIR"
docker compose pull strapi
docker compose up -d strapi nginx

echo "==> Waiting for nginx to be reachable on port 80..."
for _ in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost/" 2>/dev/null; then
    break
  fi
  sleep 1
done

echo "==> Phase 2: requesting a certificate for $SSLIP_HOST"
docker run --rm \
  -v certbot_conf:/etc/letsencrypt \
  -v certbot_webroot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$SSLIP_HOST" \
  --non-interactive --agree-tos \
  --register-unsafely-without-email

echo "==> Phase 3: switching nginx to the real HTTPS config"
sed "s/__SSLIP_HOST__/$SSLIP_HOST/g" \
  "$SCRIPT_DIR/nginx/available/default.conf.template" \
  > "$SCRIPT_DIR/nginx/conf.d/default.conf"

docker compose exec nginx nginx -s reload

echo ""
echo "==> Done. Strapi is now live at: https://$SSLIP_HOST"
echo "    Admin panel: https://$SSLIP_HOST/admin"
echo ""
echo "Next step: set STRAPI_URL=https://$SSLIP_HOST in your Vercel project's"
echo "environment variables, then redeploy the frontend."
echo ""
echo "Cert renewal: add this to the VM's crontab (crontab -e):"
echo "  0 3 * * * docker run --rm -v certbot_conf:/etc/letsencrypt -v certbot_webroot:/var/www/certbot certbot/certbot renew --webroot -w /var/www/certbot && cd $SCRIPT_DIR && docker compose exec nginx nginx -s reload"
