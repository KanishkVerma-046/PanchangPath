// Maps the set of source files changed between two git commits to the set of
// live PanchangPath URLs that content lives at. Used by
// scripts/indexnow-deploy-diff.mjs to submit only genuinely-changed URLs to
// IndexNow after a deploy, instead of the whole sitemap.
import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { register } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';

// src/lib data modules import each other extensionlessly (e.g. festivals.ts ->
// './ist-date'), which Vite resolves but plain Node doesn't. Register the same
// resolver the test suite uses, so this works however the script is launched.
register('./ts-extension-resolve.mjs', import.meta.url);

const SITE = 'https://panchangpath.com';

// Data files that back a getStaticPaths() dynamic route. Editing the route's
// *template* file (e.g. src/pages/blog/[slug].astro) is deliberately not
// mapped here -- it's a code change that could affect every entry, too many
// to name individually. Editing the *data* file is mapped precisely below.
export const CONTENT_REGISTRY = [
  { file: 'src/lib/blog.ts', exportName: 'BLOG_POSTS', urlPrefix: '/blog' },
  { file: 'src/lib/festivals.ts', exportName: 'FESTIVALS_2025_2027', urlPrefix: '/festivals', slugFn: 'getFestivalSlug' },
  { file: 'src/lib/devotional/aarti.ts', exportName: 'AARTIS', urlPrefix: '/devotional/aarti' },
  { file: 'src/lib/devotional/ashtakam.ts', exportName: 'ASHTAKAMS', urlPrefix: '/devotional/ashtakam' },
  { file: 'src/lib/devotional/chalisa.ts', exportName: 'CHALISAS', urlPrefix: '/devotional/chalisa' },
  { file: 'src/lib/devotional/durgasaptashati.ts', exportName: 'DURGA_SAPTASHATI', urlPrefix: '/devotional/durga-saptashati' },
  { file: 'src/lib/devotional/mantra.ts', exportName: 'MANTRAS', urlPrefix: '/devotional/mantra' },
  { file: 'src/lib/devotional/namavali.ts', exportName: 'NAMAVALIS', urlPrefix: '/devotional/namavali' },
  { file: 'src/lib/devotional/pujavidhi.ts', exportName: 'PUJA_VIDHIS', urlPrefix: '/devotional/puja-vidhi' },
  { file: 'src/lib/devotional/stotram.ts', exportName: 'STOTRAMS', urlPrefix: '/devotional/stotram' },
  { file: 'src/lib/devotional/sundarkand.ts', exportName: 'SUNDARKAND', urlPrefix: '/devotional/sundarkand' },
  { file: 'src/lib/devotional/vratkatha.ts', exportName: 'VRAT_KATHAS', urlPrefix: '/devotional/vrat-katha' },
  { file: 'src/lib/devotional/yantra.ts', exportName: 'YANTRAS', urlPrefix: '/devotional/yantra' },
];

const NON_PAGE_BASENAMES = new Set(['404', '500']);

/** Converts a src/pages/... static file path to its live URL, or null if it's not a mappable static page. */
export function pageFileToUrl(filePath) {
  if (!filePath.startsWith('src/pages/')) return null;
  if (!filePath.endsWith('.astro') && !filePath.endsWith('.md')) return null;
  if (filePath.includes('[')) return null; // dynamic route template, not a single URL

  let rel = filePath.slice('src/pages/'.length).replace(/\.(astro|md)$/, '');
  const base = rel.split('/').pop();
  if (NON_PAGE_BASENAMES.has(base)) return null;

  if (base === 'index') {
    rel = rel.slice(0, -('index'.length)); // drop trailing "index", keep trailing "/" (or "" for root)
  } else {
    rel = rel + '/';
  }
  if (rel === '') return `${SITE}/`;
  return `${SITE}/${rel}`;
}

async function importFresh(absPath) {
  const mod = await import(pathToFileURL(absPath).href + '?t=' + Date.now() + Math.random());
  return mod;
}

export async function loadArrayAtHead(registryEntry, repoRoot) {
  const absPath = join(repoRoot, registryEntry.file);
  const mod = await importFresh(absPath);
  return { arr: mod[registryEntry.exportName] ?? [], slugFn: registryEntry.slugFn ? mod[registryEntry.slugFn] : null };
}

const RELATIVE_IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.{1,2}\/[^'"]+)['"]/g;

function gitHasFile(commit, file, repoRoot) {
  try {
    execSync(`git cat-file -e ${commit}:${file}`, { cwd: repoRoot, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Writes `file` as it was at `commit`, plus every module it relatively imports
// (transitively), into destRoot at their repo-relative paths -- so the snapshot's
// own relative imports resolve against that commit's versions of its neighbours.
// Returns false if `file` itself didn't exist at that commit.
function materializeAtCommit(file, commit, repoRoot, destRoot) {
  if (!gitHasFile(commit, file, repoRoot)) return false;
  const seen = new Set();
  const queue = [file];
  while (queue.length) {
    const current = queue.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    const content = execSync(`git show ${commit}:${current}`, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const dest = join(destRoot, current);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, content, 'utf8');
    for (const [, spec] of content.matchAll(RELATIVE_IMPORT_RE)) {
      const target = posix.normalize(posix.join(posix.dirname(current), spec));
      const resolved = [target, `${target}.ts`].find((candidate) => gitHasFile(commit, candidate, repoRoot));
      if (resolved) queue.push(resolved); // unresolvable: leave it for the import to fail loudly
    }
  }
  return true;
}

export async function loadArrayAtCommit(registryEntry, commit, repoRoot) {
  const snapshotRoot = mkdtempSync(join(tmpdir(), 'indexnow-diff-'));
  try {
    if (!materializeAtCommit(registryEntry.file, commit, repoRoot, snapshotRoot)) {
      return { arr: [], slugFn: null }; // file didn't exist at that commit (newly added) -- everything in it is "new"
    }
    const mod = await importFresh(join(snapshotRoot, registryEntry.file));
    return { arr: mod[registryEntry.exportName] ?? [], slugFn: registryEntry.slugFn ? mod[registryEntry.slugFn] : null };
  } finally {
    rmSync(snapshotRoot, { recursive: true, force: true });
  }
}

function slugOf(item, slugFn) {
  if (slugFn) return slugFn(item);
  return item.slug;
}

function diffContentArray(oldArr, oldSlugFn, newArr, newSlugFn) {
  const oldBySlug = new Map(oldArr.map((item) => [slugOf(item, oldSlugFn), item]));
  const changedSlugs = [];
  for (const item of newArr) {
    const slug = slugOf(item, newSlugFn);
    const prev = oldBySlug.get(slug);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      changedSlugs.push(slug);
    }
  }
  return changedSlugs;
}

/**
 * Returns the deduped list of live URLs whose content changed between
 * prevCommit and currentCommit, based on which source files differ.
 */
export async function getChangedUrls(prevCommit, currentCommit, repoRoot = process.cwd()) {
  const diffOutput = execSync(`git diff --name-only ${prevCommit} ${currentCommit}`, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const changedFiles = diffOutput.split('\n').map((l) => l.trim()).filter(Boolean);

  const urls = new Set();

  for (const file of changedFiles) {
    const url = pageFileToUrl(file);
    if (url) urls.add(url);
  }

  for (const entry of CONTENT_REGISTRY) {
    if (!changedFiles.includes(entry.file)) continue;
    try {
      const [oldData, newData] = await Promise.all([
        loadArrayAtCommit(entry, prevCommit, repoRoot),
        loadArrayAtHead(entry, repoRoot),
      ]);
      const changedSlugs = diffContentArray(oldData.arr, oldData.slugFn, newData.arr, newData.slugFn);
      for (const slug of changedSlugs) {
        urls.add(`${SITE}${entry.urlPrefix}/${slug}/`);
      }
    } catch (err) {
      console.error(`[indexnow-diff] warning: could not diff ${entry.file} — ${err.message}`);
    }
  }

  return [...urls];
}
