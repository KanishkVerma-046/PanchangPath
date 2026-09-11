# IndexNow Diff-Based Submission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execution note (2026-09-11):** This plan was written and executed inline, same session, by the agent that investigated the root cause — not handed off cold. Kept as a plan doc for the record and in case a future session needs to redo/extend this.

**Goal:** Stop Bing flagging PanchangPath's IndexNow usage as "batch mode." Replace the daily full-sitemap bulk submission as the *primary* IndexNow channel with automatic, diff-based, small submissions triggered by real deploys — only the URLs that actually changed.

**Architecture:** A new `postdeploy` npm lifecycle script (`scripts/indexnow-deploy-diff.mjs`) runs automatically after every `npm run deploy` (local or CI). It finds the previously-deployed commit via `wrangler pages deployment list --json` (Cloudflare Pages already tracks deploy history by commit — no new state file needed), diffs it against the current `HEAD` commit, maps changed source files to live URLs, and submits only those via the existing `submitToIndexNow()` function. The daily full-sitemap cron step is removed from `.github/workflows/daily-rebuild.yml`; the site's own CLAUDE.md is corrected to say submission is now automatic.

**Tech Stack:** Node 22 (`--experimental-strip-types` for the TS content-data modules), `wrangler pages deployment list --json`, existing `scripts/indexnow-submit.mjs`.

**Spec:** User request in this session (2026-09-11) — 5 tasks: (1) confirm root cause, (2) automatic diff-based submission tied to deploy, (3) retire/reduce the daily bulk step, (4) update docs, (5) verify end-to-end with a real change.

## Global Constraints

- Never break `npm run deploy` for the common case (no relevant change) — must be silent/no-op, not an error, and must not block or slow deploy on failure (IndexNow being briefly down should not fail a site deploy).
- No new secrets required (IndexNow key is public, as already documented).
- Must work both locally (full git history available) and in GitHub Actions (shallow clone by default — needs a config fix).
- First-ever run (no prior Cloudflare Pages deployment to diff against) must skip cleanly, not error.

---

## Root cause (confirmed, Task 1)

- `scripts/indexnow-submit.mjs` exists, supports both single-URL and `--sitemap` bulk modes (already built 2026-08-31).
- `.github/workflows/daily-rebuild.yml` runs on a daily cron, does `npm run deploy` then unconditionally runs `node scripts/indexnow-submit.mjs --sitemap dist/sitemap.xml` — the **entire** sitemap (currently ~400+ URLs), **every single day**, regardless of whether anything changed. This is the batch-mode pattern Bing is flagging.
- No automatic per-publish single-URL submission exists anywhere: no git hook (`.git/hooks` has only `.sample` files), no husky, no `predeploy`/`postdeploy` npm script referencing indexnow, nothing in `package.json` scripts. The single-URL call is documented in `CLAUDE.md` as a step a *human/session* should remember to run manually after publishing — grep across the repo confirms the only other reference to `indexnow-submit.mjs` besides the script itself and the daily workflow is that one CLAUDE.md sentence and the original planning doc. It is realistically almost never invoked, so nearly all real IndexNow traffic is the one daily bulk call.

---

## Task 2: Content-file → URL diff library

**Files:**
- Create: `scripts/lib/indexnow-diff.mjs`
- Test: manual (see Task 2 Step 3) — this is a build/deploy script, not app code; no test runner wired for `scripts/`. Existing precedent in this repo (`check-clean-tree.mjs`, `postbuild-sitemap.mjs`) also ships without automated tests.

**Interfaces:**
- Produces: `export async function getChangedUrls(prevCommit, currentCommit)` → `Promise<string[]>` (absolute `https://panchangpath.com/...` URLs, deduped, or `[]`).

This module knows two kinds of "page source":

1. **Static page files** — any `src/pages/**/*.astro` or `.md` whose path has no `[` (not a dynamic route), excluding `404.astro`, `500.astro`, and non-page files (`.json.ts` API routes). Path → URL: strip `src/pages/` and the extension; a trailing `/index` segment is dropped; everything gets a trailing slash. `src/pages/index.astro` → `/`.

2. **Registered content-data files** — the `src/lib/*.ts` / `src/lib/devotional/*.ts` modules that back a `getStaticPaths()` dynamic route (blog posts, festivals, all 11 devotional categories). For these, editing the *template* file (`src/pages/blog/[slug].astro` etc.) is a code change affecting many pages at once and is intentionally **not** mapped to a URL (too many entries to enumerate meaningfully — left to the weekly safety net). Editing the *data* file is mapped precisely: import the OLD version of the module (via `git show <prevCommit>:<path>`, written to a temp `.ts` file, dynamically imported, then deleted) and the NEW version (the file on disk at `HEAD`, which is what's actually being deployed), compare item-by-item by slug: an item whose slug is new, or whose full JSON differs from the old item with the same slug, counts as changed. Removed items are not submitted (nothing new to crawl).

Registry (verified against the actual files 2026-09-11):

```js
const CONTENT_REGISTRY = [
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
```

Everything else (components, `src/lib/astro-core.ts`, `src/lib/panchang.ts`, config, docs, scripts, `rashifal.ts`, `planetaryEvents.ts` since its "id"s are computed, not stored) is intentionally unmapped — a change there either has no single-URL meaning or affects too many pages to name individually.

- [ ] **Step 1: Write `scripts/lib/indexnow-diff.mjs`** implementing `getChangedUrls`, `pageFileToUrl` (exported for the manual test below), and the content-registry diff logic described above. Wrap each content-file diff in try/catch — a parse/import failure for one file must log a warning and continue, not abort the whole submission.

- [ ] **Step 2: Run `node --experimental-strip-types -e "..."` smoke test against real history**

```
node --experimental-strip-types -e "
import('./scripts/lib/indexnow-diff.mjs').then(async m => {
  const urls = await m.getChangedUrls('634f861', 'c68ef51');
  console.log(urls);
});
"
```

Expected: a non-crashing array of URLs (this range includes the meta-description and design-system commits — confirm the printed URLs are plausible for those commits' file lists via `git diff --name-only 634f861 c68ef51`).

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/indexnow-diff.mjs
git commit -m "Add content-diff-to-URL mapper for deploy-time IndexNow submission"
```

## Task 3: Wire into `postdeploy`

**Files:**
- Create: `scripts/indexnow-deploy-diff.mjs`
- Modify: `package.json` (add `"postdeploy"` script)

**Interfaces:**
- Consumes: `getChangedUrls` from Task 2, `submitToIndexNow` from `scripts/indexnow-submit.mjs`.

- [ ] **Step 1: Write `scripts/indexnow-deploy-diff.mjs`**

Logic:
1. Run `npx wrangler pages deployment list --project-name=panchangpath --environment=production --json`, parse it. If it errors (e.g. no `CLOUDFLARE_API_TOKEN` in some environment) or returns fewer than 2 entries, log `[indexnow-deploy] no prior deployment to diff against — skipping` and exit 0 (this is expected right after this script's own first-ever run, and is not a failure).
2. `prevCommit = list[1].Source` (index 0 is the deployment that was just created by the `deploy` script that invoked this as `postdeploy`; index 1 is the one before it).
3. `currentCommit = execSync('git rev-parse --short HEAD')`.
4. If `prevCommit === currentCommit`, log `[indexnow-deploy] same commit as last deploy — nothing changed, skipping` and exit 0.
5. Ensure `prevCommit` is reachable locally: `git cat-file -e <prevCommit> 2>/dev/null`; if not, try `git fetch --depth=200 origin <prevCommit>` once; if it's still not reachable, log a warning and exit 0 (fail open — never block or fail a deploy over this).
6. `urls = await getChangedUrls(prevCommit, currentCommit)`.
7. If `urls.length === 0`, log `[indexnow-deploy] no publicly-mapped URLs changed between <prevCommit> and <currentCommit> — skipping` and exit 0.
8. Else call `submitToIndexNow(urls)`, log the result. Wrap the whole submission in try/catch — a submission failure logs an error but exits 0 (IndexNow being down must never fail `npm run deploy`).

- [ ] **Step 2: Add to `package.json`**

```json
"postdeploy": "node scripts/indexnow-deploy-diff.mjs",
```

- [ ] **Step 3: Dry-run against real history without deploying**

Since this script only reads `wrangler pages deployment list` (no new deploy needed to test the diff/mapping path), test it standalone first by temporarily hardcoding two known commits in a throwaway copy, or by extracting steps 3-8 into the already-tested `getChangedUrls` (Task 2 Step 2 already covered this). The one untested part is steps 1-2 (parsing real `wrangler ... --json` output) and step 5 (the shallow-fetch fallback) — verify step 1-2 by running:

```
npx wrangler pages deployment list --project-name=panchangpath --environment=production --json
```

and confirming the shape matches what the script expects (`Source` field present, sorted newest-first — already confirmed during Task 1 investigation).

- [ ] **Step 4: Commit**

```bash
git add scripts/indexnow-deploy-diff.mjs package.json
git commit -m "Submit only changed URLs to IndexNow automatically after each deploy"
```

## Task 4: Fix CI shallow-clone gap + retire daily bulk submission

**Files:**
- Modify: `.github/workflows/daily-rebuild.yml`

- [ ] **Step 1:** Add `fetch-depth: 0` to the `actions/checkout@v4` step so the diff in Task 3 Step 1's `git cat-file`/`git diff` can always see the previous deploy's commit in CI (default shallow clone only has 1 commit). Repo is 39MB / 505 commits — full clone is cheap.

- [ ] **Step 2:** Delete the `Submit sitemap to IndexNow` step. `npm run deploy` now submits diffed URLs automatically via `postdeploy` (Task 3), so this step is redundant for real changes.

- [ ] **Step 3:** Add a much-reduced safety net: full-sitemap submission **only on Mondays**, as a separate scheduled trigger, clearly commented as a rare fallback (catches anything the diff mapper doesn't understand — e.g. a component-level change that ripples into many pages, or a manual out-of-band content edit) — not the primary channel. Implementation: a second `on.schedule` cron entry (e.g. `'0 19 * * 1'`, Monday ~00:30 IST) plus a day-of-week guard in a new tiny step so the same workflow file serves both the daily rebuild (always) and the weekly IndexNow safety net (Mondays only), OR a second, separate workflow file if that's cleaner to reason about. Prefer a separate workflow file (`.github/workflows/weekly-indexnow-safety-net.yml`) — keeps `daily-rebuild.yml` unchanged in purpose (still rebuilds+deploys daily) and makes the weekly-not-daily cadence obvious from the filename alone rather than buried in a conditional step.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/daily-rebuild.yml .github/workflows/weekly-indexnow-safety-net.yml
git commit -m "Fetch full history for deploy-diff, retire daily IndexNow bulk submission for a weekly safety net"
```

## Task 5: Documentation

**Files:**
- Modify: `CLAUDE.md` (the IndexNow gotcha paragraph)

- [ ] **Step 1:** Replace the "After publishing any new page... submit its URL to IndexNow" manual-step instruction with: submission is automatic (`postdeploy` after every `npm run deploy`, diff-based against the previous Cloudflare Pages deployment's commit); a future session should NOT also manually call `indexnow-submit.mjs` after a normal publish+deploy — that would double-submit. Manual single-URL submission is still the right tool only for an out-of-band case (a URL that changed without a normal deploy, e.g. content fixed directly through some other path). Note the weekly (not daily) safety net and why (Bing flagged the old daily full-sitemap call as "batch mode").

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Document automatic diff-based IndexNow submission, correct stale manual-step guidance"
```

## Task 6: End-to-end verification (Task 5 of the user spec)

- [ ] Make one small, real content change (a single blog post or festival field edit).
- [ ] Run `npm run deploy` for real and capture the `postdeploy` step's console output.
- [ ] Confirm the log shows exactly the changed URL(s) — not a bulk batch — and a successful `submitToIndexNow` HTTP 200/202.
- [ ] Confirm `git status` clean and everything pushed.
- [ ] Report before/after clearly per the user's Reporting Format.

---

## Self-review notes

- Spec coverage: Task 1 (root cause) done above; Task 2 → this plan's Tasks 2-3; Task 3 → this plan's Task 4; Task 4 → this plan's Task 5; Task 5 → this plan's Task 6. All five of the user's tasks are covered.
- No placeholders: every step names exact files, exact registry entries (verified against real file contents), exact script logic.
- Type/name consistency checked: `getChangedUrls`, `submitToIndexNow`, registry field names used consistently across Tasks 2-3.
