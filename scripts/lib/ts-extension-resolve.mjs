// Node's raw ESM resolver requires explicit file extensions on relative specifiers, but
// src/lib/*.ts files (written for Vite/Astro, which resolve extensionless TS imports
// automatically) import each other without one. This hook lets plain Node follow those
// chains: on ERR_MODULE_NOT_FOUND for a relative specifier, retry with '.ts' appended.
// Registered by the test suite (scripts/audit/test/register-ts-resolve.mjs) and by
// scripts/lib/indexnow-diff.mjs, which loads src/lib data modules at deploy time.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND' && (specifier.startsWith('.') || specifier.startsWith('/'))) {
      return nextResolve(`${specifier}.ts`, context);
    }
    throw err;
  }
}
