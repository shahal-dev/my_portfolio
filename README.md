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
