// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { BLOG_POSTS } from './src/lib/blog.ts';
import { FESTIVALS_2025_2027, getFestivalSlug } from './src/lib/festivals.ts';

const blogLastmod = new Map(BLOG_POSTS.map((post) => [`/blog/${post.slug}/`, post.publishDate]));

// The 32 2025 festival pages are noindexed (historical, past-dated, negligible ongoing
// search demand — see docs/superpowers/plans/2026-08-26-three-initiative-scoping.md).
// Sitemaps should only list indexable pages, so exclude the same set here.
const noindexedFestivalPaths = new Set(
  FESTIVALS_2025_2027.filter((f) => f.date.startsWith('2025-')).map((f) => `/festivals/${getFestivalSlug(f)}/`)
);

// https://astro.build/config
export default defineConfig({
  site: 'https://panchangpath.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/cities.json') && !noindexedFestivalPaths.has(new URL(page).pathname),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const lastmod = blogLastmod.get(path);
        if (lastmod) item.lastmod = lastmod;

        const depth = path.split('/').filter(Boolean).length;
        item.priority = path === '/' ? 1.0 : depth === 1 ? 0.8 : 0.6;
        item.changefreq = path === '/' ? 'daily' : depth === 1 ? 'weekly' : 'monthly';

        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});