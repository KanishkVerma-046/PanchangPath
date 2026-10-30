// Client-side refresh of every build-time relative date label ("Today", "8 Days", "3 days ago",
// past/upcoming visibility). The prerendered HTML carries the values as of the last build and
// stays the no-JS fallback; this re-derives them from India's current date (ist-date.ts) on
// load, on bfcache restore, when a backgrounded tab becomes visible, and at IST midnight — so
// they are right regardless of when the daily rebuild last ran.
//
// Markup contract (attributes on any element; the date comes from the nearest
// [data-fest-date] ancestor-or-self):
//   data-fest-date="YYYY-MM-DD"   the festival date this element describes
//   data-fest-label="…"           rewrite text: countdown | countdown-or-ago | days | ago | ago-unit.
//                                 Bilingual: direct .en-text/.hi-text children are both rewritten;
//                                 otherwise data-hi/data-en (the site's [data-hi] swap convention).
//   data-fest-show="…"            visible only when: today | tomorrow | later (2+ days) | upcoming (0+)
//   data-fest-today-class="c"     class added only on the festival day
//   data-fest-soon-class="c"      class added only 1-7 days before
//   data-fest-hide-past           hidden (and marked data-fest-past) once the date has passed
//   data-fest-max="N"             on a container: of its direct [data-fest-date] children,
//                                 show the first N not yet past and hide the rest (spares are
//                                 prerendered hidden so a passed entry can be replaced).
// Visibility is toggled with inline `display: none` / '' so stylesheet display values survive.

import { istTodayISO, daysBetweenISO, IST_OFFSET_MS } from './ist-date';
import { formatCountdown, formatCountdownHi } from './festivals';

type RefreshCallback = () => void;

const callbacks: RefreshCallback[] = [];
let initialised = false;

function isHindi(): boolean {
  try { return localStorage.getItem('pp-lang') === 'hi'; } catch { return false; }
}

function setBilingual(el: HTMLElement, en: string, hi: string) {
  const enEl = el.querySelector<HTMLElement>(':scope > .en-text');
  const hiEl = el.querySelector<HTMLElement>(':scope > .hi-text');
  if (enEl || hiEl) {
    if (enEl) enEl.textContent = en;
    if (hiEl) hiEl.textContent = hi;
    return;
  }
  if (el.hasAttribute('data-hi')) {
    el.dataset.en = en;
    el.dataset.hi = hi;
    el.textContent = isHindi() ? hi : en;
    return;
  }
  el.textContent = en;
}

function setShown(el: HTMLElement, shown: boolean) {
  el.style.display = shown ? '' : 'none';
}

function labelText(kind: string, days: number): [string, string] | null {
  switch (kind) {
    case 'countdown':
      return [formatCountdown(days), formatCountdownHi(days)];
    case 'countdown-or-ago':
      return days < 0 ? [`${-days} ${days === -1 ? 'day' : 'days'} ago`, `${-days} दिन पहले`] : [formatCountdown(days), formatCountdownHi(days)];
    case 'days':
      return [String(days), String(days)];
    case 'ago':
      return [String(-days), String(-days)];
    case 'ago-unit':
      return [days === -1 ? 'day ago' : 'days ago', 'दिन पहले'];
    default:
      return null;
  }
}

function showFor(cond: string, days: number): boolean {
  switch (cond) {
    case 'today': return days === 0;
    case 'tomorrow': return days === 1;
    case 'later': return days >= 2;
    case 'upcoming': return days >= 0;
    default: return true;
  }
}

export function refreshFestivalDates(root: ParentNode = document) {
  const today = istTodayISO();
  const daysCache = new Map<string, number>();
  const daysFor = (el: Element): number | null => {
    const iso = el.closest<HTMLElement>('[data-fest-date]')?.dataset.festDate;
    if (!iso) return null;
    let d = daysCache.get(iso);
    if (d === undefined) {
      try { d = daysBetweenISO(today, iso); } catch { return null; }
      daysCache.set(iso, d);
    }
    return d;
  };

  root.querySelectorAll<HTMLElement>('[data-fest-label]').forEach(el => {
    const days = daysFor(el);
    const text = days === null ? null : labelText(el.dataset.festLabel ?? '', days);
    if (text) setBilingual(el, text[0], text[1]);
    // The detail page's Countdown value is coloured by state (saffron today, muted once past).
    if (days !== null && el.dataset.festLabel === 'countdown-or-ago') {
      el.style.color = days === 0 ? 'var(--color-saffron-deep)' : days < 0 ? 'var(--color-mute)' : '';
    }
  });

  root.querySelectorAll<HTMLElement>('[data-fest-show]').forEach(el => {
    const days = daysFor(el);
    if (days !== null) setShown(el, showFor(el.dataset.festShow ?? '', days));
  });

  root.querySelectorAll<HTMLElement>('[data-fest-today-class], [data-fest-soon-class]').forEach(el => {
    const days = daysFor(el);
    if (days === null) return;
    if (el.dataset.festTodayClass) el.classList.toggle(el.dataset.festTodayClass, days === 0);
    if (el.dataset.festSoonClass) el.classList.toggle(el.dataset.festSoonClass, days >= 1 && days <= 7);
  });

  root.querySelectorAll<HTMLElement>('[data-fest-hide-past]').forEach(el => {
    const days = daysFor(el);
    if (days === null) return;
    if (days < 0) {
      el.setAttribute('data-fest-past', '');
      setShown(el, false);
    } else {
      el.removeAttribute('data-fest-past');
    }
  });

  root.querySelectorAll<HTMLElement>('[data-fest-max]').forEach(container => {
    const max = Number(container.dataset.festMax);
    let shown = 0;
    container.querySelectorAll<HTMLElement>(':scope > [data-fest-date]').forEach(item => {
      const days = daysFor(item);
      const show = days !== null && days >= 0 && shown < max;
      if (show) shown++;
      setShown(item, show);
    });
  });

  for (const cb of callbacks) cb();
}

function msUntilNextIstMidnight(): number {
  const istMs = Date.now() + IST_OFFSET_MS;
  return 86_400_000 - (istMs % 86_400_000) + 1000;
}

/**
 * Starts the refresh cycle once per page (safe to call from several components). `onRefresh`
 * runs after every refresh — immediately too, if the first refresh already happened — for page
 * logic that depends on the result (e.g. hiding month headings left empty).
 */
export function initFestivalDates(onRefresh?: RefreshCallback) {
  if (onRefresh) {
    callbacks.push(onRefresh);
    if (initialised) onRefresh();
  }
  if (initialised) return;
  initialised = true;

  refreshFestivalDates();

  let lastDay = istTodayISO();
  const refreshIfNewDay = () => {
    const now = istTodayISO();
    if (now !== lastDay) { lastDay = now; refreshFestivalDates(); }
  };
  window.addEventListener('pageshow', (e: PageTransitionEvent) => {
    if (e.persisted) { lastDay = istTodayISO(); refreshFestivalDates(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshIfNewDay();
  });
  const scheduleMidnight = () => {
    setTimeout(() => { refreshIfNewDay(); scheduleMidnight(); }, msUntilNextIstMidnight());
  };
  scheduleMidnight();
}
