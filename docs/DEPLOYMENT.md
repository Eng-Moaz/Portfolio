# Vercel deployment for this repository

The project uses Astro's `output: 'static'`. It needs no server-side rendering, Vercel adapter, runtime API, database, or API token. The complete site is generated into `dist/` and uses the default root path `/`. No deployment or GitHub push has been performed.

## GitHub → Vercel

When you approve publication:

1. Commit the project source, `package-lock.json`, `public/`, and **`src/data/github.json`** to your chosen GitHub repository. Exclude `.env`, `.astro`, `node_modules`, `dist`, and private notes. Review drafts too: a public Git repository exposes source files even if those files do not become website pages.
2. In Vercel, choose **Add New → Project**, import that repository, and choose the branch you intend to publish.
3. Set the root directory to the folder containing this `package.json` (repository root if this project is the whole repository).
4. Select **Astro**, Node.js **22.x**, install command **`npm ci`**, build command **`npm run build`**, and output directory **`dist`**. `vercel.json` supplies the framework and command defaults.
5. Add **`SITE_URL`** with the final public origin, for example `https://your-domain.example`, replacing that example with your actual Vercel or custom domain. No trailing path, credentials, query or fragment. It is not a secret. Redeploy after changing the domain.
6. Leave **`CONTENT_PREVIEW` unset**. The prebuild check refuses a Vercel build if it is set to `true`. Local preview is `npm run dev`; never use `npm run build:preview` as Vercel's build command.
7. Deploy only after reviewing the generated public output. On the deployed URL, check the homepage, project detail, image URLs, theme switch, published writing and calendar.

Astro's `site` setting uses SITE_URL first, then Vercel's `VERCEL_PROJECT_PRODUCTION_URL` when available. If neither exists, canonical/og:url tags are omitted rather than pointing to localhost or an invented domain. Page titles, descriptions, Open Graph text and Twitter summary metadata are already present. Development, content previews, and Vercel preview environments receive noindex metadata; this is indexing guidance, not access control.

## GitHub contributions in production

The initial deployment works from the committed JSON cache. `npm run build` first attempts a fresh public GitHub calendar fetch and validates every date/count before atomically replacing the cache. If GitHub is unavailable, rate-limited, or its HTML changes, the last committed valid data remains and the build continues. The rendered calendar includes its fetch date, range and the exact sum of its displayed days.

No token is required. No browser fetch or client token exists. The GitHub fetch runs only during builds or an explicit `npm run github:refresh`. A static deployment does not change between builds. A successful Vercel build refresh is part of that deployment's artifact; it does not commit back to GitHub. Update the committed cache periodically with `npm run github:refresh` so future failed refreshes have a recent baseline.

A schedule is optional, not required for the first deployment. If you later want daily refreshes, create a Vercel deploy hook and store its URL as a GitHub Actions secret, then use a scheduled workflow to trigger that hook. Do not paste the hook URL into public source: it authorizes builds. No hook, secret, workflow, cron job, or automation has been created here. Alternatively, trigger a manual Vercel redeploy whenever you want newer activity.

## Local checks

```sh
npm ci
npm run check
npm run build
npm run audit:build
npm run preview -- --host 127.0.0.1 --port 4323
```

The audit checks built local links and images, rejects sample/draft routes, rejects accidental QA/vault/env artifacts, and checks that the cached contribution counts are present in the public homepage. It does not replace a human review of what you intend to publish.

For local visual review with samples:

```sh
npm run dev -- --host 0.0.0.0 --port 4322
```

The public build currently contains the real project notes and contribution calendar. Writing and log samples are intentionally absent. Their archive pages have honest empty states until real entries are published.

## Sources

[Astro on Vercel](https://vercel.com/docs/frameworks/frontend/astro) supports zero-configuration static deployment. [Astro's site configuration](https://docs.astro.build/en/reference/configuration-reference/#site) controls the deployed origin. This repository keeps a static build and adds no adapter.
