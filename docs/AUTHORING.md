# Portfolio content

Run `npm run dev -- --host 0.0.0.0`, then open http://localhost:4321. Development includes drafts and samples and displays a preview notice. `npm run build` excludes both. `npm run build:preview` deliberately includes them for a local static review; never deploy that output without publication approval. Run the normal build again before publishing.

## Create content

```sh
npm run new:post -- my-note "My note"
npm run new:project -- my-project "My project"
npm run new:experiment -- my-experiment "My experiment"
npm run new:log -- a-small-observation "A small observation"
```

Commands create Markdown in `src/content/writing`, `projects`, `experiments`, and `log`. Slugs accept lowercase letters, numbers, and hyphens only. Existing files are never overwritten. Templates live in `templates/`. Edit the generated Markdown and frontmatter, then run `npm run check`. The collection schemas in `src/content.config.ts` validate required fields. Projects, writing and experiments automatically appear in their indexes and routes; no component changes are needed. Logs are retained locally, with no public route.

All new content defaults to `draft: true`. For a real entry ready to publish, set `draft: false` and keep `sample: false`. Samples remain excluded even if draft is false. Replace demonstration material with your own verified writing rather than simply unmarking samples. Dates are ISO dates displayed in UTC. Projects sort by `order`; writing entries sort newest first.

## Project images: one list, every view

Put images in `public/images/projects/<project-slug>/`. For automatic resizing, orientation correction, metadata stripping, and WebP conversion:

```sh
npm run image:prepare -- /absolute/path/to/screenshot.png my-project hero
```

This writes `public/images/projects/my-project/hero.webp` (maximum width 1600px, no upscaling), refuses existing outputs, and prints frontmatter with actual dimensions. Paste that into the project's `media` array:

```yaml
media:
  - src: /images/projects/my-project/hero.webp
    alt: Search results with highlighted passages and source links
    caption: Hybrid search interface
    kind: screenshot
    featured: true
    width: 1600
    height: 1000
  - src: /images/projects/my-project/architecture.png
    alt: Retrieval architecture showing the indexing and query paths
    kind: diagram
    width: 1200
    height: 800
```

`alt` is required. Captions are optional. Kinds are `screenshot`, `diagram`, `photo`, or `illustration`. Use accurate dimensions to reserve space; omitted dimensions default to 1200 × 800, so supply real values. Mark only one image featured. The drawer puts it first and shows up to two images; brief project pages render every image in metadata order; case studies place figures inline by ID (see CASE_STUDIES.md). The same list powers the Work archive. No duplicated image lists.

To reorder, move entries in the array. To replace, prepare a new filename and update `src`, dimensions, and alt text. To remove, delete its metadata entry; remove the unused asset separately if desired. Missing image collections show a gentle empty state. Images use responsive CSS, native lazy loading, and async decoding. Public files are not automatically optimized by Astro; use the preparation command for large photos and screenshots. SVG illustrations remain vectors.

Use `sample: true` on illustrative placeholders so production galleries exclude them. Raw public assets are still copied to `dist` even when their references are filtered; do not store confidential drafts in `public`.

## Essays

Use `##` and `###` headings to generate the table of contents. Fenced code gets syntax highlighting, a language label, and a copy button. Add an optional filename immediately before a code fence:

```html
<p class="filename">Dockerfile</p>
```

For callouts use `<div class="callout">…</div>`. For captioned images use `<figure><img …/><figcaption>…</figcaption></figure>`. Include alt text, width, height, and `loading="lazy"`. Wide tables can be wrapped in `<div class="table-scroll">` with blank lines around the Markdown table. Sample essays demonstrate all these patterns.

## Experiments and logs

Experiments require a question, dataset, model, methodology, and reproduction command. Each metric has `label`, `baseline`, `candidate`, and `unit`. The chart compares paired values; use compatible units in one experiment. State uncertainty, dataset versions, exact split, and scale. Never substitute an illustrative result for a measured one. Optional `project` is a project slug.

Logs are ordinary short Markdown entries with title, description, date, draft, and sample fields. They remain in the repository for reference. The homepage section and `/log/` route were removed; creating a log does not publish it.

## GitHub activity

`npm run github:refresh` fetches the public contribution calendar from GitHub directly, without an access token, and writes validated daily dates, counts, levels, and a fetch timestamp into `src/data/github.json`. These are contributions, not raw commits. The displayed total is the sum of precisely the displayed days.

The normal build refreshes automatically and uses the cache if fetching fails. You can also run it in a scheduled CI job and commit the updated cache through your normal review process. No schedule or deployment has been configured. A network error or malformed response preserves the last valid cache; the public HTML parser may need maintenance if GitHub changes its markup. No secret setup is required. Nothing fetches data or sends tokens from the client.

If the cache has an empty `days` array, development shows a clearly labeled sample calendar. Public builds show the connection-pending notice without invented counts. Any valid cache automatically replaces the preview data. Check the displayed fetched date to assess staleness.
