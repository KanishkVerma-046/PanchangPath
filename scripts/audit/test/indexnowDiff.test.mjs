import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CONTENT_REGISTRY } from '../../lib/indexnow-diff.mjs';

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
