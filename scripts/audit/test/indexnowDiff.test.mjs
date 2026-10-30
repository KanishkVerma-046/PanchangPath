import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_REGISTRY, pagesDependingOn } from '../../lib/indexnow-diff.mjs';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));

// The deploy-time IndexNow diff swallows loader errors into a console warning so a deploy
// never fails -- which is how festivals.ts silently dropped out of auto-submission once it
// started importing './ist-date' (Phase A deploy, commit 9a14cbe). This test makes that
// failure loud. It loads every registered data module in a child process launched exactly
// like the `postdeploy` npm script (`node --experimental-strip-types`, no --import hook), so
// the resolver this suite registers globally can't mask a regression.
function loadInPostdeployProcess(loader, ...args) {
  const script = `
    const m = await import(${JSON.stringify(new URL('../../lib/indexnow-diff.mjs', import.meta.url).href)});
    const out = {};
    for (const entry of m.CONTENT_REGISTRY) {
      const { arr, slugFn } = await m.${loader}(entry, ...${JSON.stringify(args)});
      out[entry.file] = arr.map((item) => (slugFn ? slugFn(item) : item.slug));
    }
    console.log(JSON.stringify(out));
  `;
  const stdout = execFileSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e', script],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
  return JSON.parse(stdout);
}

function assertEveryModuleLoaded(slugsByFile) {
  for (const { file } of CONTENT_REGISTRY) {
    const slugs = slugsByFile[file];
    assert.ok(Array.isArray(slugs) && slugs.length > 0, `${file}: loaded no entries`);
    for (const slug of slugs) {
      assert.ok(typeof slug === 'string' && slug.length > 0, `${file}: entry with empty slug`);
    }
  }
}

test('every IndexNow-diffed data module loads from the working tree (the "current" side of a deploy diff)', () => {
  assertEveryModuleLoaded(loadInPostdeployProcess('loadArrayAtHead', repoRoot));
});

test('every IndexNow-diffed data module loads from a git commit snapshot (the "previous deploy" side)', () => {
  assertEveryModuleLoaded(loadInPostdeployProcess('loadArrayAtCommit', 'HEAD', repoRoot));
});

// When a data file changes, its listing pages are submitted too. The set is derived from the
// import graph, so a new page that lists festivals is picked up without editing a list.
test('festivals.ts maps to the pages that list festivals, not to every page that has the Header', () => {
  const paths = pagesDependingOn('src/lib/festivals.ts', repoRoot).map((u) => new URL(u).pathname);
  for (const p of ['/', '/festivals/', '/festivals/archive/', '/calendar/']) {
    assert.ok(paths.includes(p), `${p} should be submitted when festivals.ts changes; got ${paths.join(', ')}`);
  }
  // Header.astro imports festivals.ts for its nav, but following site chrome would submit all ~450 pages.
  assert.ok(!paths.includes('/about/'), 'a page that only renders the Header must not be included');
  assert.ok(paths.length < 20, `expected a handful of listing pages, got ${paths.length}`);
});

test('pagesDependingOn follows page imports and shared .ts modules but stops at layout chrome components', () => {
  const root = mkdtempSync(join(tmpdir(), 'indexnow-deps-'));
  const files = {
    'src/lib/data.ts': 'export const ITEMS = [];',
    'src/lib/helper.ts': "import { ITEMS } from './data';\nexport const n = ITEMS.length;",
    'src/components/Header.astro': "---\nimport { ITEMS } from '../lib/data';\nimport { n } from '../lib/helper';\n---",
    'src/components/Feed.astro': "---\nimport {\n  ITEMS,\n} from '../lib/data';\n---",
    'src/layouts/Layout.astro': "---\nimport Header from '../components/Header.astro';\n---",
    'src/pages/about.astro': "---\nimport Layout from '../layouts/Layout.astro';\n---",
    'src/pages/index.astro': "---\nimport Layout from '../layouts/Layout.astro';\nimport Feed from '../components/Feed.astro';\n---",
    'src/pages/stats.astro': "---\nimport { n } from '../lib/helper';\n---",
    'src/pages/typed.astro': "---\nimport type { X } from '../lib/data';\n---",
    'src/pages/lazy.astro': "<script>\nconst m = await import('../lib/data');\n</script>",
    'src/pages/items/[slug].astro': "---\nimport { ITEMS } from '../../lib/data';\n---",
  };
  try {
    for (const [f, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, f)), { recursive: true });
      writeFileSync(join(root, f), text);
    }
    const paths = pagesDependingOn('src/lib/data.ts', root).map((u) => new URL(u).pathname);
    assert.deepEqual(paths, ['/', '/lazy/', '/stats/']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
