# Writing a technical case study

Create a draft with `npm run new:project -- my-project "My project"`. The generic Markdown template includes a narrative outline. Replace the placeholder repository profile URL with the actual repository URL, and supply verified metadata. New content stays unpublished until `draft: false` and `sample: false`.

Set `caseStudy: true` to render the body as the full article without automatically appending facts and a large gallery. The same `media` array supplies the homepage drawer and Work archive. The project collection uses this system: Deep Activity Recognition demonstrates media-rich MDX; Chirpy, NYC Taxi Trip Duration, and Production RAG Engine demonstrate text-first Markdown. An empty `media: []` is valid and automatically selects the compact text layout.

For figures drawn from shared metadata, rename the generated `.md` to `.mdx`, add an `id` to each media entry, and import the reusable helper:

```mdx
import ProjectFigure from '../../components/ProjectFigure.astro';

## How the system works

Explain the architecture in your own words.

<ProjectFigure project="my-project" id="architecture" />
```

`ProjectFigure` reads paths, alt text, caption, width and height from that project’s media metadata. Unknown IDs fail the build so typos are caught. Sample media stays hidden in production. Keep `featured: true` on the preview image you want first; the article order is controlled by figure placement in MDX. Ordinary Markdown images and captioned HTML figures also work for images not used in previews.

The shared layout generates a table of contents from `##` / `###` headings. Fenced code gets the same syntax colors and copy controls as writing. Use optional `<p className="filename">filename.py</p>` before an MDX code fence. Wide tables belong in a `div.table-scroll`. Links, blockquotes and callouts use existing article styles.

Tell the engineering story: problem and motivation; implementation; actual challenges and decisions; measured results with evaluation context; lessons and next steps. Do not imply personal experiences or comparisons without evidence. Mark missing information as an author TODO in the draft rather than inventing it. Credit underlying papers, distinguish reported results from reproduced measurements, and pin technical references to a commit.

## Complete project workflow

1. Run `npm run new:project -- project-slug "Project title"`.
2. Replace the placeholder repository URL only after locating the exact repository. Pin source links to the reviewed commit hash.
3. Set `order`, `language`, `summary`, `note`, `facts`, and `evidenceStatus`. Keep `draft: true` while claims are under review.
4. Write the article body in Markdown. Rename to `.mdx` only when you need a component such as `ProjectFigure`.
5. Link source files with commit-pinned GitHub URLs. Refer to exact functions or query files near the explanation they support.
6. Put screenshots and diagrams in `src/assets/projects/project-slug/` and declare them in `media`; see `docs/ASSETS.md`.
7. Put code examples in fenced blocks with a language. Keep excerpts short enough to explain and link to the complete source.
8. Give every metric its dataset split, unit or scale, evaluation method, and provenance. Never compare log-space errors with errors in seconds. Call out leakage or non-comparable setups.
9. Add a caption that explains why a figure matters. Alt text should describe the visible information, not say only “screenshot.”
10. Run `npm run check`, `npm run build`, and `npm run audit:build`. Review the drawer, Work archive, article, mobile layout, and both themes. Set `draft: false` only after the article and personal claims are approved.

Adding a future project never requires editing an Astro page or drawer component. The content collection supplies all listing and detail routes.

## Deep Activity Recognition source review

`src/content/projects/deep-activity-recognition.mdx` uses repository commit `1c7160a349997d29eae9673faaaca7c13e15fb42`. Reviewed README, B1/B3/B7/B8 models, B8 config/training, scene loader, feature extractor, demo, training engine, evaluation, seed utility and B1 run metadata. Research attribution links the CVPR 2016 paper. The training environment account is supplied by Moaz; no additional personal setbacks, hardware types or timing claims were invented.

The README reports B8 88.86%; no training was rerun. The B1 matrix is labeled B1. Source review found a time/player reshape issue, implicit player/team ordering, late seed setup, and a B7 README/source disagreement. The article states these limits and proposed follow-ups; the external ML repository has not been modified. No claim of verified paper reproduction is made.

Run `npm run check`, inspect the article in development, then `npm run build && npm run audit:build` before publishing. Personal source notes belong in the repository, not public assets.

## Additional reviewed repositories

- Chirpy: revision `8f43a5c1d1959572e19df14bd3cb4dda70721641`; reviewed routes, chirp/user/refresh handlers, auth helpers, migrations, SQL queries, and generated database boundary.
- NYC Taxi Trip Duration: revision `8d87bc8c479dcb8cec075f3a5f7f8eaf158b2309`; reviewed preprocessing, CLI modeling workflow, and checked-in baseline/candidate/test results. The case study documents target leakage from speed features derived from `trip_duration`; the metrics are not presented as valid benchmark performance.
- Production RAG Engine: repository `Eng-Moaz/rag-search-engine`, revision `0028b2d4052c24feaedce82c3a649353ff6481bf`; reviewed the inverted index and BM25 implementation, MiniLM and chunk search, weighted and RRF fusion, query enhancement, three rerankers, golden-set evaluation, Groq-backed generation, multimodal search, dependencies, and checked-in logs. The article does not imply a deployment merely because “Production” is in the portfolio title.


## DocMesh (in progress)

The case study is **`src/content/projects/docmesh.md`**. Its `status: in-progress` drives the label in the homepage preview, Work archive and article header. The homepage now passes the sorted collection to the existing drawer without a four-entry cap, so DocMesh appears without removing any existing project.

Reviewed revision: `0c9206e3fa65e63ca9647c9928053012d5a102b8`. Read the vision, all Go handlers/middleware/utilities, Python entry point/model integration/scraper, frontend HTML/JS/CSS, dependency manifests and local Taskfile. The implemented path is a synchronous single-URL question request, not a crawler or indexed knowledge workspace. The judge/evaluator LLM idea and personal difficulty choosing relevant links/stopping points were supplied by Moaz and are identified as proposed work. No paid inference, benchmark, deployment or backend modification was performed.

To add screenshots, put real images in `src/assets/projects/docmesh/` and replace `media: []` with entries such as:

```yaml
media:
  - id: source-input
    image: ../../assets/projects/docmesh/source-input.webp
    alt: Describe the actual screen
    caption: Explain the implemented feature shown
    kind: screenshot
    featured: true
    width: 1200
    height: 800
```

Use the actual filename and dimensions. The homepage and Work archive automatically switch from text-only to image previews. For a contextual figure in the article itself, rename `docmesh.md` to `docmesh.mdx`, import `ProjectFigure` as documented above, and place `<ProjectFigure project="docmesh" id="source-input" />` near its explanation. No Astro layout edits are needed. Do not leave both the .md and .mdx files with the same slug.
