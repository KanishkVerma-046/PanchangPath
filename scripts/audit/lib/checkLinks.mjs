export function extractInternalLinks(html, origin) {
  const hrefRegex = /<a\s[^>]*href="([^"]+)"/g;
  const links = [];
  let m;
  while ((m = hrefRegex.exec(html))) {
    const href = m[1];
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    ) {
      continue;
    }
    let path;
    if (href.startsWith(origin)) {
      path = href.slice(origin.length);
    } else if (href.startsWith('http://') || href.startsWith('https://')) {
      continue;
    } else {
      path = href;
    }
    path = path.split('?')[0].split('#')[0];
    if (!path.startsWith('/')) path = '/' + path;
    links.push(path);
  }
  return links;
}

export function findBrokenLinks(links, knownRoutes) {
  const normalizedKnown = new Set(Array.from(knownRoutes).map(normalizeForCompare));
  return links.filter((link) => !normalizedKnown.has(normalizeForCompare(link)));
}

function normalizeForCompare(route) {
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(route);
  if (hasExtension || route === '') return route;
  return route.endsWith('/') ? route : route + '/';
}
