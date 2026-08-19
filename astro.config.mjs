import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import process from 'node:process';

const site = process.env.SITE_URL ?? 'https://life-atlas.jp';

export default defineConfig({
  site,
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
