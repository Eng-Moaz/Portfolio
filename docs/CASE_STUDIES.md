# Writing a technical case study

Create a draft with `npm run new:project -- my-project "My project"`. The generic Markdown template includes a narrative outline. Replace the placeholder repository profile URL with the actual repository URL, and supply verified metadata. New content stays unpublished until `draft: false` and `sample: false`.

Set `caseStudy: true` to render the body as the full article without automatically appending facts and a large gallery. The same `media` array still supplies the overlapping homepage drawer and Work archive. Only Deep Activity Recognition has been converted; other project narratives are preserved.

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

## Deep Activity Recognition source review

`src/content/projects/deep-activity-recognition.mdx` uses repository commit `1c7160a349997d29eae9673faaaca7c13e15fb42`. Reviewed README, B1/B3/B7/B8 models, B8 config/training, scene loader, feature extractor, demo, training engine, evaluation, seed utility and B1 run metadata. Research attribution links the CVPR 2016 paper. The training environment account is supplied by Moaz; no additional personal setbacks, hardware types or timing claims were invented.

The README reports B8 88.86%; no training was rerun. The B1 matrix is labeled B1. Source review found a time/player reshape issue, implicit player/team ordering, late seed setup, and a B7 README/source disagreement. The article states these limits and proposed follow-ups; the external ML repository has not been modified. No claim of verified paper reproduction is made.

Run `npm run check`, inspect the article in development, then `npm run build && npm run audit:build` before publishing. Personal source notes belong in the repository, not public assets.
