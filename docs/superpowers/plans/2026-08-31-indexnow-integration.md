# IndexNow Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> This run executed inline in a single session (task is small, fully-specified by the user, and mechanical — four sequential sub-tasks with no independent-subsystem branching), not via subagent dispatch.

**Status: DONE (2026-08-31).** All four tasks implemented, verified, committed, and pushed to `master` (`4befc42`, `e908b32`, `a2a051f`, `d30b07b`). Key file confirmed live at `https://panchangpath.com/40561200baba459aa3fc4b890c7e49df.txt`; a real single-URL submission returned HTTP 202 and a real bulk sitemap submission (407 URLs) returned HTTP 200; the daily-rebuild workflow's new step was exercised via an actual manual trigger (`gh workflow run` → run `33377226159`, all steps green, IndexNow step logged `HTTP 200`). See [[project_indexnow_integration]] memory for the full writeup, including the transient `SiteVerificationNotCompleted` timing quirk found during Task 2 testing.

**Goal:** Add IndexNow support so PanchangPath can push new/changed URLs to Bing, Yandex, and other IndexNow-participating search engines instead of waiting for crawl, both on-demand (single URL after publishing) and as a daily safety net (full sitemap via the existing daily-rebuild cron).

**Architecture:** A static key-verification file at the site root (served via `public/`), a small reusable Node script (`scripts/indexnow-submit.mjs`) that POSTs to the IndexNow API and is usable both as a CLI (`node scripts/indexnow-submit.mjs <url>` or `--sitemap`) and as an importable function, wired into `.github/workflows/daily-rebuild.yml` as a post-deploy step, and a CLAUDE.md operational note for future publish tasks.

**Tech Stack:** Astro v7 static output, Node 22 (`node:fs`, global `fetch`), GitHub Actions.

**Spec:** User-provided task spec (this conversation, 2026-08-31) — no separate design doc; the spec is reproduced in full in the four tasks below.

## Global Constraints

- IndexNow key: `40561200baba459aa3fc4b890c7e49df` (public by design — do not treat as a secret).
- Host: `panchangpath.com`.
- IndexNow endpoint: `https://api.indexnow.org/indexnow`.
- Key verification file must contain exactly the key string, no extra whitespace — matches the existing pattern at `public/175ac10c87344212a9e787e06204cf59.txt` (Bing Webmaster verification, single line, no trailing content beyond the key).
- Follow existing repo conventions: scripts live in `scripts/*.mjs`, ESM (`"type": "module"` in package.json), no new dependencies (use global `fetch`, available in Node 22).
- Do not silently swallow API errors — log and surface failures clearly (non-zero exit in CLI mode).

---

### Task 1: Key verification file

**Files:**
- Create: `public/40561200baba459aa3fc4b890c7e49df.txt`

**Interfaces:** None (static asset).

- [x] **Step 1: Create the file**

Content is exactly the key, no trailing newline beyond what a normal text file editor adds (match the existing `175ac10c...txt` file's format — single line, key only):

```
40561200baba459aa3fc4b890c7e49df
```

- [x] **Step 2: Build and verify presence in dist/**

Run: `npm run build`
Then check: `dist/40561200baba459aa3fc4b890c7e49df.txt` exists and its content is exactly the key (use `Read` or `Get-Content`, compare against the key string).

- [x] **Step 3: Commit**

```bash
git add public/40561200baba459aa3fc4b890c7e49df.txt
git commit -m "Add IndexNow key verification file"
```

---

### Task 2: Reusable IndexNow submission utility

**Files:**
- Create: `scripts/indexnow-submit.mjs`

**Interfaces:**
- Produces: `export async function submitToIndexNow(urls: string[]): Promise<{ok: true, status: number, body: string}>` — throws on non-2xx response. Later tasks (3, 4) invoke this script via its CLI, not by importing the function, but the export exists for any future in-process use.
- CLI: `node scripts/indexnow-submit.mjs <url> [url2 ...]` (submit specific URLs) or `node scripts/indexnow-submit.mjs --sitemap [path-or-url]` (default `dist/sitemap.xml`; accepts a local path or an `http(s)://` URL, extracts all `<loc>` entries, submits them as one batch).

- [x] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
// Submits URLs to the IndexNow API (https://www.indexnow.org/) so participating
// search engines (Bing, Yandex, ...) can crawl new/changed content immediately
// instead of waiting for their next scheduled crawl. Usable both as a CLI and
// as an importable function.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';

const INDEXNOW_KEY = '40561200baba459aa3fc4b890c7e49df';
const HOST = 'panchangpath.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export async function submitToIndexNow(urls) {
  if (!urls || urls.length === 0) {
    throw new Error('[indexnow] no URLs to submit');
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(
      `[indexnow] submission FAILED for ${urls.length} URL(s) — HTTP ${res.status}${body ? `: ${body}` : ' (no response body)'}`
    );
    throw new Error(`IndexNow submission failed: HTTP ${res.status}`);
  }

  console.log(
    `[indexnow] submitted ${urls.length} URL(s) successfully — HTTP ${res.status}${body ? `: ${body}` : ' (no response body)'}`
  );
  return { ok: true, status: res.status, body };
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function loadSitemapUrls(source) {
  const isRemote = /^https?:\/\//.test(source);
  const xml = isRemote
    ? await (await fetch(source)).text()
    : readFileSync(source, 'utf8');
  const urls = extractSitemapUrls(xml);
  if (urls.length === 0) {
    throw new Error(`[indexnow] no <loc> URLs found in sitemap source: ${source}`);
  }
  return urls;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      'Usage:\n' +
        '  node scripts/indexnow-submit.mjs <url> [url2 ...]\n' +
        '  node scripts/indexnow-submit.mjs --sitemap [path-or-url]   (default: dist/sitemap.xml)'
    );
    process.exit(1);
  }

  let urls;
  if (args[0] === '--sitemap') {
    const source = args[1] || 'dist/sitemap.xml';
    if (!/^https?:\/\//.test(source) && !existsSync(source)) {
      console.error(`[indexnow] sitemap file not found: ${source}`);
      process.exit(1);
    }
    urls = await loadSitemapUrls(source);
    console.log(`[indexnow] loaded ${urls.length} URL(s) from ${source}`);
  } else {
    urls = args;
  }

  try {
    await submitToIndexNow(urls);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

const isMain =
  process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
```

- [x] **Step 2: Real single-URL test submission**

Pick a real, already-live URL (e.g. `https://panchangpath.com/`). Run:

`node scripts/indexnow-submit.mjs https://panchangpath.com/`

Expected: process exits 0, logs `[indexnow] submitted 1 URL(s) successfully — HTTP 200` or `202` (with or without a body — IndexNow typically returns no body on success). If HTTP 403 is returned, the key file (Task 1) isn't live yet at `keyLocation` — deploy Task 1 first and retry.

- [x] **Step 3: Real sitemap-mode test (dry run against local dist)**

Run: `npm run build` (produces `dist/sitemap.xml`), then:

`node scripts/indexnow-submit.mjs --sitemap`

Expected: logs `[indexnow] loaded N URL(s) from dist/sitemap.xml` followed by a successful submission log for all N URLs.

- [x] **Step 4: Commit**

```bash
git add scripts/indexnow-submit.mjs
git commit -m "Add reusable IndexNow submission script (CLI + importable function)"
```

---

### Task 3: Wire into the daily-rebuild cron (safety net)

**Files:**
- Modify: `.github/workflows/daily-rebuild.yml`

**Interfaces:**
- Consumes: `scripts/indexnow-submit.mjs` CLI (`--sitemap` mode) from Task 2.

- [x] **Step 1: Add a post-deploy step**

Insert after the existing `npm run deploy` step (which already runs `npm run build`, producing `dist/sitemap.xml`, before the deploy):

```yaml
      - name: Submit sitemap to IndexNow
        run: node scripts/indexnow-submit.mjs --sitemap dist/sitemap.xml
```

- [x] **Step 2: Verify the YAML**

Read the full modified file back and confirm: the new step is indented at the same level as the other `steps:` entries (6 spaces before `- name:`), comes after the deploy step (so `dist/sitemap.xml` exists and reflects the just-deployed content), and does not require any new secrets (the IndexNow key is public and hardcoded in the script, not a repo secret).

- [x] **Step 3: Manual test run**

Trigger the workflow manually (`gh workflow run daily-rebuild.yml`) and watch it via `gh run watch` or `gh run list --workflow=daily-rebuild.yml`. Confirm the new "Submit sitemap to IndexNow" step's log shows a successful submission (HTTP 200/202) for the full URL count.

- [x] **Step 4: Commit**

```bash
git add .github/workflows/daily-rebuild.yml
git commit -m "Submit full sitemap to IndexNow as a daily safety net after deploy"
```

---

### Task 4: Document for future publish tasks

**Files:**
- Modify: `CLAUDE.md` (Critical Gotchas or Deployment section)

**Interfaces:** None.

- [x] **Step 1: Add a documentation note**

Add a bullet near the existing deploy-verification gotchas (e.g. after the "Cloudflare Pages propagation lag" / wrangler deployment-list bullets) describing the standard publish-and-verify sequence addition:

```markdown
- **After publishing any new page (blog post, festival page, etc.), submit its URL to IndexNow** — `node scripts/indexnow-submit.mjs https://panchangpath.com/<path>`. This pushes an immediate crawl notification to Bing/Yandex/other IndexNow participants instead of waiting for their next scheduled crawl or the daily-rebuild cron's sitemap safety net (`.github/workflows/daily-rebuild.yml`, added 2026-08-31). Key verification file lives at `public/40561200baba459aa3fc4b890c7e49df.txt`; the key itself is public by design (published in that file and sent in every API call), not a secret.
```

- [x] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Document IndexNow submission step for future publish tasks"
```

---

## Final End-to-End Verification

- [x] Confirm `https://panchangpath.com/40561200baba459aa3fc4b890c7e49df.txt` is live (post-deploy) and its body is exactly the key.
- [x] Confirm at least one real successful IndexNow API submission occurred against a live URL (Task 2 Step 2's output).
- [x] Confirm the daily-rebuild workflow YAML has the new step correctly placed and configured (Task 3 Step 2), and that a manual trigger exercised it successfully if feasible (Task 3 Step 3).
- [x] Confirm CLAUDE.md carries the new operational note (Task 4).
