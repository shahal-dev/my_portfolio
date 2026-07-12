# Shahal's Portfolio (monorepo)

Two independent projects, one repo:

- **`frontend/`** — the Next.js portfolio site (static export, deploys to Vercel). See `frontend/README.md`.
- **`cms/`** — the Strapi CMS powering blog posts and the astro photo gallery. See `cms/README.md`.

## Local development

```bash
# CMS (run first — the frontend build fetches content from it)
cd cms && npm run develop     # http://localhost:1337

# Frontend
cd frontend && npm run dev    # http://localhost:3000
```

The frontend fetches from Strapi **at build time only** (it's a static export — publishing new
content in Strapi requires a frontend rebuild, not a live update). See `frontend/.env.local.example`
for the `STRAPI_URL` the build reads.

## Deploying Strapi to the VM

The frontend deploys to Vercel as normal (push to GitHub, or a manual redeploy in the Vercel
dashboard). The CMS is self-hosted on an Oracle VM via Docker Compose — this repo only contains
`cms/`'s Dockerfile and the `docker-compose.yml`/`nginx/`/`init-tls.sh`/`deploy.sh` at the root;
the frontend is not part of this Compose setup at all.

**Why TLS matters here, not just as polish:** Vercel serves the frontend over HTTPS. Browsers
block loading images from a plain-HTTP source on an HTTPS page ("mixed content") — without TLS
on the VM, every gallery/blog image would silently fail to load on the live site. `init-tls.sh`
uses [sslip.io](https://sslip.io) to get a real, resolvable hostname for the VM's bare IP
(`<ip-with-dashes>.sslip.io`) with no domain purchase needed, which is enough for a real free
Let's Encrypt certificate today.

**The image is built in GitHub Actions, not on the VM.** Free-tier Oracle VMs are commonly
~500MB–1GB RAM — nowhere near enough to bundle Strapi's admin panel (a Vite build). Every push to
`cms/**` on `main` triggers `.github/workflows/build-cms.yml`, which builds the image and pushes
it to `ghcr.io/<your-github-username>/my_portfolio-cms:latest`. The VM only ever `docker compose
pull`s the finished image — it never builds anything.

### One-time setup (on the VM)

1. Install Docker + the Compose plugin (Oracle Linux is RHEL-based — use `dnf`, not `apt`).
2. **Open ports 80 and 443 in *both* places** — Oracle blocks ports at the cloud network
   security-list level *in addition to* the VM's own firewall (firewalld on Oracle Linux).
   Missing either one is the most common reason this doesn't work on the first try.
3. `git clone` this repo on the VM, `cd` into it.
4. Create `cms/.env` with real secrets — copy the keys from `cms/.env.example` and generate a
   value for each with `openssl rand -base64 32`.
5. **Make the GHCR package pullable**: after the first Actions run finishes (Actions tab on
   GitHub), it publishes as a *private* package by default regardless of the repo's own
   visibility — go to the package's page (from your GitHub profile → Packages) → Package
   settings → change visibility to Public. One-time, ~20 seconds. Skipping this means the VM's
   `docker compose pull` will fail with a permission error.
6. Run `./init-tls.sh <vm-public-ip>` (one time only). It pulls the image, brings up Strapi +
   nginx, obtains the certificate, and prints the resulting `https://<ip-with-dashes>.sslip.io`
   URL.
7. In Vercel's project settings, set the `STRAPI_URL` environment variable to that URL, then
   redeploy the frontend so it builds against the VM-hosted content.
8. Add the cron entry `init-tls.sh` prints at the end (renews the cert automatically — Let's
   Encrypt certs expire every 90 days).

### Redeploying after changes

- **CMS/schema changes**: push to `main` (triggers the GHCR build), wait for the Actions run to
  finish, then `./deploy.sh` on the VM (pulls the new image, restarts Strapi, reloads nginx).
- **Frontend changes**: push to GitHub, or trigger a manual redeploy in Vercel — unrelated to the
  VM.
- Neither side auto-triggers the other yet (no webhook wiring in this pass) — publishing content
  in Strapi still requires a manual Vercel redeploy to show up on the live site, same as the
  local-dev workflow above.
