import { register } from 'node:module';

// The hook lives in scripts/lib/ so scripts/lib/indexnow-diff.mjs (run at deploy time, outside
// the test runner) registers the exact same resolver -- see that file.
register('../../lib/ts-extension-resolve.mjs', import.meta.url);
