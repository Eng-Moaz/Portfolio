if (process.env.VERCEL && process.env.CONTENT_PREVIEW === 'true') {
  console.error('Refusing a Vercel build with CONTENT_PREVIEW=true. Draft/sample review is local only.');
  process.exit(1);
}
