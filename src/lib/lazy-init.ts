// Defers a widget's DOM-mutating init work until it's about to scroll into
// view, instead of running synchronously on page load. Added because a mobile
// perf audit found the homepage's ~7 independently-initializing widgets each
// forcing a full-page relayout (over 1,500 layout objects) on load — see
// project memory / session notes for the trace evidence. rootMargin starts
// the work slightly before the widget is actually visible so there's no
// perceptible delay when the user scrolls to it.
export function onVisible(el: Element | null, callback: () => void, rootMargin = '600px 0px'): void {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { callback(); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        io.disconnect();
        callback();
        return;
      }
    }
  }, { rootMargin });
  io.observe(el);
}
