# Architecture

Astro 7 static output, strict TypeScript, typed Content Collections, Markdown/MDX, authored CSS, minimal client JavaScript. Existing fonts, project facts, theme palette, and drawer interaction were retained and evolved.

## Collections and routes

`src/content.config.ts` defines projects, writing, experiments and log. `src/lib/content.ts` centralizes publication filtering. Every index, homepage preview, and `getStaticPaths` uses it. Development or explicit `CONTENT_PREVIEW=true` includes drafts/samples; a normal production build excludes either flag. Projects carry verified facts and one structured media array. Experiments carry protocol and paired metrics; writing and log use dated editorial fields.

Routes: `/`, `/work/`, `/work/[slug]/`, `/writing/`, `/writing/[slug]/`, `/experiments/`, `/experiments/[slug]/`, `/log/`. Detail paths are generated from content IDs.

## Components

- BaseLayout: fonts, theme bootstrap, skip link, margin theme control, preview notice, footer. No global navigation bar.
- DocumentLayout: title, publication notice, accessible homepage link.
- Constellation: original pencil paths and CSS-animated handwritten technology stickers.
- ProjectDrawer: semantic tabs, focus/hover preview, mouse navigation and explicit touch link.
- MediaGallery: single shared project-media list, featured-first compact preview, complete detail gallery.
- Contributions: server-rendered dated calendar, accessible count list, explicit source period and fetch time.

## Data and authoring

`scripts/new-content.mjs` validates slugs and uses exclusive file creation. Templates are in `templates/`. `scripts/prepare-image.mjs` creates bounded WebP assets and prints metadata, without overwriting. Public media is static, lazy loaded, and sized by metadata. `scripts/github.mjs` validates a complete consecutive calendar from GitHub's public HTML and atomically replaces the cache only on success. Tokens are not required or shipped.

See AUTHORING.md for all publishing and media operations. No deployment, scheduled automation, or GitHub push is included. Future RSS, sitemap and canonical URL setup need a confirmed public domain.
