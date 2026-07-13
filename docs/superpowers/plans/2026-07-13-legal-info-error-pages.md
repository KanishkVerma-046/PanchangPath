# Legal/Info Pages & Error Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add About Us, Privacy Policy, Terms & Conditions, and Contact Us (with an embedded Google Form) pages, plus a `/500` error page alongside the existing `/404`, and link all four content pages from the site footer.

**Architecture:** Two new shared components — `ErrorState.astro` (code/heading/message/CTA block, used by both `404.astro` and the new `500.astro`) and `StaticPage.astro` (title + optional "last updated" date + prose slot, used by About/Privacy/Terms/Contact) — keep the five new/changed pages visually consistent without copy-pasting inline styles, following the codebase's existing shared-component pattern (e.g. `DevotionalDetail.astro`).

**Tech Stack:** Astro v7 (`output: 'static'`), Tailwind v4 (`@theme` CSS custom properties in `src/styles/global.css`), TypeScript, deployed to Cloudflare Pages.

## Global Constraints

- No test framework exists in this repo (no vitest/jest — see `package.json`); the project's real correctness gate is `npm run build` succeeding. Every task below verifies via a build + a check of the generated `dist/` output, not unit tests.
- No analytics, cookies, or accounts exist anywhere in the codebase, and none should be introduced — Privacy Policy content must describe only what's actually true (Geolocation API client-side only, `localStorage` for UI prefs only, Google Form on Contact page, Cloudflare Pages hosting).
- Terms & Conditions governing law: India (general reference only, no specific state/city named).
- Do not add the new pages to `Header.astro`'s three nav-sync points (desktop dropdown, mobile drawer, `searchItems`) — these are footer-only pages per the approved design.
- No content-collections/Markdown system — plain `.astro` pages with inline prose, matching how `src/pages/festivals.astro`, `muhurta.astro`, etc. are written (data in `.astro` files or `src/lib/*.ts`, not `.md`).
- No email address invented anywhere — Contact Us relies solely on the embedded Google Form.
- Design tokens to reuse (from `src/styles/global.css`): `--color-ink`, `--color-body-text`, `--color-mute`, `--color-hairline`, `--color-canvas`, `--color-saffron-deep`; utility classes `.container`, `.caption-mono`, `.btn-primary`, `.divider`.
- The resolved Google Form embed URL is `https://docs.google.com/forms/d/e/1FAIpQLSddXjUtNJUJKhjFPAwOKBqzHYHvMWIkvO5YWrXnG6w_GlY20w/viewform?embedded=true` (resolved via `curl -IL` from the given `https://forms.gle/Zb7txjEa86AMHMyi6` short link — the short link itself does not work as an iframe `src`).

---

## File Structure

- Create: `src/components/ErrorState.astro` — shared code/heading/message/CTA block for error pages.
- Modify: `src/pages/404.astro` — refactor to use `ErrorState`.
- Create: `src/pages/500.astro` — new error page using `ErrorState`.
- Create: `src/components/StaticPage.astro` — shared title/last-updated/prose-slot wrapper for content pages.
- Create: `src/pages/about.astro`
- Create: `src/pages/privacy.astro`
- Create: `src/pages/terms.astro`
- Create: `src/pages/contact.astro`
- Modify: `src/layouts/Layout.astro` — footer gets a 4th "Company" column.

---

### Task 1: `ErrorState` component + 404 refactor + 500 page

**Files:**
- Create: `src/components/ErrorState.astro`
- Modify: `src/pages/404.astro`
- Create: `src/pages/500.astro`

**Interfaces:**
- Produces: `ErrorState.astro` accepting props `{ code: string; heading: string; message: string }`, rendering the code/heading/message/"Back to Home" block.

- [ ] **Step 1: Create the `ErrorState` component**

Create `src/components/ErrorState.astro`:

```astro
---
interface Props {
  code: string;
  heading: string;
  message: string;
}

const { code, heading, message } = Astro.props;
---

<section style="padding:80px 0;text-align:center;">
  <div class="container">
    <p class="caption-mono" style="color:var(--color-mute);margin:0 0 12px;">{code}</p>
    <h1 style="font-size:28px;font-weight:600;letter-spacing:-1px;color:var(--color-ink);margin:0 0 12px;">{heading}</h1>
    <p style="font-size:15px;color:var(--color-body-text);margin:0 0 28px;">{message}</p>
    <a href="/" class="btn-primary" style="display:inline-block;padding:10px 24px;text-decoration:none;">Back to Home</a>
  </div>
</section>
```

- [ ] **Step 2: Refactor `404.astro` to use it**

Replace the full contents of `src/pages/404.astro` with:

```astro
---
import Layout from '../layouts/Layout.astro';
import ErrorState from '../components/ErrorState.astro';
---

<Layout title="Page Not Found — PanchangPath" description="The page you're looking for doesn't exist. Explore Panchang, Jyotish calculators, Muhurta tools and more on PanchangPath.">
  <ErrorState code="404" heading="Page Not Found" message="The page you're looking for doesn't exist or has moved." />
</Layout>
```

- [ ] **Step 3: Create the 500 page**

Create `src/pages/500.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import ErrorState from '../components/ErrorState.astro';
---

<Layout title="Something Went Wrong — PanchangPath" description="Something went wrong on our end. Head back to the PanchangPath homepage and try again.">
  <ErrorState code="500" heading="Something Went Wrong" message="An unexpected error occurred on our end. Please try again, or head back to the homepage." />
</Layout>
```

- [ ] **Step 4: Build and verify both error pages render correctly**

Run: `npm run build`
Expected: build succeeds with no errors.

Then check the generated output:

```bash
grep -o "Page Not Found" dist/404.html
grep -rl "Something Went Wrong" dist/
```

Expected: the first command prints `Page Not Found` (confirms `404.astro`'s refactor didn't change its rendered output — Astro always builds this to a flat `dist/404.html`). The second prints a path under `dist/` containing that text — Astro may build `500.astro` to either a flat `dist/500.html` or `dist/500/index.html` depending on version/config; either is correct, just confirm exactly one matching file exists (`grep -rl ... dist/ | wc -l` should be `1`).

- [ ] **Step 5: Commit**

```bash
git add src/components/ErrorState.astro src/pages/404.astro src/pages/500.astro
git commit -m "Add shared ErrorState component, refactor 404, add 500 page"
```

---

### Task 2: `StaticPage` component + About Us page

**Files:**
- Create: `src/components/StaticPage.astro`
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `StaticPage.astro` accepting props `{ title: string; lastUpdated?: string }` with a default `<slot />` for prose body content; used by Tasks 3, 4, and 5.

- [ ] **Step 1: Create the `StaticPage` component**

Create `src/components/StaticPage.astro`:

```astro
---
interface Props {
  title: string;
  lastUpdated?: string;
}

const { title, lastUpdated } = Astro.props;
---

<section style="padding:56px 0 24px;border-bottom:1px solid var(--color-hairline);">
  <div class="container" style="max-width:760px;">
    <h1 style="font-size:32px;font-weight:700;letter-spacing:-1px;color:var(--color-ink);margin:0 0 8px;">{title}</h1>
    {lastUpdated && (
      <p class="caption-mono" style="color:var(--color-mute);margin:0;">Last updated: {lastUpdated}</p>
    )}
  </div>
</section>

<div class="container" style="max-width:760px;padding-top:32px;padding-bottom:64px;">
  <div class="static-article">
    <slot />
  </div>
</div>

<style>
  .static-article { font-size: 15px; line-height: 1.8; color: var(--color-body-text); }
  .static-article :global(h2) { font-size: 20px; font-weight: 700; color: var(--color-ink); margin: 32px 0 12px; }
  .static-article :global(h2:first-of-type) { margin-top: 0; }
  .static-article :global(p) { margin: 0 0 16px; }
  .static-article :global(ul), .static-article :global(ol) { margin: 0 0 16px; padding-left: 22px; }
  .static-article :global(li) { margin-bottom: 6px; }
  .static-article :global(a) { color: var(--color-saffron-deep); }
</style>
```

- [ ] **Step 2: Create the About Us page**

Create `src/pages/about.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import StaticPage from '../components/StaticPage.astro';
---

<Layout title="About Us — PanchangPath" description="Learn about PanchangPath — an independent, ad-free Hindu Panchang built on Drik astronomical calculations and Lahiri Ayanamsha.">
  <StaticPage title="About PanchangPath">
    <p>PanchangPath is an independent, ad-free Hindu Panchang built for people who want accurate Tithi, Nakshatra, Yoga, Karana, Rahu Kalam and Muhurta timings without wading through pop-ups, autoplay videos, or a dozen ad networks to find them.</p>
    <p>Every calculation on this site uses the Drik (astronomical) method with Lahiri Ayanamsha — the same observational approach used by most modern Panchang authorities — rather than older tabular (Vakya) methods. Sunrise, sunset, planetary positions, and festival dates are computed directly from orbital mechanics rather than looked up from a fixed almanac, so they stay accurate for any date and any location worldwide.</p>
    <p>Beyond the daily Panchang, PanchangPath includes a live Kundali (birth chart) generator, a full festival and vrat calendar, Rashifal (daily horoscope) predictions for all twelve rashis, a set of Muhurta timing tools for choosing auspicious moments, and a library of devotional texts — aartis, chalisas, stotras, and more.</p>
    <p>This is a work in progress, built and maintained by one person. If you spot an error or have a suggestion, the <a href="/contact">Contact Us</a> page is the fastest way to reach out.</p>
  </StaticPage>
</Layout>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: build succeeds.

```bash
grep -o "About PanchangPath" dist/about/index.html
```

Expected: prints the matched string once.

- [ ] **Step 4: Commit**

```bash
git add src/components/StaticPage.astro src/pages/about.astro
git commit -m "Add shared StaticPage component and About Us page"
```

---

### Task 3: Privacy Policy page

**Files:**
- Create: `src/pages/privacy.astro`

**Interfaces:**
- Consumes: `StaticPage.astro` from Task 2 (`{ title: string; lastUpdated?: string }` props, default slot).

- [ ] **Step 1: Create the Privacy Policy page**

Create `src/pages/privacy.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import StaticPage from '../components/StaticPage.astro';
---

<Layout title="Privacy Policy — PanchangPath" description="PanchangPath's Privacy Policy — no accounts, no cookies, no tracking. Learn how location and local storage are used.">
  <StaticPage title="Privacy Policy" lastUpdated="13 July 2026">
    <h2>The short version</h2>
    <p>PanchangPath does not require an account, does not use cookies, and does not run any analytics or advertising scripts. This page explains, in plain terms, the very little data your browser handles while using the site.</p>

    <h2>Location &amp; Geolocation</h2>
    <p>If you allow it, your browser's Geolocation API is used to detect your approximate coordinates so the Panchang, sunrise/sunset, and Muhurta times shown match your city. This happens entirely in your browser — your coordinates are never transmitted to, logged by, or stored on any PanchangPath server. You can decline the location prompt at any time and manually pick a city instead.</p>

    <h2>Local Storage</h2>
    <p>Your browser's local storage is used to remember a few preferences — your selected language, your last-chosen location, and whether you prefer dark or light mode. This information stays on your own device and is never sent anywhere.</p>

    <h2>Contact Form</h2>
    <p>The <a href="/contact">Contact Us</a> page embeds a Google Form. Anything you submit through it is received and processed by Google, not by a PanchangPath server, and is subject to Google's own Privacy Policy.</p>

    <h2>Hosting &amp; Server Logs</h2>
    <p>PanchangPath is hosted on Cloudflare Pages. Like virtually all web hosts, Cloudflare's infrastructure may retain standard access logs (e.g. IP address, request time) as part of routine network operation and security. PanchangPath itself does not access, analyze, or store these logs separately.</p>

    <h2>No Ads, No Tracking</h2>
    <p>There are no advertising networks, no third-party analytics, and no tracking pixels anywhere on this site. There is no personal data collected here to sell, share, or misuse.</p>

    <h2>Changes to This Policy</h2>
    <p>This policy may be updated occasionally as the site evolves. The date at the top of this page reflects the most recent revision. If you have questions about this policy, please reach out via the <a href="/contact">Contact Us</a> page.</p>
  </StaticPage>
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds.

```bash
grep -o "Privacy Policy" dist/privacy/index.html | head -1
grep -c "<h2" dist/privacy/index.html
```

Expected: first command prints `Privacy Policy`; second prints `7` (one `<h2>` per section above).

- [ ] **Step 3: Commit**

```bash
git add src/pages/privacy.astro
git commit -m "Add Privacy Policy page"
```

---

### Task 4: Terms & Conditions page

**Files:**
- Create: `src/pages/terms.astro`

**Interfaces:**
- Consumes: `StaticPage.astro` from Task 2 (same props as Task 3).

- [ ] **Step 1: Create the Terms & Conditions page**

Create `src/pages/terms.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import StaticPage from '../components/StaticPage.astro';
---

<Layout title="Terms & Conditions — PanchangPath" description="Terms & Conditions for using PanchangPath's Panchang, Muhurta, Rashifal and Jyotish tools.">
  <StaticPage title="Terms &amp; Conditions" lastUpdated="13 July 2026">
    <h2>Acceptance of Terms</h2>
    <p>By using PanchangPath, you agree to these Terms &amp; Conditions. If you don't agree, please don't use the site.</p>

    <h2>Nature of the Content</h2>
    <p>Panchang timings, Muhurtas, Rashifal predictions, Kundali charts, and all other astrological/astronomical content on this site are provided for informational and religious-reference purposes only. They are not a substitute for professional legal, medical, financial, or other expert advice, and should not be the sole basis for decisions with serious consequences.</p>

    <h2>Accuracy</h2>
    <p>Calculations use the Drik astronomical method with Lahiri Ayanamsha and are computed to be as accurate as possible, but astronomical calculations, regional conventions, and traditional practices can vary. For time-critical religious or auspicious-timing decisions, please verify independently with a local pandit or trusted regional authority.</p>

    <h2>Intellectual Property</h2>
    <p>The PanchangPath name, design, and underlying code are the property of PanchangPath. Content may be shared or referenced with attribution; wholesale republishing or scraping of this site's content or data is not permitted.</p>

    <h2>Acceptable Use</h2>
    <p>Please don't attempt to scrape, abuse, overload, or disrupt PanchangPath's services, or use them for any unlawful purpose.</p>

    <h2>Third-Party Links &amp; Services</h2>
    <p>This site may link to or embed third-party services (such as the Google Form on the Contact Us page). PanchangPath is not responsible for the content, policies, or practices of any third-party service.</p>

    <h2>Limitation of Liability</h2>
    <p>PanchangPath is provided "as is," without warranties of any kind. To the maximum extent permitted by law, PanchangPath is not liable for any damages or losses arising from use of, or inability to use, this site.</p>

    <h2>Changes to These Terms</h2>
    <p>These Terms may be updated from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised Terms.</p>

    <h2>Governing Law</h2>
    <p>These Terms are governed by the laws of India, without regard to conflict-of-law principles.</p>
  </StaticPage>
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds.

```bash
grep -o "Governing Law" dist/terms/index.html
grep -c "<h2" dist/terms/index.html
```

Expected: first command prints `Governing Law`; second prints `9`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/terms.astro
git commit -m "Add Terms & Conditions page"
```

---

### Task 5: Contact Us page

**Files:**
- Create: `src/pages/contact.astro`

**Interfaces:**
- Consumes: `StaticPage.astro` from Task 2 (same props; no `lastUpdated` this time).

- [ ] **Step 1: Create the Contact Us page**

Create `src/pages/contact.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import StaticPage from '../components/StaticPage.astro';
---

<Layout title="Contact Us — PanchangPath" description="Get in touch with PanchangPath — share feedback, report an error, or ask a question.">
  <StaticPage title="Contact Us">
    <p>Have feedback, spotted an error in a calculation, or just want to say hello? Fill out the form below and it'll come straight through.</p>
    <div style="margin-top:24px;">
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSddXjUtNJUJKhjFPAwOKBqzHYHvMWIkvO5YWrXnG6w_GlY20w/viewform?embedded=true"
        width="100%"
        height="1200"
        style="border:1px solid var(--color-hairline);border-radius:8px;max-width:100%;"
        loading="lazy"
      >Loading…</iframe>
    </div>
  </StaticPage>
</Layout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds.

```bash
grep -o "docs.google.com/forms/d/e/1FAIpQLSddXjUtNJUJKhjFPAwOKBqzHYHvMWIkvO5YWrXnG6w_GlY20w" dist/contact/index.html
```

Expected: prints the matched form ID string once, confirming the iframe embed made it into the build.

- [ ] **Step 3: Commit**

```bash
git add src/pages/contact.astro
git commit -m "Add Contact Us page with embedded Google Form"
```

---

### Task 6: Footer "Company" column

**Files:**
- Modify: `src/layouts/Layout.astro:95-137`

**Interfaces:**
- Consumes: routes `/about`, `/contact`, `/privacy`, `/terms` (all created in Tasks 2–5) — this task must run last.

- [ ] **Step 1: Widen the footer grid to 4 columns**

In `src/layouts/Layout.astro`, change:

```astro
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;margin-bottom:40px;">
```

to:

```astro
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;">
```

- [ ] **Step 2: Add the Company column**

In the same file, immediately after the closing `</div>` of the "Jyotish" column block (right before the `<div class="divider"></div>` line), insert a new column:

```astro
        <div>
          <p class="caption-mono" style="color:var(--color-mute);margin:0 0 12px;">Company</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <a href="/about" style="color:var(--color-body-text);font-size:14px;text-decoration:none;">About Us</a>
            <a href="/contact" style="color:var(--color-body-text);font-size:14px;text-decoration:none;">Contact Us</a>
            <a href="/privacy" style="color:var(--color-body-text);font-size:14px;text-decoration:none;">Privacy Policy</a>
            <a href="/terms" style="color:var(--color-body-text);font-size:14px;text-decoration:none;">Terms &amp; Conditions</a>
          </div>
        </div>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: build succeeds.

```bash
grep -o 'href="/about"' dist/index.html
grep -o 'href="/contact"' dist/index.html
grep -o 'href="/privacy"' dist/index.html
grep -o 'href="/terms"' dist/index.html
```

Expected: each command prints its matched string once, confirming all four footer links are present on the homepage.

- [ ] **Step 4: Start the dev server and manually click through all 6 new/changed routes**

```bash
astro dev --background
```

Then visit each of the following in a browser and confirm it renders without errors and (for the footer-linked ones) the footer's new "Company" column links work: `/about`, `/privacy`, `/terms`, `/contact` (confirm the Google Form actually loads inside the iframe), `/404` (any nonexistent URL), `/500`.

Stop the dev server when done: `astro dev stop`

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "Add Company footer column linking About/Contact/Privacy/Terms"
```
