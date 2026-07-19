# Bug Backlog

Running log of bugs found on the live site. Each entry captures enough
investigation (root cause, affected files) that a future Claude Code
session can fix it without re-discovering the problem from scratch. See
`docs/superpowers/specs/2026-07-17-bug-backlog-design.md` for the format
this file follows.

Entries are ordered newest-reported-first. When a bug is fixed, its
`Status` line is updated in place — entries are never deleted.

## Reporting a new bug

Paste this into a fresh session (fill in the bracketed part):

> I found a bug/problem on PanchangPath (panchangpath.com). Investigate it
> and log it in `docs/bugs/backlog.md` following that file's existing entry
> format (see the entries already there for reference, and
> `docs/superpowers/specs/2026-07-17-bug-backlog-design.md` for the full
> spec).
>
> **What I observed:** [describe the bug — page/URL, what you saw, what you
> expected instead, steps to reproduce if relevant]
>
> Do this:
> 1. Investigate the codebase to confirm the root cause — don't just record
>    my description as-is. Identify the exact file(s)/function(s)
>    responsible, and check whether the same logic is duplicated elsewhere
>    in the codebase (this project has a lot of copy-pasted math across
>    `jyotish/*.astro` and `muhurta/*.astro` pages — see CLAUDE.md's
>    Gotchas).
> 2. Add a new entry to `docs/bugs/backlog.md`, inserted at the top
>    (newest-first, both in the index table and the sections below it),
>    with all required fields: Status (Open), Reported (today's date),
>    Severity, Affected files, Description, Root cause, and a
>    self-contained "Claude Code Fix Prompt" — written so a future session
>    with zero context could paste it in and fix the bug without
>    re-investigating.
> 3. Do **not** fix the bug in this pass — this is a logging-only task. No
>    `src/` changes.
> 4. Commit the change to `docs/bugs/backlog.md` with a clear commit
>    message.

---

| Title | Status | Reported |
|---|---|---|
| [Homepage date and Panchang data freeze after reopening the site (no bfcache/visibility refresh)](#homepage-date-and-panchang-data-freeze-after-reopening-the-site-no-bfcachevisibility-refresh) | Fixed (2026-07-17) | 2026-07-17 |
| [Change Language picker: Hindi barely translates anything + Regional Panchang duplicated in the dropdown](#change-language-picker-hindi-barely-translates-anything-regional-panchang-duplicated-in-the-dropdown) | Fixed (2026-07-17) | 2026-07-17 |
| [Devotional Library lyrics contain memory-sourced inaccuracies, not verified against sources](#devotional-library-lyrics-contain-memory-sourced-inaccuracies-not-verified-against-sources) | Fixed (2026-07-19) | 2026-07-17 |
| [Devotional transliteration fields truncated with placeholder text in Ashtakam, Chalisa, Namavali, Stotram](#devotional-transliteration-fields-truncated-with-placeholder-text-in-ashtakam-chalisa-namavali-stotram) | Open | 2026-07-17 |
| [Detect My Location geolocation feature is ineffective and should be removed](#detect-my-location-geolocation-feature-is-ineffective-and-should-be-removed) | Fixed (2026-07-17) | 2026-07-17 |
| [Festivals page title and subtitle stuck at stale 2025-2026 (site now covers 2025-2027)](#festivals-page-title-and-subtitle-stuck-at-stale-2025-2026-site-now-covers-2025-2027) | Fixed (2026-07-17) | 2026-07-17 |
| [Tithi/Nakshatra/Yoga/Karana boundary end-times run 45min–2.5h too early](#tithinakshatrayogakarana-boundary-end-times-run-45min25h-too-early) | Fixed (2026-07-17) | 2026-07-16 |
| [`index.astro` inline sunrise/sunset missing Equation-of-Time term](#indexastro-inline-sunrisesunset-missing-equation-of-time-term) | Fixed (2026-07-17) | 2026-07-16 |

---

## Homepage date and Panchang data freeze after reopening the site (no bfcache/visibility refresh)

- **Status:** Fixed (2026-07-17, commit `55704d0`)
- **Reported:** 2026-07-17
- **Severity:** High
- **Affected files:** `src/pages/index.astro` (build-time `const today = new Date()` at line 33; client-side `let currentDate = new Date()` at line 487; `renderWithLoc()` at line 835)

### Description
Reopening the site on a later day (e.g. the next day, after having it open or
recently closed the day before) can show yesterday's date, Tithi, Nakshatra
and other Panchang values instead of today's. Reported by the user: "the
dates on the panchang page does not update in realtime i.e when I reopened
the site today (after using it yesterday) it showed yesterday's date."

### Root cause
`src/pages/index.astro` is a static Astro page (`output: 'static'`). Its
frontmatter computes `const today = new Date()` (line 33) at **build time**,
and derives `dateStr`, `panchang`, `hinduCal`, `todayFestivals`, `upcoming`
and `planetaryEvents` from it — all baked into the static HTML for whichever
day the site was last deployed. This alone is expected/acceptable, because a
client-side `<script>` block re-derives everything from a fresh
`let currentDate = new Date()` (line 487) and calls
`renderWithLoc(((window as any).__initLoc as Location) || currentLoc, currentDate)`
once on load (line 933), which overwrites the stale server-rendered date via
`setText('date-display', ...)` and recomputes the Panchang client-side using
the real current date — so a genuine fresh page load/reload should always
show the correct day.

The bug is that this client-side recompute only ever runs **once**, at
initial script execution. There is no `pageshow` or `visibilitychange`
listener anywhere in the codebase (verified via repo-wide search — zero
matches for either). This means:
- If the browser restores the page from the back/forward cache (bfcache) —
  common when a mobile browser or PWA-style "reopen" resumes a previously
  backgrounded tab rather than performing a full navigation — the JS heap
  resumes frozen exactly as it was left, with `currentDate` still holding
  the previous day's `Date` object, and nothing re-triggers `renderWithLoc`.
- If a tab is simply left open across midnight, `currentDate` never
  advances either, since nothing re-instantiates `new Date()` after the
  initial load (the `setInterval` at line 936 only redraws the Rahu/Gulika/
  Yama timeline using the same stale `currentDate`, it doesn't refresh it).

Both scenarios match the reported symptom of "reopened the site and it
showed yesterday's date" more closely than a hard/cold reload would (a
genuine cold reload re-runs the script from scratch and would show the
correct date immediately, per the code above).

### Claude Code Fix Prompt
```
Fix a bug in PanchangPath (Astro static site, src/pages/index.astro): the
homepage can show yesterday's date/Tithi/Nakshatra/Panchang data instead of
today's when the site is reopened, rather than freshly reloaded.

Context: index.astro's frontmatter computes `const today = new Date()` at
build time (line ~33) — expected for a static site. Its client-side
<script> block also computes `let currentDate = new Date()` (line ~487) and
calls `renderWithLoc(((window as any).__initLoc as Location) || currentLoc,
currentDate)` once on initial load (line ~933), which correctly overwrites
the stale server-rendered date/Panchang values using the real current date.
The bug: this only runs once, at initial script parse. There is no
`pageshow` or `visibilitychange` listener anywhere in the codebase, so if
the page is restored from the browser's back/forward cache (bfcache) --
common when reopening a previously-backgrounded mobile browser tab or PWA,
rather than performing a full navigation -- the frozen JS state (including
the stale `currentDate`) is resumed as-is with no re-render. The same gap
means a tab left open across midnight never rolls over to the new day
either.

Task: In index.astro's inline <script>, add a `pageshow` event listener
(checking `event.persisted`, which is true when the page came from bfcache)
that resets `currentDate = new Date()` and calls
`renderWithLoc(currentLoc, currentDate)` again (plus re-syncs Kundali/Vedic
Clock widgets the same way the initial load does). Also add a
`visibilitychange` listener that, when the document becomes visible again,
compares the stored `currentDate`'s calendar day (via `toDateString()`) to
`new Date()`'s and re-renders if they differ, to also catch the
long-lived-tab-past-midnight case.

Verify: run npm run build, then in a browser (or via devtools' "Emulate a
focused page"/application panel) simulate a bfcache restore (Chrome DevTools
> Application > Back/forward cache, or navigate away and use the browser
back button) a day after loading the page with the system clock advanced,
and confirm the displayed date/Panchang values update rather than staying
frozen. Update this bug's Status line in docs/bugs/backlog.md to "Fixed
(<date>, commit <hash>)" once verified.
```

---

## Change Language picker: Hindi barely translates anything + Regional Panchang duplicated in the dropdown

- **Status:** Fixed (2026-07-17). Issue A (Regional Panchang
  duplication): commit `b151037` removed the REGIONS spread and
  "Regional Panchang" section from `LanguagePicker.astro`, and removed
  the now-dead regional-i18n branch it left behind in `index.astro`
  (`getI18N`/`regionalTithi`/`regionalNakshatra`/`regionalMonth`/
  `regionalVara`/`regionalPaksha` + the embedded `clientI18N` JSON —
  all unreachable once the picker can only ever dispatch `'en'`/`'hi'`).
  Issue B (full sitewide Hindi coverage — the user explicitly chose
  this larger scope over just relabeling the picker): a reusable
  pattern was established (`data-hi="..."` attribute + a per-page
  `applyPageLang()` listening for `langchange`, see `Header.astro`'s
  `applyHeaderLang` for the reference implementation) and rolled out
  across the whole site in commits `6974e80`, `7b016ab`, `31b0ebf`,
  `e484989`, `9a904b2`, `cce528b`. Verified with a repo-wide sweep: every
  `.astro` file with a `data-hi` attribute has a matching `langchange`
  listener (zero dead/unwired attributes), and every page group has
  100% coverage — `Header.astro` nav (desktop + mobile, every page),
  all 9 `muhurta/*.astro` + hub, all 15 `jyotish/*.astro` + hub, all 4
  `planets/*.astro`, both `events/*.astro`, `festivals/[slug].astro`,
  `rashifal/index.astro`, `rashifal/[rashi].astro`, `prashnavali.astro`,
  `panchang/regional.astro`, `panchang/[region].astro`,
  `devotional/index.astro` + `DevotionalIndexGrid.astro`/
  `DevotionalDetail.astro` UI chrome (lyrics/transliteration/meaning
  content itself deliberately untouched — separately out of scope, see
  the two Devotional bugs below), and `index.astro`'s own remaining
  plain-English elements beyond its original 8 `en-text`/`hi-text`
  pairs. Two files (`rudraksha.astro`, `griha-pravesh.astro`) were left
  mid-edit by an earlier interrupted session (data-hi attributes with
  no listener, dead `tr()`/`isHindi` helpers) — both fixed properly in
  follow-up commits rather than left as dead code. `npm run build`
  passes clean (394 pages) after every commit in this chain. Legal/
  utility pages (about/contact/privacy/terms/404/500) and long-form SEO
  prose paragraphs were deliberately left English-only as lower-priority
  — flag as a separate follow-up if full coverage of those is wanted.
- **Reported:** 2026-07-17
- **Severity:** Medium
- **Affected files:** `src/components/LanguagePicker.astro` (regional section, lines 11-19 and 52-62), `src/pages/index.astro` (`applyLang()` at line 706, `.en-text`/`.hi-text` toggle), `src/components/Header.astro` (nav has zero i18n hooks), `src/pages/calendar.astro`, `src/pages/festivals.astro`, `src/components/KundaliWidget.astro` (only other files listening for `langchange`)

### Description
Reported by the user: switching the top-bar "Change Language" pill to Hindi
(हिं) only translates a handful of words on the homepage rather than the
site; separately, the same dropdown lists all 11 regional calendar
traditions (Bengali, Tamil, Marathi, etc.) under a "Regional Panchang"
section as if they were interface-language choices, even though the site
already has a dedicated Regional Panchang hub (`/panchang/regional`) — the
user wants that section removed from the language picker entirely.

### Root cause
Two independent issues in the same component:

1. **Incomplete Hindi coverage.** `applyLang()` in `index.astro` (line 706)
   only toggles `display` on elements manually tagged with paired
   `.en-text`/`.hi-text` classes, and refreshes the Panchang summary card's
   regional-name lookups. A repo grep found only 8 `.en-text` and 7
   `.hi-text` elements in the entire homepage — everything else (headings,
   CTAs, buttons, feed cards) is plain hardcoded English with no Hindi
   counterpart markup at all. `Header.astro`'s nav (desktop dropdowns,
   mobile drawer) has **zero** matches for `.en-text`, `.hi-text`, or
   `langchange` — the entire top navigation stays in English no matter what
   language is selected. The `langchange` custom event (dispatched by
   `LanguagePicker.astro` on selection) is only listened for in 4 files
   (`index.astro`, `calendar.astro`, `festivals.astro`,
   `KundaliWidget.astro`); every other page (all of `muhurta/*`,
   `jyotish/*`, `devotional/*`, `rashifal/*`, etc.) has no listener, so the
   selected language has no effect there and isn't carried over on
   navigation.
2. **Regional Panchang duplicated as a "language."** `LanguagePicker.astro`
   builds its `LANGS` array as `[English, Hindi, ...REGIONS.map(...)]`
   (lines 11-19) and renders the `REGIONS` portion under a
   `"Regional Panchang"` section header inside the same dropdown (lines
   52-62). Picking one of these dispatches the same `langchange` event,
   which `index.astro` uses to relabel Tithi/Nakshatra/month names with
   that tradition's naming convention — a narrower, homepage-only mechanism
   that duplicates the full dedicated pages already built at
   `src/pages/panchang/[region].astro` for all 11 traditions (plus the
   `/panchang/regional` preview hub).

### Claude Code Fix Prompt
```
Fix two related issues in PanchangPath's top-bar language picker
(src/components/LanguagePicker.astro).

Issue A -- remove Regional Panchang from the language picker: LANGS (lines
~11-19) currently concatenates English, Hindi, and every entry from
REGIONS (imported from src/lib/panchang-i18n.ts) into one list, and the
dropdown template (lines ~37-63) renders the REGIONS portion under a
"Regional Panchang" section header, using LANGS.slice(2) for the regional
buttons. Remove the "Regional Panchang" section and the REGIONS spread from
LANGS entirely, leaving only the "Interface" section with English and
Hindi. Do not touch src/lib/panchang-i18n.ts, src/pages/panchang/[region].astro,
or src/pages/panchang/regional.astro -- the full Regional Panchang feature
stays, only its duplicate entry point inside this picker is removed. Check
whether any remaining code (e.g. index.astro's getI18N()/regionalTithi()/
regionalNakshatra()/regionalMonth()/regionalVara() helpers, which currently
key off `currentLang` matching a REGIONS code) still needs those regional
codes reachable some other way, or whether that client-side i18n branch in
index.astro becomes dead code once this picker can no longer select a
region -- if it becomes unreachable, remove it too rather than leaving it
as dead code.

Issue B -- Hindi coverage is much narrower than the picker implies: only 8
`.en-text`/7 `.hi-text` element pairs exist across index.astro, toggled by
applyLang() (line ~706); Header.astro's nav (desktop dropdown, mobile
drawer, search) has no Hindi variant at all; and the `langchange` event
index.astro listens for is only wired up on 3 other pages (calendar.astro,
festivals.astro, KundaliWidget.astro) -- everywhere else, selecting Hindi
has no visible effect and the choice doesn't persist across navigation
(despite being saved to localStorage under 'pp-lang', per-page there's no
listener to read it back into the DOM except where wired). This is a much
bigger scope than issue A -- decide with the user whether to (a) build out
full sitewide Hindi coverage (extend the .en-text/.hi-text pattern to
Header.astro's nav at minimum, since that appears on every page, and wire a
langchange/localStorage-read listener into every page that currently lacks
one), or (b) scope the picker's label/copy to be honest about current
coverage (e.g. only expose Hindi on pages that actually support it) until
full coverage is built. Don't silently pick one -- this changes user-facing
scope, not just a bugfix.

Verify: run npm run build, load the homepage locally, open the language
picker and confirm only English/Hindi remain (no "Regional Panchang"
section), and exercise whatever Hindi-coverage fix was chosen across at
least the homepage and one other major page (e.g. a muhurta or jyotish
page) to confirm consistent behavior. Update this bug's Status line in
docs/bugs/backlog.md to "Fixed (<date>, commit <hash>)" once verified.
```

---

## Devotional Library lyrics contain memory-sourced inaccuracies, not verified against sources

- **Status:** Fixed (2026-07-19). All 9 in-scope categories re-verified against
  curl-fetched, tag-stripped verbatim sources (drikpanchang.com,
  aartichalisa.com, stotranidhi.com, sanatanveda.com, vignanam.org, and
  others), per CLAUDE.md's sourcing discipline — never WebFetch, never
  memory-reconstruction. `chalisa.ts` (15 items, 12 corrected — see prior
  session), `mantra.ts` (15 items, 1 corrected), `pujavidhi.ts` (15 items, 5
  corrected), `yantra.ts` (12 items, 2 corrected), `vratkatha.ts` (18 items,
  6 corrected — independently spot-checked against the well-documented
  Veeravati Karva Chauth katha, confirmed genuine), `aarti.ts` (18 items, 13
  corrected; 1 item, `ayyappa-swamy-aarti`, left unresolved — no Hindi
  source could be located to verify or correct it, flagged for a future
  pass), `stotram.ts` (15 items, 13 corrected — mostly severe truncation,
  e.g. Aditya Hridayam/Ram Raksha/Shri Suktam had verses replaced by "..."
  placeholders, restored to full verse counts), `ashtakam.ts` (11 items, 10
  corrected, including one item — `venkateswara-ashtakam` — that was
  entirely mislabeled Suprabhatam text instead of the actual Ashtakam), and
  `namavali.ts` (10 items, 9 corrected; agent wrote a Sanskrit
  dative→nominative case converter since sourced archana-format lists use
  "... नमः" grammar, independently spot-checked and confirmed correct — a
  small number of legitimately-repeated names within some lists, e.g.
  Durga's `निर्गुणा`, were traced to the source text itself and kept
  faithfully rather than "corrected" into invented substitutes, matching
  this project's existing Gowri Panchangam precedent).
  `durgasaptashati.ts` and `sundarkand.ts` were already verbatim-sourced
  prior to this bug (see CLAUDE.md) and were not re-touched. Every category
  was independently spot-checked (`git diff --stat` + re-fetching the
  agent's cited source and diffing against the corrected text) before being
  trusted — all spot-checks confirmed genuine, sourced corrections. `npm run
  build` passes clean (396 pages) on the full combined diff. Only the
  `lyricsHi` field was touched throughout — `transliteration` completeness
  is tracked separately in the sibling bug below.
- **Reported:** 2026-07-17
- **Severity:** High
- **Affected files:** `src/lib/devotional/*.ts` (all content files for the 10 built categories — confirmed error in `chalisa.ts`'s `krishna-chalisa` entry; other items not yet individually checked)

### Description
The user reported errors across Aarti, Chalisa, Stotram and other
Devotional Library sections and asked for the full library to be
re-verified against three reference sites: aartichalisa.com
(`/category/aarti/`), drikpanchang.com (`/lyrics/devotional-lyrics.html`),
and aajtak.in (`/religion/aarti`).

A spot-check against aartichalisa.com confirms the concern is real. This
site's Krishna Chalisa (`src/lib/devotional/chalisa.ts`, slug
`krishna-chalisa`) opens with:

> बंशी शोभित कर मधुर, नंद लला महाराज।
> जय यशोदा के प्रान धन, राखो मेरी लाज॥

aartichalisa.com's published Krishna Chalisa (`https://www.aartichalisa.com/krishna-chalisa/`)
opens with a longer, differently-worded doha:

> बंशी शोभित कर मधुर, नील जलद तन श्याम।
> अरुण अधर जनु बिम्ब फल, नयन कमल अभिराम॥
> पूर्ण इन्द्र, अरविन्द मुख, पिताम्बर शुभ साज।
> जय मनमोहन मदन छवि, कृष्णचन्द्र महाराज॥

This site's version is half the length (2 lines vs. the source's 4) and the
second line's wording doesn't correspond to anything in the reference
doha at all — it reads as a substituted/conflated line rather than a
trimmed-but-faithful copy. By contrast, the chaupai body immediately after
(`जय यदुनंदन जय जगवंदन। जय वसुदेव देवकी नंदन॥...`) matches the source
closely (only minor anusvara/chandrabindu spelling variance, e.g. नंदन vs.
नन्दन), so the corruption is localized rather than affecting the whole
item — but there's no reason to assume it's the only one across ~150
devotional items.

### Root cause
CLAUDE.md documents a specific sourcing discipline for this content —
"do not reconstruct from memory if a reference source is available" — but
frames it as something established for the Durga Saptashati and Sundarkand
categories specifically (`curl` the raw HTML + strip tags + verify against
the source's own verse-count colophon). Nothing in the codebase or
CLAUDE.md indicates this discipline was applied retroactively to the 8
categories built before that practice was documented (Aarti, Chalisa,
Stotram, Ashtakam, Vedic Mantras, Namavali, Vrat Katha, Puja Vidhi). The
Krishna Chalisa doha error is consistent with content generated from
training-data recall rather than copied from a checked source: the
well-known, frequently-repeated chaupai body came through accurately, while
the doha — shorter, more variable across regional printings, and easier to
misremember — was reconstructed incorrectly.

### Claude Code Fix Prompt
```
Re-verify and correct the Hindi lyrics (lyricsHi field) across PanchangPath's
Devotional Content Library (src/lib/devotional/*.ts) against authoritative
sources, per the user's request. This is a large task -- work category by
category rather than attempting everything in one pass.

Context: a spot-check already confirms a real error. In
src/lib/devotional/chalisa.ts, the 'krishna-chalisa' item's opening doha
reads:
  "बंशी शोभित कर मधुर, नंद लला महाराज।
   जय यशोदा के प्रान धन, राखो मेरी लाज॥"
but aartichalisa.com's published Krishna Chalisa
(https://www.aartichalisa.com/krishna-chalisa/) has a different, longer
doha:
  "बंशी शोभित कर मधुर, नील जलद तन श्याम।
   अरुण अधर जनु बिम्ब फल, नयन कमल अभिराम॥
   पूर्ण इन्द्र, अरविन्द मुख, पिताम्बर शुभ साज।
   जय मनमोहन मदन छवि, कृष्णचन्द्र महाराज॥"
Fix this specific doha first as a confirmed starting point, leaving the
rest of that item (the chaupai body, which already matches the source)
untouched.

Task: For each of the 10 built Devotional Library categories (Aarti,
Chalisa, Stotram, Ashtakam, Vedic Mantras, Vedic Yantras, Deity Namavali,
Vrat Katha, Puja Vidhi, and the already-verbatim-sourced Durga Saptashati/
Sundarkand which can likely be skipped since CLAUDE.md documents they were
already curl-sourced), cross-check each item's lyricsHi text against these
three reference sites (per the user's instruction):
  - https://www.aartichalisa.com/category/aarti/ (and the site's other
    category/individual pages, e.g. /krishna-chalisa/, /lakshmi-chalisa/,
    reachable by slug pattern https://www.aartichalisa.com/<slug>/)
  - https://www.drikpanchang.com/lyrics/devotional-lyrics.html
  - https://www.aajtak.in/religion/aarti
Per CLAUDE.md's "Sourcing long/sacred texts accurately" section: WebFetch
cannot return verbatim text (hard ~125-char quote limit, it paraphrases) --
use curl with a browser User-Agent to fetch raw HTML, strip tags/decode
entities in Node, and extract the verse content between markers, the same
way the Durga Saptashati/Sundarkand commits did (see git history for that
script). Verify each corrected item by checking line/verse counts match the
source structure, not just spot words.

Track progress explicitly (e.g. a checklist of category -> item -> verified/
corrected/unchanged) since this spans ~150 items and will likely need
multiple sessions. Also check this bug's sibling entry in
docs/bugs/backlog.md, "Devotional transliteration fields truncated with
placeholder text..." -- the transliteration field for many of these same
items needs a parallel fix and the two could reasonably be done together
per item to avoid re-opening each file twice.

Verify: run npm run build after each category's corrections. Update this
bug's Status line in docs/bugs/backlog.md to "Fixed (<date>, commit
<hash>)" once a category (or the full library) is verified -- note in the
status which categories were covered if not all of them in one pass.
```

---

## Devotional transliteration fields truncated with placeholder text in Ashtakam, Chalisa, Namavali, Stotram

- **Status:** Open
- **Reported:** 2026-07-17
- **Severity:** Medium
- **Affected files:** `src/lib/devotional/ashtakam.ts` (11 items), `src/lib/devotional/chalisa.ts` (15 items), `src/lib/devotional/namavali.ts` (10 items), `src/lib/devotional/stotram.ts` (15 items) — 51 items total. **Not affected** (verified 0 occurrences of the truncation pattern): `aarti.ts`, `mantra.ts`, `yantra.ts`, `pujavidhi.ts`.

### Description
The user reported the transliteration feature in the Devotional Library
"seems to not work properly." The "Show Transliteration" toggle UI itself
(`src/components/DevotionalDetail.astro`, lines 63-71 and the script at
lines 131-140) is implemented correctly — it swaps which of two `<pre>`
blocks is `hidden` and relabels the button. The actual bug is in the data:
for most items in 4 of the site's 10 built categories, the `transliteration`
field is not a complete transliteration at all — it's the first
verse/name(s), then a bracketed one-sentence English (and sometimes also
Hindi) *summary* of the middle content containing a literal `"... ("`
ellipsis, then the last verse. Two concrete examples:

`src/lib/devotional/ashtakam.ts`, `shiva-ashtakam` (an 8-verse hymn — full,
correct Sanskrit for all 8 verses exists in `lyricsHi`):
```
transliteration: `Prabhum pranatham vibhum vishwanatham
...
Shivam shankaram shambhum-ishanam-ide.

... (8 verses composed in praise of Shiva as lord of the universe, adorned with a serpent garland and skull, seated with Parvati on Mount Kailash) ...

Shivashtakam idam punyam yah pathechchhiva-sannidhau,
Shivalokam avapnoti Shivena saha modate.`
```
Only verse 1 and the closing phalashruti verse are transliterated; verses
2–8 are replaced by a prose summary.

`src/lib/devotional/namavali.ts`, `shiva-ashtottara-shatanamavali` (108
names — full, correct Devanagari for all 108 names exists in `lyricsHi`):
```
transliteration: `1. Shivah 2. Maheshwarah ... 10. Shankarah
11. Shoolapanih 12. Khatwangi 13. Vishnuvallabhah 14. Shipivishtah 15. Ambikanathah ... (continuing through all 108 names)
101. Bhaganetrabhit 102. Avyaktah 103. Sahasrakshah 104. Sahasrapat 105. Apavargapradah 106. Anantah 107. Tarakah 108. Parameshwarah.`
```
Only names 1–15 and 101–108 are transliterated; names 16–100 (85 of 108)
are missing, replaced by "(continuing through all 108 names)".

A user who opens the transliteration view on any of these 51 items sees an
incomplete, English-prose-interrupted result that doesn't correspond
line-by-line to the Devanagari original — which reads as broken.

### Root cause
When `ashtakam.ts`, `chalisa.ts`, `namavali.ts` and `stotram.ts` were
authored, each item's `transliteration` field was written as
"first unit + one-sentence summary of the middle + last unit" rather than a
complete romanization of every line — apparently a length/effort-saving
shortcut taken specifically for this field, since the corresponding
`lyricsHi` (Devanagari) field in the same items is complete. Confirmed by
grepping every `src/lib/devotional/*.ts` file for the literal substring
`"... ("`: `ashtakam.ts` has 18 matches across its 11 items (many items
carry both a Devanagari- and an English-language summary sentence),
`chalisa.ts` has 15 matches for 15 items (100% of chalisas affected),
`namavali.ts` has 10 matches for 10 items (100%), and `stotram.ts` has 23
matches across 15 items. `aarti.ts`, `mantra.ts`, `yantra.ts` and
`pujavidhi.ts` have zero matches — their transliteration fields were
authored completely and are not affected by this bug.

### Claude Code Fix Prompt
```
Fix incomplete/placeholder transliteration data in PanchangPath's Devotional
Content Library. The "Show Transliteration" toggle UI (src/components/
DevotionalDetail.astro) works correctly -- this is purely a data problem in
4 of the library's 10 built category files.

Confirm scope first: grep -n '\.\.\. \(' across src/lib/devotional/ashtakam.ts,
chalisa.ts, namavali.ts, stotram.ts -- every match marks an item whose
transliteration field truncates the middle of the item into a one-sentence
English/Hindi summary instead of a complete line-by-line romanization,
while the item's lyricsHi (Devanagari) field is already complete and
correct. aarti.ts, mantra.ts, yantra.ts and pujavidhi.ts do not have this
problem (verified zero matches) -- don't touch them.

Task: for every item with this pattern in the 4 affected files, replace the
truncated transliteration with a complete, line-by-line Roman
transliteration of that item's full lyricsHi content (every verse/name, not
a summary). Use a consistent transliteration scheme across each file (the
existing untruncated portions already establish the style/scheme per item
-- e.g. shiva-ashtakam's transliteration already correctly romanizes verse
1 and the phalashruti verse; extend that same scheme to verses 2-8). For
namavali.ts specifically, each of the 108 names needs its own numbered
transliteration entry (matching the numbering already used for 1-15 and
101-108 in each item).

This pairs naturally with the sibling bug in docs/bugs/backlog.md,
"Devotional Library lyrics contain memory-sourced inaccuracies..." -- since
both require opening the same files/items, consider fixing both the
lyricsHi accuracy and the transliteration completeness for each item in the
same pass rather than two separate passes over the same 51+ items.

Verify: after fixing, re-run grep -c '\.\.\. \(' on each of the 4 files and
confirm 0 remaining matches. Spot-check a handful of fixed items by loading
their /devotional/<category>/<slug> page locally, clicking "Show
Transliteration", and confirming the visible line count roughly matches the
Devanagari line count (no missing middle section). Run npm run build.
Update this bug's Status line in docs/bugs/backlog.md to "Fixed (<date>,
commit <hash>)" once verified -- note which of the 4 files were covered if
not all in one pass.
```

---

## Detect My Location geolocation feature is ineffective and should be removed

- **Status:** Fixed (2026-07-17, commit `322bfd8`)
- **Reported:** 2026-07-17
- **Severity:** Low
- **Affected files:** `src/components/LocationPicker.astro` (`detectLocation()` function, lines 255-295; `lp-geo` button markup, lines 47-52; event listener, line 375)

### Description
The user reported the location-detection feature ("Detect My Location" in
the header's location picker) "does not seem effective" and asked for it to
be removed. Investigation confirms the feature has a structural limitation:
`detectLocation()` calls `navigator.geolocation.getCurrentPosition()` and,
on success, builds a location object with `name: 'My Location'` /
`nameHi: 'मेरा स्थान'` (lines 274-284) — it never resolves the raw
coordinates to an actual place name. Every part of the site that displays
the current city name (header pill, Panchang summary card, festival feed,
etc.) then shows the generic "My Location" label instead of a real city.
Additionally, `pos.coords.altitude` (used for the "Elevation" field) is
`null` on the large majority of browsers/devices — desktop browsers in
particular essentially never report device altitude — so the info card's
Elevation row shows "N/A" for most users even on success.

### Root cause
This is an architectural limitation, not a fixable logic bug: the site is
a fully static build with zero backend/external API calls (by design, part
of its zero-ads/lightweight positioning), so there is no reverse-geocoding
step available to turn `{lat, lng}` into a real city/place name.
`detectLocation()` can therefore only ever label the result generically —
it has no way to know it's near, say, "Pune" rather than any other nearby
point. Given that limitation, and the user's explicit request, the fix is
removal rather than a repair.

### Claude Code Fix Prompt
```
Remove the "Detect My Location" geolocation feature from PanchangPath's
location picker per user request (src/components/LocationPicker.astro).

Context: detectLocation() (lines ~255-295) calls
navigator.geolocation.getCurrentPosition() and on success builds a location
object labeled generically as 'My Location' / 'मेरा स्थान' (it cannot
resolve real coordinates to an actual place name, since this is a fully
static site with no backend/reverse-geocoding API) -- this is why the
feature reads as broken/ineffective rather than a bug with a code fix.

Task: remove the "Detect My Location" button (the `.lp-geo-btn` element
with id="lp-geo" and its child span id="lp-geo-txt", around lines 47-52),
the detectLocation() function (lines ~255-295), and its event listener
(`document.getElementById('lp-geo')?.addEventListener('click',
detectLocation);` around line 375). Check the surrounding `.lp-actions`
container layout (around line 46) still looks correct with only the search
input remaining -- adjust CSS (`.lp-geo-btn` styles around lines 533-552,
`.lp-actions` flex layout) if removing the button leaves obvious empty
space. Leave the city search/list functionality (ensureCities(),
filterCities(), renderCityList(), selectLocation()) untouched.

Verify: run npm run build, then load the site locally, open the location
picker (click the location pill in the header), and confirm no "Detect My
Location" button appears and the search-by-city-name flow still works
end-to-end (search, select a city, confirm the header pill and Panchang
data update). Update this bug's Status line in docs/bugs/backlog.md to
"Fixed (<date>, commit <hash>)" once verified.
```

---

## Festivals page title and subtitle stuck at stale 2025-2026 (site now covers 2025-2027)

- **Status:** Fixed (2026-07-17, commit `b77ccb9`)
- **Reported:** 2026-07-17
- **Severity:** Low
- **Affected files:** `src/pages/festivals.astro` (`<Layout title>` at line 26, subtitle paragraph at line 33)

### Description
The user flagged the "...for 2025-2026" wording on the Festivals section
description. Confirmed: `festivals.astro`'s page title reads "Hindu
Festival Calendar 2025-2026 — PanchangPath" and its `<Layout description>`/
on-page subtitle both say "for 2025 and 2026" / "for 2025–2026." This text
is now stale — per CLAUDE.md's Known Issues log, the underlying festival
data (`src/lib/festivals.ts`) was expanded in 2026-07 to add a full 2027
block and was renamed from `FESTIVALS_2025_2026` to `FESTIVALS_2025_2027`
to reflect it. The Festivals page's title/description text was never
updated to match, so it now understates the site's actual coverage.

### Root cause
`src/pages/festivals.astro` hardcodes the literal years "2025-2026" /
"2025 and 2026" / "2025–2026" in its `<Layout title>` (line 26) and its
subtitle paragraph (line 33), disconnected from the actual data range in
`src/lib/festivals.ts`'s `FESTIVALS_2025_2027` array. When the array was
extended to 2027, nobody updated this hardcoded page copy to match — and
because it's a hand-typed string rather than something derived from the
data, it will go stale again the next time a year is added (e.g. a future
2028 block) unless it's fixed to derive the range programmatically.

### Claude Code Fix Prompt
```
Fix stale year-range text on PanchangPath's Festivals page
(src/pages/festivals.astro).

Context: the page's <Layout title="Hindu Festival Calendar 2025-2026 —
PanchangPath" ...> (line ~26) and its subtitle paragraph "All major Hindu
festivals, vrats, and auspicious days for 2025–2026 with detailed
information." (line ~33) both say "2025-2026", but src/lib/festivals.ts's
festival array was renamed FESTIVALS_2025_2026 -> FESTIVALS_2025_2027 and a
full 2027 block was added in 2026-07 (see CLAUDE.md's Known Issues section,
"No 2027 festival data at all -- fixed 2026-07"). This page's copy was
never updated to match, so it now undersells the site's actual coverage.

Task: update both the <Layout title> and the subtitle paragraph in
festivals.astro to say "2025-2027" (and update the <Layout description>
prop too if it also mentions the old range -- check it). Better: derive the
displayed year range programmatically instead of hardcoding it again --
e.g. compute Math.min/Math.max over the year portion of each festival's
`date` field across FESTIVALS_2025_2027 (imported from src/lib/festivals.ts)
and interpolate that into the title/subtitle -- so this doesn't go stale
the next time a year block is added.

Verify: run npm run build, load /festivals locally, and confirm the page
title (browser tab) and on-page subtitle both read 2025-2027 (or whatever
the computed range is once 2028+ data is eventually added). Update this
bug's Status line in docs/bugs/backlog.md to "Fixed (<date>, commit
<hash>)" once verified.
```

---

## Tithi/Nakshatra/Yoga/Karana boundary end-times run 45min–2.5h too early

- **Status:** Fixed (2026-07-17, commit `55704d0`) — `estimateEndTime()` (`src/lib/panchang.ts`)
  and `estimateEnd()` (`src/pages/index.astro`) now use an iterative boundary-crossing search
  (same refinement pattern as `moonRiseSetUTC()`), recomputing the actual instantaneous rate of
  the relevant angle each step instead of assuming a fixed rate; both files now agree on one
  model per element (Moon-Sun elongation for Tithi/Karana, Moon sidereal for Nakshatra,
  combined Sun+Moon for Yoga). Verified via a standalone Node reproduction against
  drikpanchang.com for New Delhi 2026-07-14 and 2026-07-15: Yoga/Nakshatra now land within
  ~1-2 minutes; Tithi/Karana land within ~4-5 minutes (down from 45min-2.5h, but not fully to
  the ~1-2min target) — the residual gap traces to this codebase's abbreviated Sun-longitude
  series (elongation is the slowest-moving of the four quantities, so a small fixed longitude
  error there shows up as more time error), not the boundary-search method itself, which
  converges to sub-second precision against whatever the underlying model computes. Worth a
  future follow-up if full drikpanchang-level agreement on Tithi/Karana is desired.
- **Reported:** 2026-07-16
- **Severity:** Medium
- **Affected files:** `src/lib/panchang.ts` (`estimateEndTime()`), `src/pages/index.astro` (duplicate inline `estimateEnd()`)

### Description
The Tithi, Nakshatra, Yoga, and Karana "ends at" times shown on the site
run systematically earlier than reality: confirmed via an independent
third-source cross-check (mypanchang.com, which computes from NASA JPL
DE405 ephemeris data — an unrelated computational lineage from
drikpanchang.com) for New Delhi, 2026-07-14. drikpanchang.com and
mypanchang.com agree with each other to within about a minute on every
field, while this site's live values are earlier by ~45 minutes
(Tithi/Karana), ~2.5 hours (Nakshatra), and ~45 minutes (Yoga):

| Field | PanchangPath (live) | drikpanchang.com | mypanchang.com |
|---|---|---|---|
| Tithi ends | 3:57 PM | 3:12 PM | 3:13:22 PM |
| Nakshatra ends | 2:44 AM (+1d) | 12:09 AM (+1d) | 12:09:26 AM (+1d) |
| Yoga ends | 12:42 PM | 11:57 AM | 11:56:33 AM |
| Karana ends | 3:57 PM | 3:12 PM | 3:13:22 PM |

Full method, data, and root-cause notes:
`docs/audits/notes/2026-07-16-boundary-drift-followup.md`.

### Root cause
`estimateEndTime()` in `src/lib/panchang.ts`, and its duplicate
`estimateEnd()` in `src/pages/index.astro`'s inline `<script>` block (client
scripts in static Astro can't import from `src/lib`, so the logic is
intentionally duplicated — see CLAUDE.md's Gotchas), both use a
single-linear-rate extrapolation:
`(degPerUnit - (lon % degPerUnit)) / assumedRate`, assuming a constant rate
of angular change (~13.17°/day for the Moon) from the current moment all
the way to the boundary crossing. Over the multi-hour spans involved this
produces a real, consistent error — not legitimate inter-method variance,
per the third-source cross-check. `index.astro`'s copy additionally passes
a Yoga-specific rate of `14.17` (Moon ~13.17 + Sun ~1, since Yoga is a
combined Sun+Moon angle) while `panchang.ts`'s version hardcodes `13.17`
for all four elements — the two copies already disagree with each other
on Yoga independent of the drikpanchang comparison.

### Claude Code Fix Prompt
```
Fix a precision bug in PanchangPath's Tithi/Nakshatra/Yoga/Karana
boundary-end-time calculations: they run ~45 minutes to ~2.5 hours
earlier than two independent reference sources (drikpanchang.com and
mypanchang.com, which agree with each other to within ~1 minute).

Context: boundary end-times are computed by estimateEndTime() in
src/lib/panchang.ts, and duplicated as estimateEnd() in
src/pages/index.astro's inline <script> block. Both currently use a
single-linear-rate extrapolation: (degPerUnit - (lon % degPerUnit)) /
assumedRate, assuming a constant rate of angular change (~13.17 deg/day
for the Moon) from the current moment to the boundary crossing. This is
insufficiently precise -- confirmed via a third-source cross-check
(docs/audits/notes/2026-07-16-boundary-drift-followup.md) using
mypanchang.com (NASA JPL DE405 ephemeris) against drikpanchang.com for
New Delhi, 2026-07-14: both external sources agree to the minute, while
this site's live values differ by 45min (Tithi/Karana), 2.5h
(Nakshatra), ~45min (Yoga).

Task: Replace the single-linear-rate extrapolation in estimateEndTime()
(src/lib/panchang.ts) with an iterative boundary-search approach -- the
same pattern this codebase already uses successfully for
moonRiseSetUTC() (find and follow that function's iterative-refinement
style). At each iteration, recompute the actual instantaneous rate of
change of the relevant angle (Moon longitude for Tithi/Nakshatra/Karana;
combined Sun+Moon angle for Yoga) rather than assuming a fixed rate, and
narrow in on the exact crossing time. Apply the same fix to the
duplicate estimateEnd() in src/pages/index.astro. While there, reconcile
the two copies' Yoga rate handling: index.astro's estimateEnd() passes
an explicit 14.17/day rate for Yoga (Moon ~13.17 + Sun ~1) while
panchang.ts's estimateEndTime() hardcodes 13.17 for all four elements --
the new iterative approach should make both copies agree exactly for all
four elements, so pick one physically-correct model per element type and
use it in both files.

Verify: run npm run build. Reproduce the New Delhi, 2026-07-14 case from
docs/audits/notes/2026-07-16-boundary-drift-followup.md and confirm the
new end-times land within ~1-2 minutes of: Tithi 3:12-3:13 PM, Nakshatra
~12:09 AM (+1 day), Yoga ~11:56-11:57 AM, Karana 3:12-3:13 PM. Also
spot-check one or two additional dates against drikpanchang.com to
confirm the fix generalizes, not just for this one date. Update this
bug's Status line in docs/bugs/backlog.md to "Fixed (<date>, commit
<hash>)" once verified.
```

---

## `index.astro` inline sunrise/sunset missing Equation-of-Time term

- **Status:** Fixed (2026-07-17, commit `55704d0`) — added an inline `equationOfTimeMinutes()`
  (copied from `src/lib/panchang.ts`) to `index.astro`'s client script and wired it into the
  inline `sunriseUTC()`. Also grepped the rest of the codebase per this bug's fix prompt and
  found two more inline `sunriseUTC()` copies with the same gap: `src/pages/muhurta.astro` and
  `src/pages/jyotish/pancha-pakshi.astro` — both fixed the same way. Verified via a standalone
  Node reproduction for New Delhi 2026-07-14/2026-07-15: sunrise/sunset now match
  drikpanchang.com exactly (5:33 AM / 7:21 PM both dates).
- **Reported:** 2026-07-16
- **Severity:** Medium
- **Affected files:** `src/pages/index.astro` (inline `sunriseUTC()`, around line 389)

### Description
The live homepage displays sunrise/sunset times ~6 minutes off from the
site's own already-correct server-computed value. Confirmed 2026-07-16 via
a standalone Node reproduction of both the server (`src/lib/panchang.ts`)
and client (`src/pages/index.astro`) sunrise formulas for New Delhi,
2026-07-14: server value 5:33 AM / 7:21 PM (matches drikpanchang.com
exactly and mypanchang.com to within a minute — 5:33:50 AM / 7:20:05 PM);
live client-rendered value 5:27 AM / 7:16 PM.
Full method and numbers: `docs/audits/notes/2026-07-16-boundary-drift-followup.md`.

### Root cause
`src/pages/index.astro`'s inline `<script>` block defines its own copy of
`sunriseUTC()` (client-side scripts in static Astro can't import from
`src/lib`, so the math is intentionally duplicated — see CLAUDE.md's
Gotchas), around line 389, using `const noon = 12 - lng / 15;` with no
equation-of-time term at all. When `src/lib/panchang.ts`'s `sunriseUTC()`
was fixed in 2026-07 to add `equationOfTimeMinutes()`, the fix was
propagated to 5 `muhurta/*.astro` pages but this inline copy in
`index.astro` was missed — CLAUDE.md's Known Issues log of that fix does
not list `index.astro` among the files it reached.

### Claude Code Fix Prompt
```
Fix a bug in PanchangPath: the homepage (src/pages/index.astro)'s inline
client-side sunrise/sunset calculation is missing the Equation-of-Time
correction that src/lib/panchang.ts's sunriseUTC() already has.

Context: src/lib/panchang.ts has equationOfTimeMinutes() and a
sunriseUTC() that uses it (this is the correct, already-fixed version --
do not change panchang.ts). src/pages/index.astro has its own duplicate
inline copy of sunriseUTC() inside a <script> block (client-side scripts
in static Astro can't import from src/lib, so the logic is intentionally
duplicated -- see CLAUDE.md's Gotchas). That inline copy still uses
const noon = 12 - lng / 15; with no equation-of-time term, so the live
homepage shows sunrise/sunset roughly 6 minutes off from the
server-rendered value.

Task: Find the inline sunriseUTC() (and any inline solarNoonUTC() it
depends on) in src/pages/index.astro's <script> block (around line 389).
Add an inline copy of equationOfTimeMinutes() (copy its exact
implementation from src/lib/panchang.ts) into the same script block, and
use it in the inline sunriseUTC()/solarNoonUTC() the same way panchang.ts
does, so the client-side and server-side sunrise/sunset values match.

Verify: run npm run build, then load the homepage locally (via astro
dev) for a known date/location (e.g. New Delhi, 2026-07-14) and confirm
the displayed sunrise/sunset (should be ~5:33 AM / ~7:21 PM) matches what
src/lib/panchang.ts computes for the same inputs, and matches
drikpanchang.com/mypanchang.com for that date (~5:33 AM / ~7:20-7:21 PM).
Full reference numbers and method are in
docs/audits/notes/2026-07-16-boundary-drift-followup.md.

Also grep the rest of the codebase (jyotish/*.astro, other
muhurta/*.astro not already fixed) for other inline sunriseUTC() copies
that might have the same gap, per this project's known copy-paste-drift
pattern (see CLAUDE.md Gotchas) -- fix any you find the same way. Update
this bug's Status line in docs/bugs/backlog.md to "Fixed (<date>, commit
<hash>)" once verified.
```
