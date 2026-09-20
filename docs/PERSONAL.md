# About, contact and CV

## About content and photos

Edit `src/content/pages/about.mdx` for all personal paragraphs, hobby headings, links, captions and photo groups. The page is chronological and intentionally avoids a résumé-card layout. School rank wording, year, governorate details, visible photograph data, Chess.com profile URL, and any Chinese proficiency claim must be verified by Moaz before deployment. No ratings or exam level are currently claimed.

Store real photos under `src/assets/about/` so Astro can optimize them during the build. Do not put private originals in the repository. Replace a photo slot by adding metadata like this:

```yaml
media:
  - image: ../../assets/about/chinese-study.webp
    group: chinese
    alt: Describe what your actual photograph shows
    caption: Your own short caption
    kind: photo
    width: 1200
    height: 900
photoSlots: []
```

The example filename is not a shipped image. Remove each corresponding `photoSlots` entry after adding a real image. Leave one slot if you only replace one. Remove all slots and use `media: []` for a text-only About page; the gallery disappears without a broken image. For another hobby, add Markdown paragraphs and optionally `<AboutPhotos group="your-group" />` with matching media metadata. No Astro component edits are needed. The Chinese characters 照片 simply mean photograph; the slots make no certificate or travel claim.

## Public email

`src/lib/site.ts` has `contactEmail`, currently `moazmohammed198@gmail.com` as supplied. An empty string hides email links. GitHub and email in the hero are plain accessible links with icons, not forms; email opens the visitor’s mail client.

## Your actual CV

Place the PDF at **`public/files/Moaz_Mohamed_CV.pdf`**. Create the `files` directory if needed. No CV or substitute PDF has been created or committed.

At build time the shared layout checks whether that file exists. When present, every page displays a compact **Download CV** link beside the theme switch. The same-origin URL is `/files/Moaz_Mohamed_CV.pdf` and uses the HTML `download` attribute. When missing, development shows a disabled placeholder and production renders no broken link. Keep the filename unchanged for replacements.

On a Git-connected Vercel project with automatic deployments enabled, replacing the PDF, committing and pushing triggers the rebuild needed to include it. No frontend code edit is needed. Without automatic deployment, run `npm run build` and deploy the new `dist` output. Local static preview also needs a rebuild; restart the dev server after adding/removing the PDF if its presence is cached. Publishing/deployment has not been performed by this refinement task.
