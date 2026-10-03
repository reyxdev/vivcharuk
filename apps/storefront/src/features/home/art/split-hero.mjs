// Round 24 G027: splits hero.svg (the source drawing, kept as is) into four layers with the same
// viewBox, stacked in this order in HeroScene:
//   hero-back.svg   sky, mountains, forests, hill        — a picture only (<img>), never live
//   hero-hut.svg    the hut with its chimney smoke        — live: moved on phones, smoke taken by the flock
//   hero-grass.svg  the meadow grass (drawn over the hut) — a picture only
//   hero-firs.svg   the firs of the near hill           — a picture; live only on narrow screens, where the
//                   hut moves in among them and they step aside (costly: every fir is a <use>)
//   hero-front.svg  path, fences, shadows, sheep and shepherd — live: the flock engine reads it
// Each file carries only the <defs> it uses. Run after editing hero.svg:
//   node apps/storefront/src/features/home/art/split-hero.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(dir, 'hero.svg'), 'utf8');

/** Top-level children of an element body: [{ start, end, text }]. The art is svgo output: no comments, no CDATA. */
function children(s, from, to) {
  const out = [];
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  re.lastIndex = from;
  let depth = 0, start = -1, m;
  while ((m = re.exec(s)) && m.index < to) {
    const close = m[1] === '/', self = m[4] === '/';
    if (!close) {
      if (depth === 0) start = m.index;
      if (self) { if (depth === 0) out.push({ start, end: re.lastIndex, text: s.slice(start, re.lastIndex) }); }
      else depth++;
    } else {
      depth--;
      if (depth === 0) out.push({ start, end: re.lastIndex, text: s.slice(start, re.lastIndex) });
    }
  }
  return out;
}

const rootOpen = src.slice(0, src.indexOf('>') + 1);
const top = children(src, rootOpen.length, src.lastIndexOf('</svg>'));
const defsEl = top.find((c) => c.text.startsWith('<defs'));
if (!defsEl) throw new Error('hero.svg: no <defs>');
const defsBody = defsEl.text.slice(defsEl.text.indexOf('>') + 1, defsEl.text.lastIndexOf('</defs>'));
const defs = children(defsBody, 0, defsBody.length).map((d) => ({ ...d, id: /^<[^>]*?\sid="([^"]+)"/.exec(d.text)?.[1] }));
const byId = new Map(defs.filter((d) => d.id).map((d) => [d.id, d]));

const refs = (t) => [...t.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"/g)].map((m) => m[1] ?? m[2]);
function defsFor(text) {
  const need = new Set(), queue = refs(text);
  while (queue.length) {
    const id = queue.pop();
    if (need.has(id) || !byId.has(id)) continue;
    need.add(id); queue.push(...refs(byId.get(id).text));
  }
  // Keep the original order: a gradient may build on another one (href).
  return defs.filter((d) => d.id && need.has(d.id)).map((d) => d.text).join('');
}

const rest = top.filter((c) => c !== defsEl);
const at = (attr) => rest.findIndex((c) => c.text.startsWith('<') && new RegExp(`^<[^>]*\\s${attr}=`).test(c.text));
const iStyle = rest.findIndex((c) => c.text.startsWith('<style'));
const iHut = at('data-hut'), iGrass = at('data-grass'), iFirs = at('data-firs'), iBig = at('data-bigfirs');
if (!(iStyle >= 0 && iStyle < iHut && iHut < iGrass && iGrass < iFirs && iBig === iFirs + 1)) throw new Error('hero.svg: layer order changed (style, hut, grass, firs, bigfirs)');
const hill = rest.find((c) => /^<path[^>]*\sdata-hill=/.test(c.text));

const layers = {
  back: rest.slice(0, iStyle),
  hut: rest.slice(iStyle, iGrass),
  grass: rest.slice(iGrass, iFirs),
  firs: rest.slice(iFirs, iBig + 1),
  front: rest.slice(iBig + 1),
};
if (Object.values(layers).reduce((n, l) => n + l.length, 0) !== rest.length) throw new Error('lost elements');

const open = (name) => rootOpen.replace(' data-land=""', name === 'front' ? ' data-land=""' : '').replace('<svg', `<svg data-layer="${name}"`);
for (const [name, els] of Object.entries(layers)) {
  const body = els.map((c) => c.text).join('');
  // The front layer also carries the hill line (unrendered, in <defs>): the engine seats the hut on it.
  const extra = name === 'front' && hill ? hill.text : '';
  const d = defsFor(body) + extra;
  const out = `${open(name)}${d ? `<defs>${d}</defs>` : ''}${body}</svg>`;
  fs.writeFileSync(path.join(dir, `hero-${name}.svg`), out);
  console.log(`hero-${name}.svg`, out.length, 'bytes,', els.length, 'elements');
}

// The meadow band under the hero continues the path (HeroScene alignPathEdge). Its shapes ship with the
// page script, so the band is drawn at once, before the live layers arrive.
const clip = layers.front.find((c) => /^<g[^>]*\sdata-path-clip=/.test(c.text));
const inner = clip && children(clip.text, clip.text.indexOf('>') + 1, clip.text.length).find((c) => /^<g[^>]*\sdata-path=/.test(c.text));
const t = inner && /^<g[^>]*\stransform="translate\(([-\d.]+)[ ,]([-\d.]+)\)"/.exec(inner.text);
if (!inner || !t) throw new Error('hero.svg: no [data-path] group with a translate()');
const html = inner.text.slice(inner.text.indexOf('>') + 1, inner.text.lastIndexOf('</g>'));
fs.writeFileSync(path.join(dir, '..', 'heroPath.ts'), `// Generated by art/split-hero.mjs from hero.svg — do not edit.\nexport const heroPath = { tx: ${+t[1]}, ty: ${+t[2]}, html: ${JSON.stringify(html)} };\n`);
console.log('heroPath.ts', html.length, 'bytes');
