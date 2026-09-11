#!/usr/bin/env node
// Runs automatically as the "postdeploy" npm lifecycle step after every
// `npm run deploy`. Finds the commit that was live before this deploy (via
// Cloudflare Pages' own deployment history -- no separate state file needed),
// diffs it against the commit just deployed, maps the changed files to live
// URLs (scripts/lib/indexnow-diff.mjs), and submits only those to IndexNow.
//
// This replaced a daily full-sitemap bulk submission that Bing Webmaster
// Tools flagged as "batch mode" -- see
// docs/superpowers/plans/2026-09-11-indexnow-diff-based-submission.md.
//
// Fails open everywhere: any problem here logs a warning and exits 0. A
// deploy must never fail, and must never be slowed to a crawl, because
// IndexNow or this diff logic hiccupped.
import { execSync } from 'node:child_process';
import { submitToIndexNow } from './indexnow-submit.mjs';
import { getChangedUrls } from './lib/indexnow-diff.mjs';

function run(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

async function getDeploymentHistory() {
  const json = run(
    'npx wrangler pages deployment list --project-name=panchangpath --environment=production --json'
  );
  return JSON.parse(json);
}

async function main() {
  let deployments;
  try {
    deployments = await getDeploymentHistory();
  } catch (err) {
    console.warn(`[indexnow-deploy] could not read Cloudflare Pages deployment history — skipping. ${err.message}`);
    return;
  }

  if (!Array.isArray(deployments) || deployments.length < 2) {
    console.log('[indexnow-deploy] fewer than 2 deployments on record (first-ever run) — nothing to diff, skipping');
    return;
  }

  // deployments[0] is the deployment `npm run deploy` just created; [1] is
  // the one that was live before it.
  const prevCommit = deployments[1]?.Source;
  if (!prevCommit) {
    console.warn('[indexnow-deploy] previous deployment has no recorded source commit — skipping');
    return;
  }

  const currentCommit = run('git rev-parse --short HEAD');

  if (prevCommit === currentCommit) {
    console.log(`[indexnow-deploy] redeployed the same commit (${currentCommit}) — nothing changed, skipping`);
    return;
  }

  try {
    execSync(`git cat-file -e ${prevCommit}`, { stdio: 'ignore' });
  } catch {
    try {
      console.log(`[indexnow-deploy] previous commit ${prevCommit} not in local history — fetching...`);
      execSync(`git fetch --depth=200 origin ${prevCommit}`, { stdio: 'ignore' });
    } catch {
      console.warn(`[indexnow-deploy] could not fetch previous commit ${prevCommit} — skipping`);
      return;
    }
  }

  let urls;
  try {
    urls = await getChangedUrls(prevCommit, currentCommit);
  } catch (err) {
    console.warn(`[indexnow-deploy] failed to compute changed URLs — skipping. ${err.message}`);
    return;
  }

  if (urls.length === 0) {
    console.log(`[indexnow-deploy] no publicly-mapped URLs changed between ${prevCommit} and ${currentCommit} — skipping`);
    return;
  }

  console.log(`[indexnow-deploy] ${urls.length} URL(s) changed since ${prevCommit} — submitting to IndexNow:`);
  for (const url of urls) console.log(`  ${url}`);

  try {
    await submitToIndexNow(urls);
  } catch (err) {
    console.warn(`[indexnow-deploy] IndexNow submission failed (deploy already succeeded, not blocking): ${err.message}`);
  }
}

main();
