// @astrojs/sitemap always emits a sitemap-index.xml pointing at sitemap-0.xml
// (in case the site ever exceeds the 50,000-URL-per-file limit and needs sharding).
// PanchangPath is nowhere near that limit, so collapse the two files into a single
// sitemap.xml. If the site ever does grow past one shard, fall back to just
// renaming the index file so multi-shard sitemaps keep working.
import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(import.meta.dirname, '..', 'dist');
const indexPath = join(distDir, 'sitemap-index.xml');
const finalPath = join(distDir, 'sitemap.xml');

if (!existsSync(indexPath)) {
  console.log('[postbuild-sitemap] no sitemap-index.xml found, skipping');
  process.exit(0);
}

const indexXml = readFileSync(indexPath, 'utf8');
const shardUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (shardUrls.length === 1) {
  const shardFile = join(distDir, shardUrls[0].split('/').pop());
  const shardXml = readFileSync(shardFile, 'utf8');
  writeFileSync(finalPath, shardXml);
  unlinkSync(indexPath);
  unlinkSync(shardFile);
  console.log('[postbuild-sitemap] merged single shard into sitemap.xml');
} else {
  renameSync(indexPath, finalPath);
  console.log(`[postbuild-sitemap] ${shardUrls.length} shards present, renamed index to sitemap.xml`);
}
