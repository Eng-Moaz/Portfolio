import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { loadEnv } from 'vite';
import { notebookLight, notebookDark } from './src/themes/notebook.mjs';

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), 'SITE_');
const configuredSite = process.env.SITE_URL || env.SITE_URL;
const site = configuredSite || (process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
if (site) {
  const url = new URL(site);
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('SITE_URL must be an http(s) origin, without a path, query, or credentials.');
  }
}

export default defineConfig({
  site,
  base: '/',
  trailingSlash: 'always',
  integrations: [mdx()],
  output: 'static',
  markdown: {
    shikiConfig: { themes: { light: notebookLight, dark: notebookDark }, defaultColor: false },
  },
});
