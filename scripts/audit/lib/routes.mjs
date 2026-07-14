import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export function enumerateRoutes(distDir) {
  const routes = [];
  walk(distDir, distDir, routes);
  return routes.sort();
}

function walk(dir, root, routes) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, root, routes);
    } else if (entry.endsWith('.html')) {
      routes.push(htmlPathToRoute(relative(root, full)));
    }
  }
}

export function htmlPathToRoute(relPath) {
  const posixPath = relPath.split(sep).join('/');
  if (posixPath === 'index.html') return '/';
  if (posixPath.endsWith('/index.html')) {
    return '/' + posixPath.slice(0, -'index.html'.length);
  }
  return '/' + posixPath.slice(0, -'.html'.length);
}
