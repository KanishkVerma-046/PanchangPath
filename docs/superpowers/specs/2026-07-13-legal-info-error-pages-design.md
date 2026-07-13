# Legal/Info Pages & Error Pages — Design

**Date:** 2026-07-13
**Status:** Approved

## Goal

Add the standard set of legal/informational pages a public site needs — About Us, Privacy Policy, Terms & Conditions, Contact Us (embedding a Google Form) — plus a 500 error page to sit alongside the existing 404.

## Context

- `src/pages/404.astro` already exists: a minimal page using `Layout.astro`, with inline styles for a centered code/heading/message/CTA block.
- No analytics, cookies, or accounts exist anywhere in the codebase (confirmed via grep). The only client-side persistence is `localStorage` (language pref, saved location, dark-mode toggle) and the browser Geolocation API — both stay entirely on-device, nothing is sent to a server.
- Site is deployed as a static build (`astro build`) to Cloudflare Pages via `wrangler pages deploy`, no server/Functions. A true HTTP 500 from application code can't actually occur under this hosting model — Cloudflare's own edge would show its error screen for real server-side failures. The `/500` page is added anyway, for visual consistency and in case Functions get added later; it won't auto-fire.
- `Layout.astro`'s footer currently has a 3-column grid (`2fr 1fr 1fr`: brand blurb, Panchang links, Jyotish links) with a mobile override collapsing to `1fr 1fr`.
- Governing law for Terms: India (general, no specific state).

## Architecture

Two new shared components, following the codebase's existing pattern of shared list/detail components (e.g. `DevotionalDetail.astro`):

### `src/components/StaticPage.astro`
Wraps `Layout`. Props: `title`, `description` (for SEO/meta), `lastUpdated` (date string). Renders a centered header block (title + "Last updated: {lastUpdated}") followed by a `<slot />` for prose body content, styled with readable measure (max-width ~720px), consistent heading/paragraph/list spacing matching the site's existing typography tokens (`--color-ink`, `--color-body-text`, `--color-mute`).

Used by:
- `src/pages/about.astro`
- `src/pages/privacy.astro`
- `src/pages/terms.astro`
- `src/pages/contact.astro` (header/intro only — body below is bespoke)

### `src/components/ErrorState.astro`
Extracts the existing 404 visual block into a reusable component. Props: `code` (e.g. `"404"`, `"500"`), `heading`, `message`. Renders the same centered code/heading/message/"Back to Home" CTA markup currently inline in `404.astro`.

Used by:
- `src/pages/404.astro` (refactored to use the component — same visual output, no behavior change)
- `src/pages/500.astro` (new)

## Pages & Content

### `/about` — About Us
What PanchangPath is and why it exists: a cleaner, faster, completely ad-free alternative to sites like drikpanchang.com, built on Drik (astronomical) calculations with Lahiri Ayanamsha. Framed as an independent project — no fabricated company name, team roster, or founding story beyond what's true (a project built to make accurate Panchang/Jyotish tools genuinely pleasant to use, free of ads and clutter).

### `/privacy` — Privacy Policy
Must accurately reflect actual behavior, not generic boilerplate:
- No user accounts, no sign-up.
- No analytics or tracking scripts, no cookies set by this site.
- Browser Geolocation API is used only client-side, to personalize which city's Panchang/sunrise-sunset/muhurta times are shown; coordinates are never transmitted to or stored on a server.
- `localStorage` holds only UI preferences (selected language, saved location, dark/light mode) in the visitor's own browser; this data never leaves the device.
- The Contact Us page embeds a Google Form; submissions are handled by Google and subject to Google's own Privacy Policy — linked out for reference.
- Hosting is via Cloudflare Pages, which may retain standard edge/access logs per Cloudflare's own policies — mentioned briefly, not elaborated (we don't control or access these).
- No sale or sharing of personal data (there is none collected to sell).
- Includes a "Last updated" date and a note that the policy may change; points back to Contact Us for privacy questions.

### `/terms` — Terms & Conditions
- Content (Panchang times, muhurtas, Rashifal, Kundali charts, etc.) is provided "as is" for informational and religious-reference purposes only — not a substitute for professional (legal, medical, financial) advice, and users should independently verify time-critical religious/auspicious-timing decisions.
- Accuracy disclaimer: calculations use the Drik astronomical method and Lahiri Ayanamsha but may contain errors or differ from other panchangs/traditions.
- IP notice: site content, branding, and code are owned by PanchangPath.
- Acceptable use: no scraping, abuse, or attempts to disrupt the service.
- Liability limited to the maximum extent permitted by law.
- Terms may change; continued use constitutes acceptance.
- Governing law: India (general reference, no specific state/city).

### `/contact` — Contact Us
Short intro line (e.g. "Have feedback, found an error, or just want to say hello?") followed by the Google Form embedded via iframe. The given link (`https://forms.gle/Zb7txjEa86AMHMyi6`) is a short link and won't work directly in an iframe `src` — it must first be resolved (by following the redirect) to its full `https://docs.google.com/forms/d/e/.../viewform` form, with `?embedded=true` appended, for a working embed. Iframe sized responsively (fixed height ~1000-1200px is typical for Google Forms embeds, full width up to the page's content max-width).

### `/500` — Server Error
Same visual treatment as `/404` via `ErrorState`: code "500", heading "Something Went Wrong", a generic apology message, "Back to Home" CTA.

## Footer Integration

`Layout.astro`'s footer grid changes from 3 columns (`2fr 1fr 1fr`) to 4 (`2fr 1fr 1fr 1fr`), adding a "Company" column with links to About, Contact, Privacy, Terms. The existing mobile override (`grid-template-columns: 1fr 1fr`) continues to work cleanly with a 4th item (2×2 wrap).

These pages are **not** added to `Header.astro`'s three nav-sync points (desktop dropdown, mobile drawer, `searchItems`) — legal/info pages conventionally live in the footer only, not primary site navigation/search.

## Out of Scope

- No content-collection/Markdown system introduced for these pages (the codebase doesn't use one elsewhere — blog uses `src/lib/blog.ts` data arrays, not `.md` collections). These are plain `.astro` pages with inline prose, consistent with existing conventions.
- No email address is invented or listed anywhere; Contact Us relies solely on the embedded Google Form, per the request.
- No specific jurisdiction/state-level legal detail beyond "India" generally — nothing invented that isn't confirmed.
