# Resume prompt: Devotional Library lyrics re-verification (bug backlog item 1)

Paste this into a fresh Claude Code session in this repo
(`C:\Users\kanis\Desktop\AI Side Hustles\Panchang Path`) to continue.

---

I'm continuing a large task: re-verifying and correcting the `lyricsHi` field
across PanchangPath's Devotional Content Library
(`src/lib/devotional/*.ts`) against authoritative online sources, per the
"Devotional Library lyrics contain memory-sourced inaccuracies" entry in
`docs/bugs/backlog.md`. Read that backlog entry and `CLAUDE.md`'s "Sourcing
long/sacred texts accurately" section first — they define the required
method (curl with a browser User-Agent + strip HTML tags in Node, never
WebFetch for verbatim text, never reconstruct sacred text from memory).

**Progress so far (do NOT redo these — check `git status`/`git diff` to
confirm current state before touching anything):**

- `chalisa.ts` (15 items) — DONE. 12 of 15 were found to be entirely
  fabricated/wrong texts and were replaced with verbatim sourced text from
  aartichalisa.com (primary) and drikpanchang.com (cross-check). Verified,
  `npm run build` passed.
- `mantra.ts` (15 items) — DONE. Only 1 real error found (hanuman-mantra's
  second mantra had wrong opening bija, "हुं" instead of "हं"). Verified,
  build passed.
- `pujavidhi.ts` (15 items) — DONE. 5 of 15 corrected (missing samagri
  items in navratri-durga, holi, satyanarayan, karva-chauth; one factual
  error in raksha-bandhan about what the rumal/handkerchief is for).
  Verified, build passed.
- `yantra.ts` (12 items) — DONE. 2 of 12 corrected (truncated Kubera
  mantra, garbled Navagraha Peedahara verse). Verified, build passed.
- `vratkatha.ts` (18 items) — LIKELY DONE but unconfirmed. The verifying
  agent's diff shows all 18 items were reached (6 corrected: karva-chauth,
  satyanarayan, sankashti-chaturthi, mangalwar, budhwar, pradosh vrat
  kathas; the other 12 presumably verified-unchanged since they show no
  diff) but it was killed by a session-limit error right as it started its
  final `npm run build` check, before it produced a summary report.
  **First step in this session: re-run `npm run build` to confirm the
  current state is still clean (it was, last checked), then do a quick
  independent spot-check of 2-3 of the 6 already-changed items against a
  source to confirm the partial work is trustworthy before moving on.**
- `aarti.ts` (18 items), `stotram.ts` (15 items), `ashtakam.ts` (11 items),
  `namavali.ts` (10 items, each a 108-name list) — **NOT STARTED**, zero
  edits made. These are the remaining work.
- `durgasaptashati.ts` and `sundarkand.ts` — already verbatim-sourced
  previously (see CLAUDE.md), skip.

**Method that worked well (use the same approach):**

1. Dispatch one background agent per remaining category file
   (`aarti.ts`, `stotram.ts`, `ashtakam.ts`, `namavali.ts`), each with a
   self-contained prompt: read CLAUDE.md's sourcing section, read
   `types.ts` for the `DevotionalItem` shape, curl+verify each item
   against reputable sources (aartichalisa.com for aarti; drikpanchang.com
   as primary for the others, WebSearch to locate specific pages/other
   reputable sources when drikpanchang doesn't have an item), only touch
   `lyricsHi` (not `transliteration` — that's a separate tracked bug),
   run `npm run build` at the end, and return a concise per-item report
   (slug, verdict, source URL) rather than pasting full corrected text
   back — this keeps the orchestrating session's context small.
2. **Lesson learned from last time: don't dispatch more than ~3-4 heavy
   research agents in parallel at once** — dispatching 7 simultaneously
   exhausted the session's API budget mid-run (5 of 7 failed with a
   session-limit error, though 2 finished and 1 more turned out to have
   done all its work anyway). Do 4 now (aarti, stotram, ashtakam,
   namavali), wait for all to finish, then confirm vratkatha.ts
   separately.
3. After each agent returns, do a light spot-check (`git diff --stat` for
   sanity, and spot-check one claimed correction against the cited source
   yourself) before trusting it and moving to the next — the chalisa.ts
   pilot showed agents can find real, extensive problems, so don't
   assume "corrected" reports are automatically right without a
   independent glance.

**When all 9 categories are confirmed done:**

1. Run `npm run build` once more on the fully combined diff.
2. Update the bug's `Status` line in `docs/bugs/backlog.md` to
   `Fixed (<date>)` with a note on scope covered (matching the style of
   other entries in that file).
3. **Do NOT commit or push without asking the user first** — show a
   summary of what changed per file and let them decide whether/how to
   commit (this repo's convention is one commit, but confirm before
   running `git commit`).
