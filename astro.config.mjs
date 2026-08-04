// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { BLOG_POSTS } from './src/lib/blog.ts';

const blogLastmod = new Map(BLOG_POSTS.map((post) => [`/blog/${post.slug}/`, post.publishDate]));

// https://astro.build/config
export default defineConfig({
  site: 'https://panchangpath.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/cities.json'),
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