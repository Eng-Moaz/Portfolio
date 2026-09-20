# Assets in this portfolio

The site keeps its own images and files. Visitors never fetch portfolio media from `raw.githubusercontent.com`, and there is no image-hosting account or per-request image service. Astro optimizes imported source images during `npm run build`; Vercel serves the generated files statically.

## `src/assets` or `public`?

Use **`src/assets/` for photographs, screenshots, diagrams, and certificate thumbnails**. Astro reads these files during the build, verifies their dimensions, and creates optimized responsive output. Components render width and height so the browser can reserve the correct space before an image loads. Keep a high-quality original here; generated variants are written to `dist/_astro/`, not back over the source.

Use **`public/` for files that need an unchanged, stable URL**: CV PDFs, certificate PDFs, downloadable archives, and the existing brand SVGs. Astro copies these files byte-for-byte into `dist/`. It does not resize, compress, fingerprint, or inspect them. A visitor downloads exactly what you committed.

| Asset | Preferred location | Build behavior | Visitor receives |
| --- | --- | --- | --- |
| Personal photo | `src/assets/about/` | Optimized variants | Best responsive variant |
| Project screenshot/diagram | `src/assets/projects/PROJECT/` | Optimized variants | Best responsive variant |
| Writing image | `src/assets/writing/ARTICLE/` | Optimized when referenced with Markdown image syntax | Best responsive variant |
| Certificate thumbnail | `src/assets/certificates/` | Optimized variants | Best responsive variant |
| CV | `public/files/Moaz_Mohamed_CV.pdf` | Copied unchanged | Original PDF |
| Certificate PDF | `public/files/certificates/` | Copied unchanged | Original PDF |

Do not put private originals in either directory. Both become part of public repository history when committed, and every referenced or public file can become a public URL. `draft: true` hides a page from the production build; it does not make a file private in a public Git repository.

## 1. Add a personal photograph

1. Put the publishable original in `src/assets/about/`, for example `src/assets/about/university-day.jpg`.
2. In `src/content/pages/about.mdx`, add it to `media` using a path relative to that MDX file:

```yaml
media:
  - image: ../../assets/about/university-day.jpg
    group: university
    alt: Moaz standing outside a university engineering building
    caption: A day at Suez Canal University
    kind: photo
    width: 1600
    height: 1200
```

3. Remove the matching `photoSlots` placeholder. Use concrete alt text that describes what matters in the photograph. Captions are optional and can add context without repeating the alt text. About images are lazy-loaded because they appear below the page heading.

## 2. Add a project screenshot

Put it in `src/assets/projects/PROJECT-SLUG/`, then add a `media` item to the matching project entry:

```yaml
media:
  - id: api-flow
    image: ../../assets/projects/chirpy/api-flow.png
    alt: Request flow from the Go HTTP handler to PostgreSQL
    caption: The request crosses authentication, validation, and the sqlc query layer.
    kind: diagram
    featured: true
    width: 1800
    height: 1100
```

`featured: true` puts that image first in the homepage and Work previews. When `media` is empty, those previews automatically use their compact text-only layout. Adding the first real media entry switches the layout without a component edit. Do not add an empty or substitute image simply to fill the space.

For a figure inside an MDX case study, give the media item an `id` and follow `docs/CASE_STUDIES.md`. Preserve PNG when fine diagram text needs lossless edges. WebP or JPEG is usually suitable for photographs and UI screenshots. Always inspect the generated image at desktop and phone widths; compression is not useful if labels become unreadable.

## 3. Add an image inside a blog post

Put it under `src/assets/writing/ARTICLE-SLUG/` and use a relative Markdown image from the article:

```md
![Three Pods selected by one ClusterIP Service](../../assets/writing/kubernetes/service-pods.png)
```

Astro processes local Markdown images and emits intrinsic dimensions and optimized output. The simplest writing workflow is ordinary Markdown image syntax plus a descriptive sentence immediately after it. Use `loading="eager"` only for a genuine above-the-fold hero; the shared project, About, and certificate components lazy-load below-the-fold media by default.

## 4. Add or replace the CV

The exact path is:

```text
public/files/Moaz_Mohamed_CV.pdf
```

Create `public/files/` if it does not exist. Keep that exact case-sensitive filename. The shared layout checks for the file at build time. In local development, a disabled **CV coming soon** label appears while it is missing. In production, the missing control is omitted, so there is no broken link. Once present, **Download CV** appears beside the theme switch and points to `/files/Moaz_Mohamed_CV.pdf`.

You do need to add the PDF to this repository and commit it if GitHub is the source Vercel builds from. You do **not** upload it to GitHub separately, create a GitHub Release, or use a raw-file URL. Astro copies `public/files/Moaz_Mohamed_CV.pdf` to `dist/files/Moaz_Mohamed_CV.pdf`; Vercel serves that file from the same domain as the site.

To replace the CV later, overwrite the local PDF with the new version while keeping the filename, review it for private information, then commit and push. A normal Git-connected Vercel deployment publishes the new file. No Astro code change is needed. Browsers may cache an unchanged URL briefly; if immediate cache invalidation ever matters, change the filename and `cvPath` together.

## 5. Add a certificate PDF

Put the public document at `public/files/certificates/SHORT-SLUG.pdf`. Before committing, inspect the PDF for student IDs, QR codes, credential numbers, signatures, addresses, or other personal data. Redact only on a publishable copy; keep the private original outside the repository. Refer to it as `pdf: /files/certificates/SHORT-SLUG.pdf` in the certificate entry.

Replacing it under the same filename updates the stable URL on the next build. Removing the entry does not remove the PDF automatically; remove both deliberately if the document should no longer be public, remembering that Git history may retain earlier commits.

## 6. Add a certificate thumbnail

Create a cropped preview that does not reveal unnecessary identifiers and store it in `src/assets/certificates/`. Reference it from the certificate frontmatter:

```yaml
thumbnail: ../../assets/certificates/kubernetes-course.webp
```

The thumbnail goes through Astro’s image pipeline. The PDF remains an unchanged public download. They are deliberately separate so a page preview can be lightweight and privacy-reviewed.

## Preparing and checking images

Keep source dimensions large enough for the largest intended display, but do not commit camera-sized files without reason. A 1600–2400 px long edge is usually enough for portfolio photography; diagrams should prioritize readable labels. Preserve the private original outside the public repository if you may need it later.

```bash
npm run image:prepare -- path/to/input.png src/assets/projects/SLUG/output.webp
npm run check
npm run build
npm run audit:build
```

The preparation script is optional. Astro still performs final build-time optimization for imported assets. Check both themes and a narrow viewport after adding media.

## Existing logos and provenance

The Docker, PyTorch, Go, Kubernetes, AWS, Terraform, and GitHub SVGs in `public/images/logos/` come from Devicon v2.17.0; its MIT license is included at `public/images/logos/DEVICON-LICENSE.txt`. Logos identify technologies and do not imply endorsement.

The Deep Activity Recognition architecture and confusion matrix are existing repository artifacts pinned and attributed in that case study. Their current public paths are retained for backward compatibility. New project media should use `src/assets` unless a stable unprocessed URL is specifically required.
