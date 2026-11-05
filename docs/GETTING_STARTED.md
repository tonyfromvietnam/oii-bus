# Getting started: from this folder to a live link

## 1. Create the GitHub repo and push

1. On GitHub, create an **empty** repo named `oii-bus` (no README, no .gitignore).
   - Public = GitHub Pages is free. Private needs a paid GitHub plan for Pages (or use Cloudflare Pages, step 3B).
2. From this folder:

```bash
git remote add origin git@github.com:<your-user>/oii-bus.git
git push -u origin main
```

(If you received `oii-bus.bundle` instead of a folder: `git clone oii-bus.bundle oii-bus && cd oii-bus`, then the two commands above.)

## 2. Run it on your machine (optional)

Needs Node 20+ and `corepack enable` (for pnpm 9).

```bash
pnpm install
pnpm dev            # web on http://localhost:5173 (+ server on :2567; Docker optional)
```

Open http://localhost:5173/?preview to enter the bus straight away (skips the weekend opening hours).

## 3. Put the prototype online (static, no server, no secrets)

### A. GitHub Pages (already set up)

1. Repo → **Settings → Pages → Source: GitHub Actions**.
2. Push to `main` (or Actions → "Deploy prototype (GitHub Pages)" → Run workflow).
3. Link: `https://<your-user>.github.io/oii-bus/`

Custom domain `bus.duychinhdinh.com`:

1. Repo → Settings → Secrets and variables → Actions → **Variables** → add `PAGES_CNAME` = `bus.duychinhdinh.com`.
2. At your DNS provider: `CNAME  bus  →  <your-user>.github.io`
3. Repo → Settings → Pages → Custom domain → `bus.duychinhdinh.com`, tick "Enforce HTTPS".

### B. Cloudflare Pages (alternative, works with private repos)

Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick `oii-bus`:

| Setting                | Value                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| Build command          | `pnpm install --frozen-lockfile && pnpm --filter @oii-bus/web build:artifact` |
| Build output directory | `apps/web/dist-artifact`                                                      |
| Environment variable   | `NODE_VERSION` = `20`                                                         |

Then Custom domains → add `bus.duychinhdinh.com`.

### C. Inside your existing website

```bash
pnpm --filter @oii-bus/web build:artifact
```

Copy the three files in `apps/web/dist-artifact/` (`index.html`, `app.js`, `app.css`) into an `oii-bus/` folder of your website → `duychinhdinh.com/oii-bus/`.

## 4. CI

`.github/workflows/ci.yml` runs lint, typecheck, unit tests, build and Playwright on every push / PR. Nothing to configure.

## 5. The full multiplayer version

Needs a server, database, Redis, LiveKit, email. That is milestones M2–M5; the accounts and secrets are listed in [`DEPLOY.md`](DEPLOY.md) and [`.env.example`](../.env.example).
