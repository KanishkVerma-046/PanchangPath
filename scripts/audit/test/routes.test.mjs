import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { enumerateRoutes, htmlPathToRoute } from '../lib/routes.mjs';

test('htmlPathToRoute converts root index.html to /', () => {
  assert.equal(htmlPathToRoute('index.html'), '/');
});

test('htmlPathToRoute converts nested index.html to a trailing-slash route', () => {
  assert.equal(htmlPathToRoute('festivals/diwali-2025/index.html'), '/festivals/diwali-2025/');
});

test('htmlPathToRoute converts a bare page file to a slash-prefixed, no-trailing-slash route', () => {
  assert.equal(htmlPathToRoute('404.html'), '/404');
});

test('enumerateRoutes walks a directory tree and returns sorted routes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'audit-routes-'));
  writeFileSync(join(dir, 'index.html'), '<html></html>');
  mkdirSync(join(dir, 'about'));
  writeFileSync(join(dir, 'about', 'index.html'), '<html></html>');
  mkdirSync(join(dir, 'festivals', 'diwali-2025'), { recursive: true });
  writeFileSync(join(dir, 'festivals', 'diwali-2025', 'index.html'), '<html></html>');
  writeFileSync(join(dir, '404.html'), '<html></html>');

  const routes = enumerateRoutes(dir);

  assert.deepEqual(routes, ['/', '/404', '/about/', '/festivals/diwali-2025/']);
  rmSync(dir, { recursive: true, force: true });
});
