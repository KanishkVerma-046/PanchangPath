// Extracts the outline of ॐ (U+0950) from Tiro Devanagari Hindi (OFL, dev-only —
// see scripts/brand/fonts/) and saves it as normalised path commands in
// scripts/brand/om-glyph.json for build-icons.mjs. The logo SVGs must never
// contain <text>/font-family, so the glyph is shipped as an outlined <path>.
//
//   node scripts/brand/extract-om.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import opentype from 'opentype.js';

const here = dirname(fileURLToPath(import.meta.url));
const fontPath = join(here, 'fonts', 'TiroDevanagariHindi-Regular.ttf');
const buf = readFileSync(fontPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const glyph = font.charToGlyph('ॐ');
if (!glyph || glyph.index === 0 || !glyph.path || glyph.path.commands.length === 0) {
  console.error('U+0950 (ॐ) is missing from', fontPath);
  process.exit(1);
}

// getPath() flips to SVG's y-down space; at fontSize = unitsPerEm one unit = one font unit.
const path = glyph.getPath(0, 0, font.unitsPerEm);
const bb = path.getBoundingBox();
const r = (n) => Math.round(n * 1000) / 1000;
const commands = path.commands.map((c) => {
  const out = { type: c.type };
  for (const k of ['x', 'y', 'x1', 'y1', 'x2', 'y2']) {
    if (k in c) out[k] = r(c[k] - (k.startsWith('x') ? bb.x1 : bb.y1));
  }
  return out;
});

const data = {
  source: 'Tiro Devanagari Hindi Regular (SIL OFL 1.1), github.com/google/fonts ofl/tirodevanagarihindi/',
  codepoint: 'U+0950',
  glyphName: glyph.name ?? null,
  glyphIndex: glyph.index,
  unitsPerEm: font.unitsPerEm,
  // Commands are translated so the glyph's bounding box starts at (0,0), y-down.
  width: r(bb.x2 - bb.x1),
  height: r(bb.y2 - bb.y1),
  commands,
};
writeFileSync(join(here, 'om-glyph.json'), JSON.stringify(data, null, 1) + '\n');
console.log(`U+0950 found: glyph #${glyph.index} (${glyph.name}), ${commands.length} commands, bbox ${data.width} x ${data.height} of ${font.unitsPerEm} upm`);
