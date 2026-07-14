function extractByClass(source, className) {
  const regex = new RegExp(`<a\\s+href="([^"]+)"\\s+class="${className}\\b`, 'g');
  const set = new Set();
  let m;
  while ((m = regex.exec(source))) set.add(normalizeUrl(m[1]));
  return set;
}

function extractSearchItems(source) {
  const set = new Set();
  const match = source.match(/const searchItems = \[([\s\S]*?)\n\s*\];/);
  if (!match) return set;
  const itemRegex = /url:\s*"([^"]+)"/g;
  let m;
  while ((m = itemRegex.exec(match[1]))) set.add(normalizeUrl(m[1]));
  return set;
}

function normalizeUrl(url) {
  return url.split('?')[0].split('#')[0];
}

export function extractNavLinks(source) {
  return {
    desktop: extractByClass(source, 'dd-link'),
    drawer: extractByClass(source, 'drawer-link'),
    search: extractSearchItems(source),
  };
}

export function diffNavSets({ desktop, drawer, search }) {
  const all = new Set([...desktop, ...drawer, ...search]);
  const diffs = [];
  for (const url of all) {
    const inDesktop = desktop.has(url);
    const inDrawer = drawer.has(url);
    const inSearch = search.has(url);
    if (!(inDesktop && inDrawer && inSearch)) {
      diffs.push({ url, inDesktop, inDrawer, inSearch });
    }
  }
  return diffs.sort((a, b) => a.url.localeCompare(b.url));
}
