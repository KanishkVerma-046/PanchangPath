# Devotional Library Cross-Link Candidates

> **Status: BRIEF ONLY — no code has been touched for this list.** This document is the deliverable for "collect every cross-link candidate found across the Task 8/8B Devotional Library SEO passes into one durable file, before a dedicated cross-linking session builds any of it." It is NOT yet in `writing-plans` checkbox/task format. When that session starts, turn the relevant section(s) below into a proper task plan via `superpowers:writing-plans`.
>
> **If you're resuming this cold** (new session, no prior context): read this whole file first. The mechanism to wire any pair below already exists — `DevotionalDetail.astro`'s `relatedLinks` prop, added during Task 8 (flagship tier) specifically for cross-category links, since `prev`/`next` nav only ever links within the same category. Each `[slug].astro` template that wants related links defines a `RELATED: Record<string, {label, labelHi?, href}[]>` map keyed by slug and passes `relatedLinks={RELATED[item.slug]}` — see `src/pages/devotional/vrat-katha/[slug].astro` and `src/pages/devotional/puja-vidhi/[slug].astro` for the live pattern (currently only populated for the Satyanarayan pair).

## Why this exists

The Devotional Library on-page SEO pass ran across a flagship tier (Task 8, 2026-08-22) plus three light-pass batches (Task 8B, Batches 1–3, same day): Batch 1 = Aarti/Chalisa/Ashtakam, Batch 2 = Stotram/Mantra/Yantra, Batch 3 = Namavali/Vrat Katha/Puja Vidhi. Each pass noticed pages in different categories that clearly belong together (same deity, same festival, same mantra/yantra pairing) but are only discoverable via the category index, not linked to each other on the page itself. Cross-linking was explicitly out of scope for every one of those passes — this file is where those findings were meant to land so the eventual cross-linking session doesn't have to reconstruct them from chat history. (Batches 1 and 2's findings were initially reported only in-conversation and had to be recovered from the user rather than the repo — this file exists so that doesn't happen again.)

## Already wired (live, Task 8 flagship tier)

These 3 pairs are already built and live via `relatedLinks` — no work needed, listed here only so the eventual session doesn't re-propose them:

- Ganesh Chalisa ↔ Jai Ganesh Deva Aarti
- Lakshmi Chalisa ↔ Om Jai Lakshmi Mata Aarti
- Satyanarayan Vrat Katha ↔ Satyanarayan Puja Vidhi

## Candidates — not yet wired

### Vrat Katha ↔ Puja Vidhi, same festival (Batch 3)

Highest-confidence group — same mechanism as the Satyanarayan pair above, same festival name on both sides, both pages already exist:

- Karva Chauth Vrat Katha ↔ Karva Chauth Puja Vidhi
- Ganesh Chaturthi Vrat Katha ↔ Ganesh Chaturthi Puja Vidhi
- Janmashtami Vrat Katha ↔ Janmashtami Puja Vidhi
- Ram Navami Vrat Katha ↔ Ram Navami Puja Vidhi
- Navratri Vrat Katha ↔ Navratri/Durga Puja Vidhi

### Aarti ↔ Chalisa, same deity (Batch 1)

Both an Aarti and a Chalisa page exist for each of these deities — pair them the same way as the two already-wired Aarti↔Chalisa pairs above:

- Durga
- Shiva
- Krishna
- Sai (Sai Baba)
- Kali
- Ram
- Hanuman
- Saraswati
- Vaishno Devi

### Mantra ↔ Yantra (and Stotram where relevant), same deity (Batch 2)

Both a Mantra page and a Yantra page exist for each of these — pair them:

- Ganesh
- Lakshmi
- Saraswati
- Durga
- Shani
- Navgraha
- Hanuman
- Kuber
- Mahamrityunjaya (Mantra page from the Task 8 flagship tier, Yantra page added in Batch 2 — both exist now)

### Softer deity-cluster candidates (Batch 3)

Lower confidence than the same-festival/same-deity-exact-match pairs above — these link a Vrat Katha or Puja Vidhi page to same-deity content in an unrelated category, where the connection is topical rather than a shared proper name:

- Mangalwar (Tuesday) Vrat Katha ↔ Hanuman Chalisa / Hanuman Ashtottara Shatanamavali
- Shanivar (Saturday) Vrat Katha ↔ Shani Ashtottara Shatanamavali
- Budhwar (Wednesday) Vrat Katha ↔ Ganesh Chalisa / Ganesh Ashtottara Shatanamavali
- Pradosh Vrat Katha ↔ Rudrabhishek Puja Vidhi / Shiva Ashtottara Shatanamavali
- Sankashti Chaturthi Vrat Katha ↔ Ganesh Ashtottara Shatanamavali (and the Ganesh Chaturthi pair above)
- Saraswati Puja Vidhi ↔ Saraswati Ashtottara Shatanamavali
- Diwali Lakshmi Puja Vidhi ↔ Lakshmi Ashtottara Shatanamavali
- Maha Shivratri Puja Vidhi ↔ Shiva Ashtottara Shatanamavali

## Decision needed (when the cross-linking session starts)

- Whether to build all four groups above in one pass or split by confidence tier (same-festival/same-deity-exact-match groups first, softer cluster group second/optional).
- Whether `relatedLinks` should stay a hand-maintained per-slug `RELATED` map (current pattern, fine at this scale) or move to a generated/derived mapping if the Devotional Library keeps growing (currently 143 leaf pages across 9 built categories, Nama Ramayanam still not built).
