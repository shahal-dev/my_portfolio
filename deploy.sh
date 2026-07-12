#!/usr/bin/env bash
# Day-to-day redeploy for the Strapi CMS after the initial ./init-tls.sh
# setup has already been done once. Pulls the latest pre-built image (built
# by GitHub Actions on every push to cms/ — this VM never builds it locally,
# there isn't enough RAM) and restarts Strapi, reloads nginx (harmless
# no-op if its config didn't change). Run this on the VM after the GitHub
# Actions build for a CMS change has finished.
#
# This does NOT touch the frontend — that's Vercel's job (push to GitHub,
# or trigger a manual redeploy in the Vercel dashboard).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Pulling latest compose/nginx config changes"
git pull

echo "==> Pulling latest Strapi image"
docker compose pull strapi

echo "==> Restarting Strapi"
docker compose up -d strapi

echo "==> Reloading nginx"
docker compose exec nginx nginx -s reload

echo "==> Done"
