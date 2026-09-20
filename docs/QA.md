# Verification record

## Completed initial iteration checks

- Astro type check: zero errors, warnings, or hints.
- Production build: nine public pages; sample essay and experiment detail routes excluded.
- Local HTTP audit: 13 development routes and 18 linked local resources returned 200.
- Four content generators: valid drafts created, collisions refused without overwriting, traversal slug rejected.
- Gallery round trip: adding a media item in project frontmatter updated both homepage and detail page, then the test item was removed.
- Image helper: WebP conversion succeeded; existing output refused.
- Malformed GitHub response: byte-for-byte cache preserved.
- Desktop light/dark browser inspection; keyboard tab selection; narrow viewport drawer selection followed by explicit project link; article copy control; mobile contents collapsed.
- No warning/error console entries observed in inspected pages.

Browser viewport override did not take effect in the first browser session. Narrow layouts were inspected in a temporary 390px iframe (375px document width after its scrollbar), with no horizontal overflow on the homepage and article. This is browser layout validation, not physical-device testing. The temporary QA pages are removed before the final build.

Final refinement checks are recorded below after execution.

## Final refinement results

- Final `npm run build`: passed, nine static public pages; Astro check reported zero errors, warnings, and hints.
- `npm run audit:build`: passed, 65 internal links/assets/fragments checked, drafts/samples absent, all 371 cached contribution dates/counts present, temporary QA files absent.
- Build with a temporary SITE_URL: every public page had the expected canonical URL. The final artifact was rebuilt without the test domain.
- Vercel guard: CONTENT_PREVIEW=true deliberately rejected with exit status 1.
- Markdown fixture: paragraphs, YAML, GFM tables, task lists, strikethrough, footnotes, images, links, HTML callouts and dual-theme highlighting passed; math remained literal as documented. Invalid date frontmatter was rejected. Fixtures removed.
- Browser: true 390px viewport became available in the refreshed session. Homepage and article had no page overflow. Mobile code scrolled inside its insert. Both themes, genuine logo assets, mobile contents expansion, and copy-button success feedback inspected. Console showed no warning/error entries in checked pages.
- Syntax comparison: Rosé Pine Dawn/Moon versus Notebook paper/charcoal. Final token contrast minimum 4.82:1 light and 6.30:1 dark.
- Reduced-motion CSS branch applied in a temporary browser harness: all sticker animation names became none. This tests the authored branch, not a physical device's OS preference. Harness removed.
- Static production preview: no local-preview notice or sample essays; all 371 calendar cells and visible logos loaded. Latest build cached 462 contributions. Counts may change on subsequent refreshes.

No push or deployment performed. Native clipboard contents were not independently readable through the browser bridge; the copy control reported a successful clipboard write.


## Personal identity and case-study pass — 20 September 2026

- Final `npm run build`: success, nine static pages. `astro check`: zero errors, warnings or hints across 31 files. The build itself emits two non-blocking Rolldown `MODULE_LEVEL_DIRECTIVE` warnings for Astro-generated `use astro:head-inject` directives in the two MDX entries. These entries import server-rendered Astro figure components; their CSS is global. Both affected production pages were inspected and their content/styles render correctly. Warnings were not hidden.
- `npm run audit:build`: passed 74 internal links, assets and fragments; all source drafts/samples excluded; removed `/log/` output and links absent; old public branding absent; About present; missing CV link absent on every generated page. Calendar still matches its 371-day cached series and 462 total. This build’s network refresh failed and correctly preserved the last valid cache dated 19 September.
- Browser review: default desktop and 390px viewport; light and dark styles across home, About, project article, Work archive and sample blog. Mobile home/About/case study/Work/blog all had `scrollWidth === clientWidth` (375px content viewport). No page-level horizontal overflow. Long case-study code scrolls inside 337px code regions.
- All six authentic logo images loaded. Separate live computed-transform samples and screenshots confirmed changing, independent positions. Mobile Terraform was moved slightly up/left after visual inspection to leave more space around Go. Central star absent. Handmade underline now spans the full name and starts at its left edge.
- Reduced motion: a temporary local harness applied the exact authored reduced-motion media-rule contents to the homepage. All six computed animation names became `none`, and underline dash offset became zero. This verifies the rule contents, not OS-level preference emulation. Harness removed before final build.
- Mobile drawer selects without navigation, then its explicit project link opens the correct page. All project detail pages use the same GitHub source-link component. About link and supplied email/profile URLs are correct.
- Case-study TOC toggles and anchors work; copy button reaches `Copied`. Existing clipboard bridge limitation still applies: operating-system clipboard contents were not independently checked. Two contextual figures load at 1200px/1000px intrinsic widths; neither is appended as a duplicate end-gallery. Sticky desktop TOC and collapsed mobile TOC verified.
- About has two clearly labeled photo placeholders as requested. A temporary content-only removal of all slots produced a text-only About page with no gallery or broken images; original slots restored. No real personal photograph or certificate invented.
- CV PDF is genuinely absent; no substitute file created. The link is conditioned on an actual file at build time and uses same-origin download semantics. Download behavior with the user’s real PDF remains to be checked when supplied.
- Project generator now rejects an existing MDX sibling as well as an existing Markdown file. Attempting to create the converted activity-recognition slug returned “Already exists as MDX” without writing.
- Case study reviewed against public revision `1c7160a349997d29eae9673faaaca7c13e15fb42`. Supplied training-platform story included. Results explicitly repository-reported; no GPU experiment or benchmark reproduction performed. Source limitations are described, not silently repaired in an unrelated repository.
- No deployment, push or commit performed. No CV file or temporary QA artifacts included.

## Latest-code portfolio iteration — 20 September 2026

This pass starts from `7aa72d6` and supersedes earlier notes about absent photos, certificates, CV and unpublished case studies. Those user-supplied additions are present and preserved.

- `npm run check` and final `npm run build` passed: 36 checked files, zero type-check errors/warnings/hints, 12 static pages and 33 optimized images. The two existing MDX/Rolldown directive warnings remain. The network-restricted GitHub refresh retained the valid cache.
- `npm run audit:build` passed all 206 internal links/assets/fragments. Additional assertions verified the four local favicon declarations on every page, valid 16/32/48 ICO entries, DocMesh/status in home/archive/article, and removal of both requested sentences. The favicon image was visually inspected at 32px; native browser tab chrome is not exposed by this browser bridge.
- Production browser: DocMesh status visible in its article and Work archive; five homepage project tabs; mobile dark article and certificates fit the 375px content viewport without horizontal overflow. All three existing certificate thumbnails loaded. No browser warning/error entries appeared in the final inspected pages.
- About: correct Engineering → Modaresy → Linux order; full-frame Modaresy photograph; desktop Chinese layout retained. Chinese pair inspected at 390px and 320px viewports, with no page overflow, contained images and readable captions. Dark mobile pair inspected again in production; opening its full-size photograph successfully loaded a 1200px image.
- Certificate resilience: temporarily pointed an existing entry at absent thumbnail/PDF files, built successfully, and verified the title/credential remained while broken assets/links were omitted. Original metadata restored before the final build. Both existing Coursera credential URLs returned HTTP 200 after redirects.
- Existing certificate entries, writing, four prior project articles, constellation/calendar components and syntax themes were verified unchanged by this pass. No fabricated certificate entry was inferred from the unregistered Deep Learning Specialization PDF.
- DocMesh researched at revision `0c9206e3fa65e63ca9647c9928053012d5a102b8`. Article distinguishes current single-page implementation from the user's proposed judge/evaluator pipeline and broader vision. No external inference or benchmark was run.
- No commit, push or deployment performed. Production preview: `http://localhost:4323/`.
