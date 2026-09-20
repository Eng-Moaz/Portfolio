# Publishing selected Obsidian notes

The site accepts ordinary Markdown in `src/content/writing/`. Nothing watches, imports, synchronizes, or scans an Obsidian vault. Copy only a note you have chosen to publish and only its intended attachments. A draft committed to a public GitHub repository is still public source, even when the website excludes it. Keep private originals outside this project.

## The short workflow

1. Copy a selected note to `src/content/writing/a-readable-slug.md`, or start with `npm run new:post -- a-readable-slug "A readable title"` and paste the body.
2. Add or merge the frontmatter below. Unknown Obsidian metadata does not become article text, but remove private metadata before committing the file.
3. Copy selected images to `src/assets/writing/a-readable-slug/` and update image paths. Only put publishable attachments in the repository; draft content is still visible in public Git history.
4. Convert wikilinks and embeds as described below. Run `npm run dev -- --host 0.0.0.0 --port 4322` and inspect `/writing/a-readable-slug/` in both themes.
5. Run `npm run check`. When the article is genuinely ready, set `draft: false`. Run `npm run build` and inspect the output before committing or deploying through your own approval process.

```yaml
---
title: "A readable title"
description: "One sentence about the question this note explores."
date: 2026-09-19
tags: [containers, notes]
draft: true
sample: false
---
```

Required: title, description, date. A missing draft flag defaults to true; use an explicit flag so intent is visible. All supplied demonstration essays have both `draft: true` and `sample: true`; neither belongs in a public build. Do not unmark a sample as your work. Write or replace it first.

## Compatibility boundaries

| Feature | Current behavior | Preparation needed |
| --- | --- | --- |
| Markdown paragraphs, headings, emphasis, lists, quotes | Supported | None |
| YAML frontmatter | Typed and validated | Add title, description, date and publication flags |
| Fenced code | Shiki highlighting, language label, copy button, horizontal scrolling | Name the language after the opening fence |
| Tables, task lists, strikethrough | Astro's GFM Markdown | Check wide tables on mobile |
| Ordinary Markdown links | Supported | Use public route URLs, not vault file paths |
| Images | Standard Markdown images | Copy chosen files to `src/assets/writing/...` and use a relative `../../assets/writing/...` path so Astro optimizes them |
| `[[Note]]`, `[[Note\|label]]` | Not resolved | Convert to `[label](/writing/note-slug/)` |
| `[[Note#Heading]]` | Not resolved | Convert to `[label](/writing/note-slug/#heading-id)` and verify generated heading IDs |
| `![[image.png]]` | Not resolved | Convert to `![Meaningful description](/images/writing/note-slug/image.png)` |
| `![[Other note]]` / section transclusion | Not supported | Copy only the selected public excerpt, or link to its published article |
| Obsidian callouts | Native `[!NOTE]` markers are not converted | Convert to a styled HTML callout or ordinary blockquote |
| Custom callouts, plugin widgets, Dataview, canvas | Not supported | Rewrite as static Markdown, a table, or an exported image |
| `$...$` / `$$...$$` math | Not currently rendered as mathematics | Use inline code/plain text for now; add and test remark-math + rehype-katex when actual notes need it |
| Obsidian block references and `^block-id` | Not resolved | Replace with heading links or ordinary text |
| Obsidian `%% private comments %%` | Not hidden by this renderer | Remove them; they can appear as literal public text |
| Markdown footnotes | Supported by GFM | Preview numbering and links in the actual article |
| MDX | Supported, optional | Use `.md` for copied notes; JSX/brace semantics can differ in `.mdx` |

This is a selected-note workflow, not complete Obsidian compatibility. No vault has been imported or tested.

## Links and attachments

Prefer absolute site-relative paths. A Markdown filename in the vault is not automatically a website URL:

```md
Read [the layer note](/writing/docker-image-layers/).

![Layer cache illustration](../../assets/writing/my-note/layers.webp)
```

The example layer article is a draft, so a **published** article must not link to it until the target has been replaced with approved published content. The production audit catches missing local targets. Link filenames and URL paths are case-sensitive on Vercel.

For captions and reserved image space:

```html
<figure>
  <img src="/images/writing/my-note/layers.webp"
       alt="Dependency layers reused before application code changes"
       width="1200" height="800" loading="lazy" decoding="async" />
  <figcaption>A comparison of the two build orders.</figcaption>
</figure>
```

Plain HTML `<img>` uses a public URL and does not receive Astro optimization. Prefer ordinary Markdown image syntax for local `src/assets` images. Use HTML only when a caption is essential and you have deliberately imported an image through MDX. Do not copy a whole attachments directory automatically.

The first imported note is `src/content/writing/getting-started-with-kubernetes.md`. Its source remains untouched at the external Obsidian path; only this selected article was copied and transformed. It stays `draft: true` until Moaz confirms the title, date, and final text.

## Code inserts

Ordinary fences work without custom components:

````md
```python
# Keep configuration attached to the result
print("hello, notebook")
```
````

For an optional filename, place `<p class="filename">train.py</p>` immediately before the fence. The enhancement moves it into the code insert's label. Without JavaScript the highlighted code and filename still render; the clipboard button needs JavaScript and a browser that allows clipboard access.

The selected palette is defined in `src/themes/notebook.mjs`. Two light/dark candidates were compared: Rosé Pine Dawn/Moon and Notebook paper/charcoal. Notebook was chosen for stronger comment contrast, fewer competing colors, and its warm dark background. Both themes are rendered at build time; changing the site theme needs no re-highlighting or library download.

## Callouts

```md
> [!NOTE] Keep the inputs
> Record the dataset version beside the run configuration.

> [!WARNING]
> This is a synthetic example, not a measured result.
```

Convert that note to the already supported HTML insert:

```html
<div class="callout">
  <strong>Keep the inputs.</strong>
  Record the dataset version beside the run configuration.
</div>
```

An ordinary Markdown blockquote also works when a special callout style is unnecessary. Folding and custom callout types are not implemented. The installed Astro 7 uses Sätteri for Markdown; adding legacy remark plugins requires an extra processor package. This refinement deliberately keeps the current native renderer and documents conversions rather than installing a second Markdown processor for one syntax feature.

## Retired lab presentation

The homepage no longer promotes Labs or Experiments. Existing `src/content/experiments/`, schemas, template, generator and routes are retained so useful material and existing direct links survive. The current experiment is sample/draft only and has no public production detail route. Turn a verified experiment into a writing entry or a project section when ready; then remove redundant routes only after checking inbound links and adding deliberate redirects where needed.
