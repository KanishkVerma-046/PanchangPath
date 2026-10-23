// Regenerates the "Om Orbit" brand mark: the five master SVGs in
// src/assets/brand/, then every derived favicon/app-icon/logo file in public/.
//
//   node scripts/brand/build-icons.mjs
//
// The ॐ is an outlined path from Tiro Devanagari Hindi (OFL) — extracted once by
// scripts/brand/extract-om.mjs into scripts/brand/om-glyph.json. No master or
// derived file may contain <text> or font-family (favicons and <img> SVGs can't
// load fonts); this script refuses to write one that does.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const brandDir = join(root, 'src', 'assets', 'brand');
const publicDir = join(root, 'public');

const MAROON = '#3A0F05';
const GOLD = '#AA7B18';
const LIGHT_GOLD = '#D9B35F';
const SAFFRON = '#F2833D';
const CREAM = '#FAF5F0';

const glyph = JSON.parse(readFileSync(join(here, 'om-glyph.json'), 'utf8'));
const f = (n) => String(Math.round(n * 100) / 100);

// Om path scaled so its bounding box is `height` tall, bbox centre at (cx, cy).
function omPath(height, cx, cy, fill) {
  const s = height / glyph.height;
  const ox = cx - (glyph.width * s) / 2;
  const oy = cy - height / 2;
  const X = (x) => f(ox + x * s);
  const Y = (y) => f(oy + y * s);
  const d = glyph.commands.map((c) => {
    switch (c.type) {
      case 'M': return `M${X(c.x)} ${Y(c.y)}`;
      case 'L': return `L${X(c.x)} ${Y(c.y)}`;
      case 'Q': return `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
      case 'C': return `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
      case 'Z': return 'Z';
      default: throw new Error(`Unknown path command ${c.type}`);
    }
  }).join('');
  return `<path fill="${fill}" d="${d}"/>`;
}

// 27 nakshatra ticks, radius 78→90 about (100,100), first at 12 o'clock, clockwise.
function tickRing(stroke) {
  const lines = [];
  for (let i = 0; i < 27; i++) {
    const a = (i * 360 / 27) * Math.PI / 180;
    const sx = Math.sin(a), cy = Math.cos(a);
    lines.push(`<line x1="${f(100 + 78 * sx)}" y1="${f(100 - 78 * cy)}" x2="${f(100 + 90 * sx)}" y2="${f(100 - 90 * cy)}"/>`);
  }
  return `<g stroke="${stroke}" stroke-width="4" stroke-linecap="butt">\n${lines.map((l) => '  ' + l).join('\n')}\n</g>`;
}

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n${body}\n</svg>\n`;

// Om bbox centre sits at y=101 rather than 100 to offset the top-heavy chandrabindu.
const darkMarkBody = [
  tickRing(LIGHT_GOLD),
  `<circle cx="100" cy="100" r="64" fill="${LIGHT_GOLD}"/>`,
  omPath(74, 100, 101, MAROON),
].join('\n');

const masters = {
  'logo-mark-light.svg': svg([
    tickRing(MAROON),
    `<circle cx="100" cy="100" r="64" fill="${GOLD}"/>`,
    omPath(74, 100, 101, CREAM),
    `<circle cx="154" cy="35.65" r="8" fill="${SAFFRON}"/>`,
  ].join('\n')),
  'logo-mark-dark.svg': svg(darkMarkBody),
  'logo-mark-header.svg': svg([
    `<circle cx="100" cy="100" r="92" fill="${LIGHT_GOLD}"/>`,
    omPath(110, 100, 101, MAROON),
  ].join('\n')),
  'favicon.svg': svg([
    `<rect width="200" height="200" rx="44" fill="${MAROON}"/>`,
    omPath(150, 100, 100, LIGHT_GOLD),
  ].join('\n')),
  'app-icon.svg': svg([
    `<rect width="200" height="200" fill="${MAROON}"/>`,
    `<g transform="translate(18 18) scale(0.82)">\n${darkMarkBody}\n</g>`,
  ].join('\n')),
};

mkdirSync(brandDir, { recursive: true });
for (const [name, src] of Object.entries(masters)) {
  if (/<text\b|font-family/i.test(src)) throw new Error(`${name} contains <text> or font-family`);
  writeFileSync(join(brandDir, name), src);
}

const render = (src, size) =>
  new Resvg(src, { fitTo: { mode: 'width', value: size } }).render().asPng();

const outputs = [];
const write = (rel, buf) => {
  const p = join(publicDir, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, buf);
  outputs.push(rel);
};

const fav = masters['favicon.svg'];
const app = masters['app-icon.svg'];

write('favicon.svg', fav);
write('favicon-32x32.png', render(fav, 32));
write('favicon-16x16.png', render(fav, 16));
write('favicon.ico', await pngToIco([render(fav, 16), render(fav, 32), render(fav, 48)]));
write('apple-touch-icon.png', render(app, 180));
write('icon-192.png', render(app, 192));
write('icon-512.png', render(app, 512));
write('logo/panchangpath-logo-512.png', render(masters['logo-mark-light.svg'], 512));
for (const name of ['logo-mark-light.svg', 'logo-mark-dark.svg']) {
  mkdirSync(join(publicDir, 'logo'), { recursive: true });
  copyFileSync(join(brandDir, name), join(publicDir, 'logo', name));
  outputs.push(`logo/${name}`);
}

console.log(`Masters: ${Object.keys(masters).map((n) => 'src/assets/brand/' + n).join(', ')}`);
console.log(`Generated: ${outputs.map((n) => 'public/' + n).join(', ')}`);
