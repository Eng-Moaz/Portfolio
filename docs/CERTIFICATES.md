# Managing certificates

The public page is `/certificates/`. Entries live in the typed `certificates` content collection; the page itself does not need editing when certificates change.

## Add an entry

Run:

```bash
npm run new:certificate -- certificate-slug "Certificate title"
```

This creates `src/content/certificates/certificate-slug.md` as a draft. Fill in the verified issuer, date, and short context. Optional fields:

```yaml
credentialUrl: https://issuer.example/verify/...
pdf: /files/certificates/certificate-slug.pdf
imageFile: /files/certificates/certificate-slug.jpg
thumbnail: ../../assets/certificates/certificate-slug.webp
```

Use `pdf` for a PDF download or `imageFile` when the original certificate is an image. If the certificate gives only a month and year, store the first day of that month and add `datePrecision: month`; the page will display only the verified month and year.

Keep `draft: true` until every public detail has been reviewed. Draft entries appear locally but are excluded from production. Do not create fake or development-only credential entries; the page has an intentional empty state.

## Files

- Public PDF: `public/files/certificates/certificate-slug.pdf`
- Public certificate image: `public/files/certificates/certificate-slug.jpg`
- Optimized thumbnail: `src/assets/certificates/certificate-slug.webp`
- Content and context: `src/content/certificates/certificate-slug.md`

The PDF is copied unchanged and gets a stable URL. The thumbnail is optimized at build time. A credential URL should point to the issuer’s actual verification page, not a guessed homepage.

To replace a PDF, overwrite the file under the same name and rebuild. To remove a certificate, remove its content entry and any PDF/thumbnail that should no longer be published. Removing a file from the current branch does not erase it from Git history.

## Privacy review

Certificates often contain more information than a portfolio needs: legal names, student or credential IDs, signatures, QR codes, birth dates, email addresses, and organization-specific identifiers. Before committing:

1. decide whether the certificate needs to be public at all;
2. inspect the PDF and thumbnail separately;
3. create a redacted public copy when appropriate;
4. confirm that a verification link does not expose more data than intended;
5. keep the private original outside this repository.

`draft: true` is publication control, not access control. A file committed to a public GitHub repository is public even when no page links to it.
