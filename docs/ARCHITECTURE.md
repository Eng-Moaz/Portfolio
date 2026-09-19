# Architecture

Astro 7 static output, strict TypeScript, typed Content Collections, Markdown/MDX, authored CSS, minimal client JavaScript. Existing fonts, project facts, theme palette, and drawer interaction were retained and evolved.

## Collections and routes

`src/content.config.ts` defines projects, writing, experiments and log. `src/lib/content.ts` centralizes publication filtering. Every index, homepage preview, and `getStaticPaths` uses it. Development or explicit `CONTENT_PREVIEW=true` includes drafts/samples; a normal production build excludes either flag. Projects carry verified facts and one structured media array. Experiments carry protocol and paired metrics; writing and log use dated editorial fields.

Routes: `/`, `/work/`, `/work/[slug]/`, `/writing/`, `/writing/[slug]/`, `/experiments/`, `/experiments/[slug]/`, `/about/`. Detail paths are generated from content IDs.

## Components

- BaseLayout: fonts, theme bootstrap, skip link, margin theme control, preview notice, footer. No global navigation bar.
- DocumentLayout: title, publication notice, accessible homepage link.
- Constellation: original pencil paths and CSS-animated authentic logo stickers.
- ProjectDrawer: semantic tabs, focus/hover preview, mouse navigation and explicit touch link.
- MediaGallery: single shared project-media list, featured-first compact preview, complete detail gallery.
- Contributions: server-rendered dated calendar, accessible count list, explicit source period and fetch time.

## Data and authoring

`scripts/new-content.mjs` validates slugs and uses exclusive file creation. Templates are in `templates/`. `scripts/prepare-image.mjs` creates bounded WebP assets and prints metadata, without overwriting. Public media is static, lazy loaded, and sized by metadata. `scripts/github.mjs` validates a complete consecutive calendar from GitHub's public HTML and atomically replaces the cache only on success. Tokens are not required or shipped.

See AUTHORING.md for all publishing and media operations. No deployment, scheduled automation, or GitHub push is included. The static Vercel setup and SITE_URL-driven canonical/Open Graph metadata are documented in DEPLOYMENT.md. RSS and sitemap remain optional future additions.

## Publication focus and Obsidian

Projects and writing are the primary content. Experiment content, schemas, generators and direct routes remain for preservation; the homepage no longer links or previews them. Existing sample experiments remain excluded from production. WRITING.md describes the selected-note workflow and tested Markdown boundaries. No vault reader, import hook or extra Markdown processor has been installed. The installed Astro 7 native Markdown renderer handles ordinary notes; wikilinks, transclusions, native Obsidian callouts and math need the documented conversion or future renderer work.

Shiki emits light/dark CSS variables at build time using src/themes/notebook.mjs. Code controls are a small progressive enhancement; highlighting and text do not depend on client JavaScript.

The normal build rejects CONTENT_PREVIEW on Vercel, refreshes the public GitHub calendar with cache fallback, checks types, then emits static pages. scripts/audit-build.mjs verifies generated local targets and publication boundaries. No runtime credentials, server functions, or Vercel adapter.

## Personal pages and technical articles

`pages` stores About MDX with typed optional media and photo-slot groups. `/about/` renders that content. `AboutPhotos.astro` reads the named group; empty groups render nothing. All project routes use `ProjectArticleLayout.astro`; `caseStudy: true` selects narrative-only content with contextual `ProjectFigure.astro` figures referenced by stable media IDs. Brief projects retain their facts and gallery. `ReadingEnhancements.astro` is shared with writing. `src/lib/site.ts` stores the supplied public email and stable CV URL. `BaseLayout.astro` checks PDF presence at build time; no client fetch or fake file. Logs remain in their collection but have no public route.
