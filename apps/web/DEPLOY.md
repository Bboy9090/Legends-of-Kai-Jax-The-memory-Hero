# Deploying Legends of Kai-Jax (apps/web)

`apps/web` is a static Vite build — no server required to serve it. This
document describes deployment **configuration** that exists in this
repository. None of it means the game is currently live at any of these
targets — see `README.md` §10 (Deployment) at the repo root for what's
actually verified/configured today versus what's just documented here.

## Currently configured in this repo's CI

GitHub Actions (`.github/workflows/deploy.yml` and `static.yml`, at the
repo root) deploy `apps/web/dist` to **GitHub Pages** on every push to
`main`. This is the only target with an active, repo-owned CI pipeline as
of this writing.

## Vercel (recommended)

`apps/web/vercel.json` is configured for this. In the Vercel dashboard,
set the project's **Root Directory to `apps/web`**, then Vercel will use
this repo's `vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Or via the CLI, from `apps/web`:

```bash
cd apps/web
npx vercel
```

**This has not been deployed from this session** — no Vercel account or
credentials are available in this environment. `vercel.json` is
configuration, not proof of a live deployment.

## Netlify (backup)

`apps/web/netlify.toml` is configured the same way — set the site's
**Base directory to `apps/web`** in the Netlify dashboard:

```toml
[build]
  command = "pnpm install --frozen-lockfile && pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Also not deployed from this session.

## SPA routing

The app has no client-side router — navigation is entirely
Zustand-state-driven, not URL-based (see `README.md` §9). The rewrite
rules above, and `apps/web/public/_redirects` (`/*  /index.html  200`,
for hosts that read that file directly), exist so that any non-root path
still serves `index.html` instead of 404ing.

## Android / iOS / Desktop

Not covered by this document — see `README.md` §1 and §10, and
`docs/known-debt.md`, for verified status on native targets. None of them
are proven store-ready or signed as of this writing.

## Environment variables

This is a purely client-side static build — no environment variables are
required to build or serve `apps/web` itself.

## Other configuration present but unverified in this document

- `apps/web/wrangler.toml` (Cloudflare Pages) and a root `render.yaml`
  (Render) both exist in the repository from earlier deployment
  experiments. Neither was exercised or confirmed working while writing
  this document — treat them the same as Vercel/Netlify above:
  configuration present, live status unverified.
