import { baa, thud } from './heroSound';
/* eslint-disable @typescript-eslint/no-explicit-any */
// Hero flock and shepherd (36 §36.3.6–36.3.7). Plain DOM on the hero SVG; no framework, no library.
export function startFlock(root: HTMLElement, layer: HTMLElement, groundHost: HTMLElement): () => void {
const doc = root.ownerDocument, win = doc.defaultView as Window, NS = 'http://www.w3.org/2000/svg';
const reduce = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
const land0 = root.querySelector<SVGSVGElement>('svg[data-land]');
const vb = land0?.viewBox.baseVal;
const W = vb?.width || 1440, H = vb?.height || 620, TOP = 0;
const BMIN = 544, BMAX = 610;
let XMIN = 70, XMAX = W - 50;
const sym = doc.getElementById('sheepd'), sb = doc.getElementById('shepbody'), ss = doc.getElementById('shepstaff');
if (!sym || !sb || !ss) return () => {};
const K: any[] = [...sym.children];
// The shepherd is drawn in named parts (data-part), so the rig does not depend on how many details
// the drawing has: legs, left arm, torso, head (+ face), hat; the staff symbol holds the staff and the right arm.
const partOf = (root: Element, n: string): Element => root.querySelector('[data-part="' + n + '"]') as Element;
const el = (tag: string, at: Record<string, any>, par?: Element): any => { const e = doc.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
// Round 23 perf: a value is written only when it changed. Every write, even of the same value, costs a style
// recalculation and an SVG relayout; idle sheep keep most of theirs from frame to frame.
const put = (e: any, k: string, v: string) => { const c = e.__vk || (e.__vk = {}); if (c[k] !== v) { c[k] = v; e.setAttribute(k, v); } };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const rot = (R: number, x: number, y: number): [number, number] => { const r = R * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [x * c - y * s, x * s + y * c]; };
const sm = (cur: number, tgt: number, rate: number, dt: number) => cur + (tgt - cur) * (1 - Math.exp(-dt * rate));
const now = () => performance.now();
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// ---------- layers ----------
const uses: any[] = [...root.querySelectorAll('use')];
const sheepUses = uses.filter((u: any) => u.getAttribute('href') === '#sheepd');
const shepUse = uses.find((u: any) => u.getAttribute('href') === '#shepherd');
if (!sheepUses.length || !shepUse) return () => {};
const land: any = sheepUses[0].ownerSVGElement;
// Performance (client, 2026-09-30: «щоб сайт взагалі не лагав… на любому залізі»): the still picture has
// thousands of shapes, and any change inside it makes the browser record all of them again. Everything that
// moves lives in its own light layer on top of it (same viewBox), so the picture is painted once.
groundHost.innerHTML = ''; layer.innerHTML = '';
const groundSvg = el('svg', { width: '100%', height: '100%', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: land.getAttribute('preserveAspectRatio') || 'xMidYMax slice', style: 'position:absolute;inset:0;overflow:visible;pointer-events:none' }, groundHost);
const ground = el('g', { style: 'pointer-events:visiblePainted' }, groundSvg);
const air = el('svg', { width: '100%', height: '100%', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: land.getAttribute('preserveAspectRatio') || 'xMidYMax slice', style: 'position:absolute;inset:0;overflow:visible;pointer-events:none' }, layer);
const defs = el('defs', {}, air);
const fxG = el('g', {}, air);
const airG = el('g', {}, air);
const crook = el('g', { style: 'display:none' }, air);
el('path', { d: 'M13 -6 L78 -236', stroke: '#6B4526', 'stroke-width': 6, 'stroke-linecap': 'round' }, crook);
el('path', { d: 'M13 -6 C 11 8, -9 12, -11 -3 C -12 -12, -5 -17, 1 -13', fill: 'none', stroke: '#6B4526', 'stroke-width': 6, 'stroke-linecap': 'round' }, crook);
el('path', { d: 'M16 -16 L76 -228', stroke: '#A8744A', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, crook);
([[-40, '#C9A96A'], [-48, '#B3261E'], [-56, '#C9A96A'], [-150, '#C9A96A'], [-158, '#B3261E']] as Array<[number, string]>).forEach(([y, c]) => { const x = 13 + 65 * ((y + 6) / -230); el('path', { d: 'M' + (x - 4) + ' ' + y + ' l8 2', stroke: c, 'stroke-width': 4 }, crook); });
const cap = el('rect', { x: -W, y: -200, width: W * 3, height: H + 200, fill: 'transparent', style: 'pointer-events:none;touch-action:none' }, air);
sheepUses.forEach((u: any) => u.style.visibility = 'hidden');
shepUse.style.visibility = 'hidden';
const toLocal = (e: PointerEvent): any => { const p = air.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = air.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; };

// ---------- effects ----------
const parts: any[] = [];
function bubble(x: number, y: number, text: string) {
  const g = el('g', {}, fxG), w = 16 + text.length * 8.5;
  el('rect', { x: -4, y: -34, width: w, height: 28, rx: 14, fill: '#FFFFFF', stroke: '#1F3A2E', 'stroke-width': 1.5 }, g);
  el('path', { d: 'M8 -7 l-6 9 l12 -8', fill: '#FFFFFF', stroke: '#1F3A2E', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
  const t = el('text', { x: w / 2 - 4, y: -15, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: '#1F3A2E', 'font-family': 'Onest, sans-serif' }, g); t.textContent = text;
  parts.push({ el: g, x, y, vx: 0, vy: -28, g: 0, life: 1.2, max: 1.2, rot: 0, vr: 0, fade: 0.3 });
}
function zee(x: number, y: number) {
  const g = el('text', { 'font-size': 16, 'font-weight': 700, fill: '#1F3A2E', 'font-family': 'Onest, sans-serif', opacity: 0.7 }, fxG); g.textContent = 'z';
  parts.push({ el: g, x, y, vx: 14, vy: -22, g: 0, life: 1.8, max: 1.8, rot: 0, vr: 0, fade: 0.6 });
}
function burst(x: number, y: number, s: number, n: number, wool = '#FFFFFF') {
  for (let i = 0; i < n; i++) {
    const tuft = i < 2, e = tuft ? el('circle', { r: 6 * s, fill: wool, stroke: '#1B1712', 'stroke-width': 1.2 }, fxG) : el('path', { d: 'M0 0 q2 -7 0 -14', fill: 'none', stroke: i % 2 ? '#4E9A6A' : '#8DB580', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, fxG);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    parts.push({ el: e, x: x + (Math.random() - 0.5) * 40 * s, y, vx: Math.cos(a) * rnd(90, 180), vy: Math.sin(a) * rnd(140, 250), g: 520, life: 0.7, max: 0.7, rot: 0, vr: rnd(-270, 270) });
  }
}

// ---------- sheep ----------
const HIPS: any[] = [[58, 94], [76, 98], [112, 98], [130, 94]];
const LEGP: any[] = ['M58 94L56 122', 'M76 98L75 124', 'M112 98L113 124', 'M130 94L132 122'];
const HOOF: any[] = ['M51 121h10v6h-10z', 'M70 123h10v6h-10z', 'M108 123h10v6h-10z', 'M127 121h10v6h-10z'];
const scaleAt = (b: number) => lerp(0.68, 0.94, clamp((b - BMIN) / (BMAX - BMIN), 0, 1));
const CHARS: any[] = ['glut', 'cur', 'lazy', 'timid', 'norm', 'glut', 'norm', 'cur', 'lamb', 'timid', 'lazy', 'norm'];
const SPD: Record<string, number> = { glut: 150, cur: 220, lazy: 120, timid: 170, norm: 180, lamb: 210 };
const W8: Record<string, Record<string, number>> = {
  glut: { graze: 6, chew: 2, look: 1, lie: 0.5, shake: 0.5, scratch: 0.5, steps: 1, bleat: 0.3 },
  cur: { graze: 2, chew: 1, look: 5, lie: 0.3, shake: 0.5, scratch: 0.5, steps: 2, bleat: 0.5 },
  lazy: { graze: 2, chew: 2, look: 1, lie: 5, shake: 0.3, scratch: 0.5, steps: 0.3, bleat: 0.2 },
  timid: { graze: 3, chew: 2, look: 3, lie: 0.5, shake: 0.5, scratch: 0.5, steps: 1, bleat: 0.2 },
  norm: { graze: 4, chew: 2, look: 2, lie: 1, shake: 0.7, scratch: 0.7, steps: 1.5, bleat: 0.3 },
  lamb: { graze: 2, chew: 1, look: 2, lie: 1, shake: 0.5, scratch: 0.3, steps: 3, bleat: 0.5 }
};
const flock: any[] = sheepUses.map((u: any, i: number) => {
  const w = +u.getAttribute('width'), h = +u.getAttribute('height');
  // The fleece shade (white, cream or darker) comes from the still picture, so it does not change when the flock wakes.
  const wool = u.style.getPropertyValue('--wool') || '#FFFFFF';
  const g = el('g', { style: (reduce ? 'cursor:pointer' : 'cursor:grab') + ';--wool:' + wool + ';--wool-face:' + (u.style.getPropertyValue('--wool-face') || '#FFFFFF') }, ground);
  const legs = HIPS.map((hp: any, k: any) => { const lg = el('g', {}, g); el('path', { d: LEGP[k], stroke: '#1B1712', 'stroke-width': 6, 'stroke-linecap': 'round' }, lg); el('path', { d: HOOF[k], fill: '#1B1712' }, lg); return lg; });
  K.slice(2, 5).forEach((k: any) => g.appendChild(k.cloneNode(true)));
  const head = el('g', {}, g);
  K.slice(5).forEach((k: any, j: any) => { if (j !== 4 && j !== 6) head.appendChild(k.cloneNode(true)); });
  const happy = el('g', {}, head); happy.appendChild(K[9].cloneNode(true)); happy.appendChild(K[11].cloneNode(true));
  const surp = el('g', { style: 'display:none' }, head);
  el('circle', { cx: 164, cy: 50, r: 3.8, fill: '#1B1712' }, surp); el('circle', { cx: 165.3, cy: 48.7, r: 1.2, fill: '#FFFFFF' }, surp);
  el('ellipse', { cx: 176.5, cy: 67.5, rx: 2.6, ry: 3.3, fill: '#1B1712' }, surp);
  // A tuft of grass in the mouth while grazing and chewing (blades from the mouth corner, one with a flower).
  const grass = el('g', { style: 'display:none' }, head);
  const BLADES = 'M0 0q7 4 11 15M-1 1q3 7 0 17M1 -1q10 0 15 8M0 1q-4 6 -3 13';
  el('path', { d: BLADES, fill: 'none', stroke: '#1B1712', 'stroke-width': 4, 'stroke-linecap': 'round' }, grass);
  el('path', { d: BLADES, fill: 'none', stroke: '#6DB86A', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, grass);
  el('circle', { cx: 16, cy: 7.4, r: 2.3, fill: '#E0B33A', stroke: '#1B1712', 'stroke-width': 0.7 }, grass);
  const ch = CHARS[i % CHARS.length];
  const a: any = {
    i, g, wool, legs, head, grass, bite: 0, happy, surp, ch, lamb: ch === 'lamb', x: +u.getAttribute('x') + 95 * w / 190, b: clamp(TOP + +u.getAttribute('y') + 127 * h / 130, BMIN, BMAX),
    vx: 0, vb: 0, f: 1, fd: 1, mode: 'ground', act: 'graze', actT: 0, actDur: rnd(1, 6), hr: 20, hrT: 20, ls: 1, lsT: 1, sy: 1, R: 0, Rv: 0, la: [0, 0, 0, 0],
    phase: rnd(0, 6), face: 'happy', sway: 0, cx: 0, cy: 0, s: 1, spd: (SPD[ch] ?? 180) * rnd(0.9, 1.1), react: ch === 'lazy' ? 0.8 : ch === 'cur' ? 0 : rnd(0.05, 0.3),
    settler: ch === 'glut' || ch === 'lazy' || Math.random() < 0.3, back: null, scat: null, wake: rnd(0, 6)
  };
  if (a.lamb) { a.head.setAttribute('data-lamb', '1'); }
  g.addEventListener('pointerdown', (e: any) => down(e, { kind: 'sheep', a }));
  return a;
});
flock.forEach((a: any) => { if (a.lamb) { let best = null, bd = 1e9; flock.forEach((o: any) => { if (!o.lamb) { const d = Math.abs(o.x - a.x) + Math.abs(o.b - a.b); if (d < bd) { bd = d; best = o; } } }); a.mom = best; } });
const sS = (a: any) => scaleAt(a.b) * (a.lamb ? 0.58 : 1);
function setFace(a: any, f: string) { if (a.face === f) return; a.face = f; a.happy.style.display = f === 'happy' ? '' : 'none'; a.surp.style.display = f === 'surp' ? '' : 'none'; }
function drawSheep(a: any) {
  const legY = 94 + 33 * a.ls, fd = a.fd;
  let tr;
  if (a.mode === 'ground' || a.mode === 'land') {
    const S = sS(a), lift = a.lift || 0;
    tr = 'translate(' + (a.x).toFixed(1) + ',' + (a.b - lift).toFixed(1) + ') rotate(' + a.R.toFixed(2) + ') scale(' + (S * fd).toFixed(3) + ',' + (S * a.sy).toFixed(3) + ') translate(-95,' + (-legY).toFixed(1) + ')';
  } else {
    tr = 'translate(' + (a.cx + a.sway).toFixed(1) + ',' + a.cy.toFixed(1) + ') rotate(' + a.R.toFixed(2) + ') scale(' + (a.s * fd).toFixed(3) + ',' + (a.s * a.sy).toFixed(3) + ') translate(-92,-70)';
  }
  put(a.g, 'transform', tr);
  a.legs.forEach((lg: any, k: any) => { const [hx, hy] = HIPS[k]; put(lg, 'transform', 'rotate(' + a.la[k].toFixed(1) + ' ' + hx + ' ' + hy + ') translate(' + hx + ' ' + hy + ') scale(1 ' + a.ls.toFixed(3) + ') translate(' + (-hx) + ' ' + (-hy) + ')'); });
  if (a.bite > 0.02) { if (a.grass.style.display) a.grass.style.display = ''; put(a.grass, 'transform', 'translate(177 66) rotate(' + (7 * Math.sin(performance.now() / 1000 * 13 + a.i)).toFixed(1) + ') scale(' + a.bite.toFixed(2) + ')'); }
  else if (a.grass.style.display !== 'none') a.grass.style.display = 'none';
  put(a.head, 'transform', 'rotate(' + a.hr.toFixed(1) + ' 148 58)' + (a.lamb ? ' translate(148 58) scale(1.25) translate(-148 -58)' : ''));
}

// ---------- shepherd ----------
const shG = el('g', {}, ground);
const grp = (par: any, src: Element, skip?: Element) => { const g = el('g', {}, par); [...src.children].forEach((c: any) => { if (c !== skip) g.appendChild(c.cloneNode(true)); }); return g; };
const legL = grp(shG, partOf(sb, 'legL'));
const legR = grp(shG, partOf(sb, 'legR'));
const armL = grp(shG, partOf(sb, 'armL'));
const torso = grp(shG, partOf(sb, 'torso'));
const headSrc = partOf(sb, 'head'), faceSrc = partOf(sb, 'face');
const headG = grp(shG, headSrc, faceSrc);
const fNorm = grp(headG, faceSrc);
const fOh = el('g', { style: 'display:none' }, headG);
el('path', { d: 'M133 104Q141 98 148 103M152 103Q159 98 167 104', fill: 'none', stroke: '#1B1712', 'stroke-width': 3, 'stroke-linecap': 'round' }, fOh);
el('circle', { cx: 141, cy: 116, r: 3.6, fill: '#1B1712' }, fOh); el('circle', { cx: 159, cy: 116, r: 3.6, fill: '#1B1712' }, fOh);
el('ellipse', { cx: 150, cy: 151, rx: 5, ry: 6, fill: '#7A2A22', stroke: '#1B1712', 'stroke-width': 2 }, fOh);
const fDet = el('g', { style: 'display:none' }, headG);
el('path', { d: 'M132 104L147 111M153 111L168 104', fill: 'none', stroke: '#1B1712', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, fDet);
el('circle', { cx: 141, cy: 117, r: 3.2, fill: '#1B1712' }, fDet); el('circle', { cx: 159, cy: 117, r: 3.2, fill: '#1B1712' }, fDet);
el('rect', { x: 140, y: 145, width: 20, height: 8, rx: 2, fill: '#FFFFFF', stroke: '#1B1712', 'stroke-width': 2 }, fDet);
el('path', { d: 'M145 145v8M150 145v8M155 145v8', stroke: '#1B1712', 'stroke-width': 1.2 }, fDet);
const fFrown = el('g', { style: 'display:none' }, headG);
el('path', { d: 'M132 106L147 110M153 110L168 106', fill: 'none', stroke: '#1B1712', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, fFrown);
el('path', { d: 'M136 117Q141 114 146 117M154 117Q159 114 164 117', fill: 'none', stroke: '#1B1712', 'stroke-width': 3, 'stroke-linecap': 'round' }, fFrown);
el('path', { d: 'M142 150Q150 146 158 150', fill: 'none', stroke: '#1B1712', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, fFrown);
const fDizzy = el('g', { style: 'display:none' }, headG);
// Dazed after the fall: spiral eyes and a wobbly mouth.
el('path', { d: 'M141 117m-4 0a4 4 0 1 1 8 0a3 3 0 1 1-6 0a2 2 0 1 1 4 0M159 117m-4 0a4 4 0 1 1 8 0a3 3 0 1 1-6 0a2 2 0 1 1 4 0', fill: 'none', stroke: '#1B1712', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, fDizzy);
el('path', { d: 'M141 148q3-3 6 0t6 0 6 0', fill: 'none', stroke: '#1B1712', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, fDizzy);
const hair = el('path', { d: 'M121 100Q122 84 132 86Q134 72 146 82Q152 68 160 82Q170 72 170 88Q180 86 179 100Q168 92 150 93Q132 92 121 100Z', fill: '#2A1C14', stroke: '#1B1712', 'stroke-width': 2, style: 'display:none' }, headG);
const hatG = grp(shG, partOf(sb, 'hat'));
hatG.style.cursor = reduce ? '' : 'grab'; hatG.style.pointerEvents = reduce ? 'none' : 'visiblePainted';
const armR = el('g', {}, shG);
const staffIn = grp(armR, partOf(ss, 'staff'));
[...partOf(ss, 'armR').children].forEach((c: any) => armR.appendChild(c.cloneNode(true)));
const staffG = grp(ground, partOf(ss, 'staff')); staffG.style.display = 'none';
shG.style.pointerEvents = 'none';
const S0 = +shepUse.getAttribute('width') / 300;
let HOME = +shepUse.getAttribute('x') + 150 * S0; const BASE = TOP + +shepUse.getAttribute('y') + 506 * S0;
const sh: any = {
  mode: 'stand', t: 0, x: HOME, b: BASE, R: 0, Rv: 0, anc: [150, 506], aw: [HOME, BASE], hat: [0, 0], hatR: 0, aL: 0, aR: 0, lL: 0, lR: 0, legS: 1, hR: 0,
  face: 'norm', hairOn: false, armsFront: false, lifts: [], guard: 0, staffOut: false, pressure: 0, said: false, ohT: 0, px: 0, py: 0, vxs: 0, hist: []
};
const HAT_ANCHOR: [number, number] = [150, 70];
// The fall (client, 2026-09-30: «більш детальні анімації коли він падає від овець»): the hat flies off,
// tumbles and lands on the grass; he lies dazed under circling stars, gets up through a crouch, dusts
// himself off, reaches for the hat, puts it back, shoos the sheep and goes for his staff.
const stars = el('g', { style: 'display:none' }, airG);
// While he cradles a sheep, copies of his arms are drawn above it, so his hands hold it from the front.
const armsFront = el('g', { style: 'display:none' }, airG);
function showArmsFront(on: boolean) {
  if (!on) { armsFront.style.display = 'none'; return; }
  if (armsFront.style.display === 'none') {
    armsFront.innerHTML = ''; armsFront.appendChild(armL.cloneNode(true)); const r = armR.cloneNode(true) as any; armsFront.appendChild(r);
    airG.appendChild(armsFront); armsFront.style.display = '';
  }
  armsFront.setAttribute('transform', shG.getAttribute('transform') || '');
  (armsFront.children[0] as any).setAttribute('transform', armL.getAttribute('transform') || '');
  (armsFront.children[1] as any).setAttribute('transform', armR.getAttribute('transform') || '');
}
for (let i = 0; i < 3; i++) el('path', { d: 'M0 -6L1.8 -1.8L6 0L1.8 1.8L0 6L-1.8 1.8L-6 0L-1.8 -1.8Z', fill: '#E0B33A', stroke: '#1B1712', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, stars);
function launchHat(dir: number) {
  const w = shWorld(HAT_ANCHOR[0], HAT_ANCHOR[1]);
  sh.hatW = { x: w[0], y: w[1], vx: dir * 110, vy: -480, r: sh.R + sh.hatR, vr: dir * 620, land: false, back: null };
}
const shFace = (f: string) => { if (sh.face === f) return; sh.face = f; fNorm.style.display = f === 'norm' ? '' : 'none'; fOh.style.display = f === 'oh' ? '' : 'none'; fDet.style.display = f === 'det' ? '' : 'none'; fFrown.style.display = f === 'frown' ? '' : 'none'; fDizzy.style.display = f === 'dizzy' ? '' : 'none'; };
const setArmsFront = (v: boolean) => { v = false; if (sh.armsFront === v) return; sh.armsFront = v; if (v) { shG.appendChild(armL); shG.appendChild(armR); } else { shG.insertBefore(armL, torso); shG.appendChild(armR); } };
const shWorld = (lx: number, ly: number): [number, number] => { const [ox, oy] = rot(sh.R, (lx - sh.anc[0]) * S0, (ly - sh.anc[1]) * S0); return [sh.aw[0] + ox, sh.aw[1] + oy]; };
const shLocal = (wx: number, wy: number): [number, number] => { const [ox, oy] = rot(-sh.R, (wx - sh.aw[0]) / S0, (wy - sh.aw[1]) / S0); return [sh.anc[0] + ox, sh.anc[1] + oy]; };
function setAnchor(lx: number, ly: number) { const w = shWorld(lx, ly); sh.anc = [lx, ly]; sh.aw = w; }
function drawShep() {
  if (sh.mode === 'stand' || sh.onGround) { sh.aw = [sh.x, sh.b]; sh.anc = [150, 506 - (1 - sh.legS) * 174]; }
  put(shG, 'transform', 'translate(' + sh.aw[0].toFixed(1) + ',' + sh.aw[1].toFixed(1) + ') rotate(' + sh.R.toFixed(2) + ') scale(' + S0 + ') translate(' + (-sh.anc[0]).toFixed(1) + ',' + (-sh.anc[1]).toFixed(1) + ')');
  const leg = (g: any, a: number, hx: number) => put(g, 'transform', 'rotate(' + a.toFixed(1) + ' ' + hx + ' 332) translate(' + hx + ' 332) scale(1 ' + sh.legS.toFixed(3) + ') translate(' + (-hx) + ' -332)');
  leg(legL, sh.lL, 130); leg(legR, sh.lR, 170);
  put(armL, 'transform', 'rotate(' + sh.aL.toFixed(1) + ' 106 182)');
  put(armR, 'transform', 'rotate(' + sh.aR.toFixed(1) + ' 196 178)');
  put(headG, 'transform', 'rotate(' + sh.hR.toFixed(1) + ' 150 160)');
  // A seated hat turns with the head (same neck pivot); a lifted or held hat does not.
  const seat = clamp(1 - Math.hypot(sh.hat[0], sh.hat[1]) / 12, 0, 1);
  put(hatG, 'transform', 'rotate(' + (sh.hR * seat).toFixed(1) + ' 150 160) translate(' + sh.hat[0].toFixed(1) + ' ' + sh.hat[1].toFixed(1) + ') rotate(' + sh.hatR.toFixed(1) + ' 150 75)');
  const hd = sh.hat[1] < -6 || Math.abs(sh.hat[0]) > 6 ? '' : 'none'; if (hair.style.display !== hd) hair.style.display = hd;
}
hatG.addEventListener('pointerdown', (e: any) => down(e, { kind: 'hat' }));

// ---------- ground shadows ----------
// Client, 2026-09-30: every sheep, the shepherd and a thrown hat cast a soft shadow on the grass, a little to
// the left (the sun is on the right). A body in the air leaves its shadow on the ground under it, smaller and
// fainter the higher it is; a shepherd lying down casts a long one; a sheep in his arms shares his.
const shadeG = el('g', { 'pointer-events': 'none' }); groundSvg.insertBefore(shadeG, ground);
land.querySelectorAll('[data-shadow]').forEach((e: any) => { e.style.display = 'none'; });
// A unit ellipse placed and stretched by one transform: changing cx/cy/rx/ry rebuilt its geometry and its
// gradient every frame (round 23 perf); a transform does neither.
const shade = () => el('ellipse', { cx: 0, cy: 0, rx: 1, ry: 1, fill: 'url(#vk-ground-shadow)' }, shadeG);
flock.forEach((a: any) => { a.shade = shade(); });
const shepShade = shade(), hatShade = shade();
function putShade(e: any, x: number, y: number, rx: number, ry: number, up: number) {
  const k = clamp(1 - up / 420, 0.25, 1);
  put(e, 'transform', 'translate(' + (x - rx * 0.08).toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + (rx * (0.55 + 0.45 * k)).toFixed(1) + ' ' + (ry * (0.55 + 0.45 * k)).toFixed(1) + ')');
  put(e, 'fill-opacity', k.toFixed(2));
}
// Shoulders, hips, feet and head of the shepherd, in the drawing's units: their spread on the ground is his shadow.
const SHADE_PTS: Array<[number, number]> = [[96, 506], [204, 506], [150, 332], [106, 182], [196, 178], [150, 100]];
function drawShades() {
  flock.forEach((a: any) => {
    if (a.mode === 'ground' || a.mode === 'land') { const S = sS(a); putShade(a.shade, a.x, a.b, 64 * S, 12 * S, a.lift || 0); }
    else if (a.mode === 'caught') put(a.shade, 'fill-opacity', '0');
    else putShade(a.shade, a.cx + a.sway, a.homeB, 64 * a.s, 12 * a.s, Math.max(0, a.homeB - (a.cy + 57 * a.s)));
  });
  const pts = SHADE_PTS.map(([x, y]) => shWorld(x, y)), xs = pts.map((q) => q[0]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), low = Math.max(...pts.map((q) => q[1]));
  putShade(shepShade, (x0 + x1) / 2, BASE, Math.max((x1 - x0) / 2 + 20 * S0, 78 * S0), 15 * S0, Math.max(0, BASE - low));
  if (sh.hatW) putShade(hatShade, sh.hatW.x, BASE, 30 * S0, 5 * S0, Math.max(0, BASE - 26 * S0 - sh.hatW.y));
  else put(hatShade, 'fill-opacity', '0');
}

// ---------- input ----------
let cursor: any = null, lastMove = now(), stillSince = now(), press: any = null, held: any = null, raf = 0, last = 0;
const inAir = () => flock.some((a: any) => a.mode === 'held' || a.mode === 'cling' || a.mode === 'fall') || ['react', 'jump', 'held', 'cling', 'fall'].includes(sh.mode);
function down(e: PointerEvent, target: any) {
  if (e.button > 0) return;
  e.preventDefault(); e.stopPropagation();
  const p = toLocal(e);
  press = { target, p0: p, t0: now(), touch: e.pointerType === 'touch', started: false, id: e.pointerId };
  cap.style.pointerEvents = 'all'; cap.style.cursor = reduce ? 'pointer' : 'grabbing';
  try { cap.setPointerCapture(e.pointerId); } catch (_) {}
  if (press.touch && !reduce) press.timer = setTimeout(() => { if (press && !press.started) { start(press.p0); if (navigator.vibrate) navigator.vibrate(10); } }, 350);
}
function start(p: any) {
  press.started = true; clearTimeout(press.timer);
  if (press.target.kind === 'sheep') {
    const a = press.target.a;
    if (a.mode === 'ground' || a.mode === 'land') { const S = sS(a); a.s = S; a.cx = a.x; a.cy = a.b - (94 + 33 * a.ls - 70) * S; a.homeB = a.b; }
    a.mode = 'held'; a.t = 0; a.px = p.x; a.py = p.y; a.vxs = 0; a.hist = [[p.x, p.y, now()]]; a.R = 0; a.Rv = 0; a.ls = 1; a.sy = 1; a.lift = 0;
    airG.appendChild(a.g); held = { kind: 'sheep', a }; crook.style.display = ''; cap.style.cursor = 'none'; setFace(a, 'surp');
  } else {
    if (now() < sh.guard || sh.hatW || !['stand', 'walk', 'wobble', 'getup', 'dust', 'hatfix', 'wave', 'hold', 'pickup'].includes(sh.mode)) { press.started = false; press.denied = true; return; }
    sh.from = { aw: sh.aw.slice(), anc: sh.anc.slice(), R: sh.R };
    sh.hat0 = shWorld(HAT_ANCHOR[0], HAT_ANCHOR[1]);
    sh.mode = 'react'; sh.t = 0; sh.px = p.x; sh.py = p.y; sh.vxs = 0; sh.hist = [[p.x, p.y, now()]]; sh.said = false; sh.onGround = true;
    shFace('oh'); airG.appendChild(shG); held = { kind: 'hat' }; cap.style.cursor = 'grabbing';
    const hw = shWorld(150, 40); bubble(hw[0] + 10, hw[1] - 10, 'Ой!');
    if (!sh.staffOut) dropStaff();
    sh.lifts = sh.lifts.filter((t: any) => now() - t < 40000); sh.lifts.push(now());
  }
}
function dropStaff() {
  const bw = shWorld(238, 506);
  sh.staffOut = true; staffIn.style.display = 'none'; staffG.style.display = '';
  sh.staff = { x: bw[0], y: Math.min(bw[1], BASE), a: sh.R, t: 0 };
}
function velOf(h: any[]): [number, number] { const n = h.length - 1; if (n < 1) return [0, 0]; const [x0, y0, t0] = h[0], [x1, y1, t1] = h[n], dt = Math.max(16, t1 - t0) / 1000; return [(x1 - x0) / dt, (y1 - y0) / dt]; }
function endPress(e: any) {
  if (!press) return;
  cap.style.pointerEvents = 'none'; cap.style.cursor = '';
  try { cap.releasePointerCapture(press.id); } catch (_) {}
  clearTimeout(press.timer);
  const tg = press.target;
  if (!press.started) {
    if (e && now() - press.t0 < 450) {
      if (tg.kind === 'sheep' && tg.a.mode === 'ground') { const S = sS(tg.a); bubble(tg.a.x + 70 * S * tg.a.fd, tg.a.b - 110 * S, 'Бе-е!'); }
      if (tg.kind === 'hat' && sh.mode === 'stand') { sh.mode = 'hold'; sh.t = 0; }
    }
    if (press.denied && sh.mode === 'stand') { sh.mode = 'hold'; sh.t = 0; }
  } else if (held) {
    if (held.kind === 'sheep') {
      const a = held.a, [vx] = velOf(a.hist); crook.style.display = 'none';
      if (a.py < TOP) { a.mode = 'cling'; a.t = 0; a.ex = clamp(a.px, 60, W - 60); a.Rs = clamp(a.vxs * 0.03, -30, 30); a.Rsv = 0; }
      else sheepFall(a, vx);
    } else {
      const [vx] = velOf(sh.hist);
      if (sh.mode === 'react' || sh.mode === 'jump') { sh.released = true; }
      else if (sh.py < TOP) { sh.mode = 'cling'; sh.t = 0; sh.ex = clamp(sh.px, 60, W - 60); sh.Rs = clamp(sh.vxs * 0.04, -35, 35); sh.Rsv = 0; }
      else shFall(vx);
    }
    held = null;
  }
  press = null;
}
// Client, 2026-09-30: a sheep dropped onto the shepherd is caught — held like a lamb, set down on the
// grass, a finger wagged at it; dropped onto another sheep, it bounces off to the side while the
// lower one squats, and both shake their heads. No speech bubbles; «бе-е»/«гуп» only with sound on.
function catchOrBounce(a: any): boolean {
  const bottom = a.cy + 57 * a.s;
  if (a.homeB - bottom < 20) return false;
  // 1) the shepherd, standing, is right under it and it has come down to his chest
  if (['stand', 'walk', 'wobble'].includes(sh.mode) && sh.onGround && Math.abs(a.cx + a.sway - sh.x) < 70 * S0 && bottom > sh.b - 330 * S0 && bottom < sh.b - 150 * S0) {
    a.mode = 'caught'; a.t = 0; airG.appendChild(a.g); setFace(a, 'surp');
    sh.mode = 'catch'; sh.t = 0; sh.caught = a; sh.catchDir = a.cx >= sh.x ? 1 : -1; shFace('oh'); baa(1.1);
    if (!sh.staffOut) dropStaff();
    return true;
  }
  // 2) another sheep's back
  if (!a.bounced) {
    const o = flock.find((q: any) => q !== a && q.mode === 'ground' && Math.abs(q.b - a.homeB) < 34 && Math.abs(q.x - (a.cx + a.sway)) < 70 * sS(q) && bottom > q.b - 118 * sS(q) && bottom < q.b - 60 * sS(q));
    if (o) {
      a.bounced = true; const dir = (a.cx + a.sway) >= o.x ? 1 : -1;
      a.mode = 'hop'; a.t = 0; a.homeB = clamp(o.b + rnd(-10, 10), BMIN, BMAX);
      a.hop = { x0: a.cx + a.sway, y0: a.cy, x1: clamp(o.x + dir * 200 * sS(o), XMIN + 40, XMAX - 40), y1: a.homeB - 57 * a.s, hgt: 120 * sS(o), dir };
      o.squashT = 0; burst(o.x, o.b - 100 * sS(o), 0.5, 4, o.wool); thud(); baa(0.95); setTimeout(() => baa(1.2), 180);
      return true;
    }
  }
  return false;
}
function sheepFall(a: any, vx: number) {
  a.bounced = false;
  a.mode = 'fall'; a.t = 0; a.vx = clamp(vx, -900, 900); a.R0 = a.R; a.la0 = a.la.slice();
  const drop = Math.max(0, a.homeB - (a.cy + 57 * a.s));
  a.fallT = 1.6 + 0.6 * clamp(drop / 540, 0, 1); a.vf = Math.max(60, drop / a.fallT);
}
function shFall(vx: number) {
  setAnchor(150, 52);
  sh.mode = 'fall'; sh.t = 0; sh.vx = clamp(vx, -900, 900); sh.R0 = sh.R;
  const feet = sh.aw[1] + 454 * S0, drop = Math.max(0, BASE - feet);
  sh.fallT = 1.0 + 0.4 * clamp(drop / 540, 0, 1); sh.vf = Math.max(90, drop / sh.fallT);
}
cap.addEventListener('pointermove', (e: any) => {
  const p = toLocal(e); cursor = p; lastMove = now();
  if (!press) return;
  if (!press.started) {
    const d = Math.hypot(p.x - press.p0.x, p.y - press.p0.y);
    if (press.touch) { if (d > 8) clearTimeout(press.timer); }
    else if (d > 4 && !reduce && !press.denied) start(p);
    return;
  }
  const o = held && (held.kind === 'sheep' ? held.a : sh);
  if (o) { o.px = clamp(p.x, 20, W - 20); o.py = clamp(p.y, -90, H - 20); const t = now(); o.hist.push([o.px, o.py, t]); while (o.hist.length > 2 && t - o.hist[0][2] > 90) o.hist.shift(); }
});
cap.addEventListener('pointerup', endPress);
cap.addEventListener('pointercancel', endPress);
const onMove = (e: PointerEvent) => { if (press) return; const p = toLocal(e); if (!cursor || Math.hypot(p.x - cursor.x, p.y - cursor.y) > 3) stillSince = now(); cursor = p; lastMove = now(); };
const onLeave = () => { if (!press) cursor = null; };
const onAbort = () => { if (press) endPress(null); };
root.addEventListener('pointermove', onMove);
root.addEventListener('pointerleave', onLeave);
win.addEventListener('wheel', onAbort, { passive: true });
win.addEventListener('blur', onAbort);

// ---------- activities ----------
function pickAct(a: any) {
  const w = W8[a.ch]!, lying = flock.filter((o: any) => o.act === 'lie' && o !== a).length;
  let sum = 0; for (const k in w) sum += w[k]!;
  let r = Math.random() * sum, act = 'graze';
  for (const k in w) { r -= w[k]!; if (r <= 0) { act = k; break; } }
  if (act === 'lie' && lying >= 2) act = 'graze';
  a.act = act; a.actT = 0; a.actDur = act === 'lie' ? rnd(6, 10) : act === 'shake' ? 0.7 : act === 'scratch' ? 1.2 : act === 'bleat' ? 1.5 : rnd(3, 8);
  if (act === 'steps') { a.goal = [clamp(a.x + rnd(20, 40) * (Math.random() < 0.5 ? -1 : 1), XMIN, XMAX), clamp(a.b + rnd(-8, 8), BMIN, BMAX)]; }
  if (act === 'bleat') { const S = sS(a); bubble(a.x + 70 * S * a.fd, a.b - 110 * S, 'Бе-е'); }
  if (act === 'look' && Math.random() < 0.5) a.fT = -Math.sign(a.f || 1);
}

// ---------- main loop ----------
let lookUp = false, zT = 0, hadTgt = false, lastSort = 0; void zT;
// Degradation ladder step 3 (36 §36.5): on a device that cannot keep up (about 24 ms a frame), the flock is
// drawn on every second frame, a steady 30 fps instead of an uneven 20-40; back to every frame once there is
// headroom. Whatever the visitor holds is drawn on every frame, so it never lags behind the pointer.
let skipped = 0, perFrame = 16.7, half = false;
function step(tms: number) {
  raf = win.requestAnimationFrame(step);
  skipped++;
  if (half && skipped < 2 && !held) return;
  const gap = last ? tms - last : 16.7 * skipped;
  perFrame += (gap / skipped - perFrame) * 0.08; skipped = 0;
  if (!half && perFrame > 24) half = true; else if (half && perFrame < 18) half = false;
  const dt = Math.min(half ? 0.05 : 0.033, gap / 1000); last = tms;
  const T = now();
  const cin = !reduce && cursor && cursor.y < H && cursor.x > 0 && cursor.x < W && !held;
  const sleeping = !reduce && T - lastMove > 60000;
  const settled = T - stillSince > 3000;
  const airborne = inAir();
  const shAir = ['react', 'jump', 'held', 'cling', 'fall'].includes(sh.mode);
  const tgt: [number, number] | null = cin ? [clamp(cursor.x, XMIN, XMAX), clamp(cursor.y, BMIN + 2, BMAX - 2)] : null;
  const gs = flock.filter((a: any) => a.mode === 'ground' || a.mode === 'land');
  if (!tgt && hadTgt) gs.forEach((a: any) => { if (a.mode === 'ground') { a.act = 'steps'; a.actT = 0; a.actDur = 8; a.goal = [clamp(a.x + rnd(-110, 110), XMIN, XMAX), clamp(a.b + rnd(-22, 22), BMIN, BMAX)]; } });
  hadTgt = !!tgt;

  // --- sheep on the ground: intent ---
  gs.forEach((a: any) => {
    if (a.mode !== 'ground') return;
    const S = sS(a);
    let goal: any = null, spd = a.spd;
    if (a.scat && T < a.scat.until) { goal = a.scat.p; spd *= 1.2; }
    else if (shAir && (a.ch === 'cur' || a.lamb)) { goal = [clamp(sh.aw[0], XMIN, XMAX), BASE - 20]; }
    else if (a.lamb && a.mom && a.mom.mode === 'ground' && !tgt) { goal = [a.mom.x - a.mom.fd * 45, clamp(a.mom.b + 6, BMIN, BMAX)]; }
    else if (tgt && !sleeping) {
      a.follow = (a.follow || 0) + dt;
      if (a.follow > a.react && !(settled && a.settler)) {
        goal = [tgt[0], tgt[1]];
        if (a.ch === 'timid') { goal[0] += (a.x < tgt[0] ? -1 : 1) * 70; goal[1] = BMIN + 4; }
        if (a.back && T < a.back.until) goal = a.back.p;
        else if (!a.back || T > a.back.until + rnd(1500, 4000)) {
          if (Math.hypot(a.x - tgt[0], a.b - tgt[1]) < 110 && Math.random() < dt * 0.25) { const side = Math.random() < 0.5 ? -1 : 1; a.back = { p: [clamp(tgt[0] + side * 130, XMIN, XMAX), clamp(tgt[1] + rnd(-12, 12), BMIN, BMAX)], until: T + 800 }; }
        }
      }
    } else a.follow = 0;
    a.chasing = !!goal;
    if (goal) {
      const dx = goal[0] - a.x, db = goal[1] - a.b, d = Math.hypot(dx, db * 3);
      const v = spd * clamp(d / 60, 0, 1);
      a.vx = sm(a.vx, d > 1 ? dx / d * v : 0, 6, dt); a.vb = sm(a.vb, d > 1 ? db * 3 / d * v / 3 : 0, 6, dt);
      if (Math.abs(dx) > 40) a.fT = Math.sign(dx);
      if (a.act === 'lie') { a.act = 'chew'; a.actT = 0; a.actDur = 2; }
    } else {
      a.actT += dt;
      if (sleeping) { a.wake -= dt; if (a.wake < 0 && a.act !== 'lie') { a.act = 'lie'; a.actT = 0; a.actDur = 1e9; } }
      else if (a.actT > a.actDur) pickAct(a);
      if (a.act === 'steps' && a.goal) {
        const dx = a.goal[0] - a.x, db = a.goal[1] - a.b, d = Math.hypot(dx, db);
        a.vx = sm(a.vx, d > 2 ? dx / d * 55 : 0, 5, dt); a.vb = sm(a.vb, d > 2 ? db / d * 20 : 0, 5, dt);
        if (Math.abs(dx) > 6) a.fT = Math.sign(dx);
        if (d < 2) { a.act = 'graze'; a.actT = 0; a.actDur = rnd(3, 6); }
      } else { a.vx = sm(a.vx, 0, 6, dt); a.vb = sm(a.vb, 0, 6, dt); }
    }
    if (!sleeping) a.wake = rnd(0, 6);
    a.x += a.vx * dt; a.b += a.vb * dt;
  });
  // --- separation, shepherd obstacle, pressure ---
  let pressure = 0;
  for (let i = 0; i < gs.length; i++) {
    const a = gs[i], Sa = sS(a);
    for (let j = i + 1; j < gs.length; j++) {
      const o = gs[j], So = sS(o), wv = 190 * (Sa + So) / 2 * 0.34;
      const dx = o.x - a.x, db = o.b - a.b, q = (dx / wv) * (dx / wv) + (db / 14) * (db / 14);
      if (q < 1) {
        const d = Math.sqrt(q) || 0.01, push = (1 - d) * 0.5, nx = (dx / wv) / d, nb = (db / 14) / d;
        a.x -= nx * push * wv * 0.6; o.x += nx * push * wv * 0.6; a.b -= nb * push * 14 * 0.6; o.b += nb * push * 14 * 0.6;
      }
    }
    if (sh.onGround && !shAir && sh.mode !== 'fallen') {
      const dx = a.x - sh.x, db = a.b - sh.b, q = (dx / 58) * (dx / 58) + (db / 16) * (db / 16);
      if (q < 1) { const d = Math.sqrt(q); if (d < 0.05) a.x = sh.x + (dx >= 0 ? 58 : -58); else { a.x = sh.x + dx / d; a.b = sh.b + db / d; } }
      if (q < 2.4 && a.chasing && tgt && Math.abs(tgt[0] - sh.x) < 120) pressure++;
    }
    a.x = clamp(a.x, XMIN, XMAX); a.b = clamp(a.b, BMIN, BMAX);
  }
  // --- sheep pose ---
  const anyCursor = cursor && cursor.y < H;
  flock.forEach((a: any) => {
    a.t = (a.t || 0) + dt;
    if (a.mode === 'ground') {
      const S = sS(a), v = Math.hypot(a.vx, a.vb * 3);
      if (a.fT && Math.sign(a.f) !== a.fT) a.f = clamp(a.f + a.fT * dt * 5, -1, 1); else if (a.fT) a.f = a.fT;
      a.fd = Math.sign(a.f || 1) * Math.max(Math.abs(a.f), 0.18);
      const turning = Math.abs(a.f) < 1;
      a.phase += dt * (5 + v / 22);
      const moving = v > 12;
      a.la = a.la.map((_: any, k: any) => moving ? (k % 2 ? -1 : 1) * Math.min(24, 10 + v / 12) * Math.sin(a.phase) : a.act === 'scratch' && k === 1 ? -60 + 15 * Math.sin(a.t * 28) : 0);
      a.lift = moving && v > 100 ? Math.abs(Math.sin(a.phase)) * 5 * S * (a.lamb ? 2 : 1) : 0;
      let hrT = 0;
      if (reduce) hrT = a.i % 3 ? 34 : 0;
      else if (airborne && a.act !== 'lie') hrT = -22;
      else if (moving || a.chasing) {
        if (anyCursor) { const hx = a.x + 70 * S * a.fd, hy = a.b - 90 * S; hrT = clamp(Math.atan2(cursor.y - hy, Math.abs(cursor.x - hx) + 1) * 57.3, -25, 25); } else hrT = 0;
      } else if (a.act === 'graze') hrT = 38 + 4 * Math.sin(a.t * 8);
      else if (a.act === 'chew') hrT = 3 * Math.sin(a.t * 6);
      else if (a.act === 'look') hrT = anyCursor ? clamp(Math.atan2(cursor.y - (a.b - 90 * S), Math.abs(cursor.x - a.x) + 1) * 57.3, -25, 25) : 14 * Math.sin(a.t * 0.9 + a.i);
      else if (a.act === 'lie') hrT = sleeping ? 26 : 8;
      else if (a.act === 'scratch') hrT = -14;
      else if (a.act === 'bleat') hrT = -18;
      // Grass in the mouth (client, 2026-09-30): grazing tugs off a tuft with a small jerk of the head and eats
      // it down, then tugs again; chewing with the head up finishes it; anything else drops what is left.
      if (!reduce && a.act === 'graze' && !moving && !a.chasing && !airborne) {
        const ph = (a.actT * 0.7 + a.i * 0.37) % 1;
        if (ph < 0.15) { a.bite = Math.max(a.bite, ph / 0.15); hrT += 7; } else a.bite = Math.max(0.35, a.bite - dt * 0.55);
      } else if (!reduce && a.act === 'chew' && !moving) a.bite = Math.max(0, a.bite - dt * 0.45);
      else a.bite = Math.max(0, a.bite - dt * 4);
      if (turning) hrT -= 16;
      a.hr = sm(a.hr, hrT, 8, dt);
      a.ls = sm(a.ls, a.act === 'lie' && !a.chasing ? 0.3 : 1, 5, dt);
      a.R = a.act === 'shake' && !a.chasing ? 5 * Math.sin(a.actT * 32) * (1 - a.actT / 0.7) : 0;
      a.sy = 1;
      if (a.squashT !== undefined) {
        a.squashT += dt; const q = a.squashT;
        a.sy = q < 0.4 ? 1 - 0.28 * Math.sin((q / 0.4) * Math.PI) : 1; a.ls = q < 0.4 ? 1 - 0.5 * Math.sin((q / 0.4) * Math.PI) : a.ls;
        if (q > 0.4 && a.act !== 'shake') { a.act = 'shake'; a.actT = 0; a.actDur = 0.7; }
        if (q > 1.1) a.squashT = undefined;
      }
      setFace(a, a.squashT !== undefined && a.squashT < 0.5 ? 'surp' : 'happy');
      if (sleeping && a.act === 'lie') { zT += dt; if (Math.random() < dt * 0.4) zee(a.x + 40 * S * a.fd, a.b - 70 * S); }
    } else if (a.mode === 'held') {
      const [vx] = velOf(a.hist);
      a.vxs = sm(a.vxs, T - a.hist[a.hist.length - 1][2] > 90 ? 0 : vx, 12, dt);
      const tR = clamp(a.vxs * 0.035, -35, 35);
      a.Rv += ((tR - a.R) * 110 - a.Rv * 8) * dt; a.R += a.Rv * dt;
      const [ox, oy] = rot(a.R, 0, 32 * a.s); a.cx = a.px + ox; a.cy = a.py + 4 + oy; a.sway = 0; a.fd = 1; a.f = 1;
      a.la = a.la.map((_: any, k: any) => -a.R * 0.85 + Math.sin(a.t * 7 + k * 1.3) * clamp(Math.abs(a.Rv) / 25, 0, 9) + (k < 2 ? -4 : 4));
      a.hr = -8; crook.setAttribute('transform', 'translate(' + a.px.toFixed(1) + ',' + a.py.toFixed(1) + ')');
    } else if (a.mode === 'cling') {
      a.Rsv += (-a.Rs * 38 - a.Rsv * 1.1) * dt; a.Rs += a.Rsv * dt; a.R = -90 + a.Rs;
      const [ox, oy] = rot(a.R, (92 - 158) * a.s, (70 - 94) * a.s); a.cx = a.ex + ox; a.cy = TOP + 2 + oy;
      a.la = [90 - a.Rs + Math.sin(a.t * 6) * 8, 90 - a.Rs + Math.sin(a.t * 6 + 1) * 8, -90, -90]; a.hr = Math.sin(a.t * 4) * 6;
      if (a.t > 2) sheepFall(a, 0);
    } else if (a.mode === 'fall' && catchOrBounce(a)) {
      // handled: the shepherd caught it, or it bounced off another sheep's back
    } else if (a.mode === 'fall') {
      const k = clamp(a.t / 0.5, 0, 1), ph = a.t * Math.PI * 2 / 1.2;
      a.cy += a.vf * dt * clamp(a.t / 0.3, 0.2, 1);
      a.vx *= Math.exp(-dt * 3); a.cx = clamp(a.cx + a.vx * dt, 60, W - 60);
      a.sway = 14 * Math.sin(ph) * k; a.R = lerp(a.R0, 10 * Math.cos(ph), k);
      a.la = a.la.map((_: any, j: any) => lerp(a.la0[j], -a.R * 0.85 + (j < 2 ? -6 : 6) + Math.sin(a.t * 5 + j) * 5, k));
      a.hr = lerp(a.hr, -4, k);
      if (a.cy + 57 * a.s >= a.homeB) {
        a.x = clamp(a.cx + a.sway, XMIN, XMAX); a.b = a.homeB; a.sway = 0; a.R = 0; a.mode = 'land'; a.t = 0; a.vx = 0; a.vb = 0;
        ground.insertBefore(a.g, ground.firstChild); burst(a.x, a.b, a.s, 7, a.wool); thud();
      }
    } else if (a.mode === 'caught') {
      // Held against his chest like a lamb, rocking a little, legs dangling.
      const c = shWorld(150, 250); a.cx = c[0]; a.cy = c[1]; a.sway = 0; a.fd = sh.catchDir || 1; a.s = sS(a) * 0.82;
      a.R = sh.R + 4 * Math.sin(a.t * 4); a.la = [22, 18, -18, -22].map((v, j) => v + 6 * Math.sin(a.t * 5 + j)); a.hr = -10 + 6 * Math.sin(a.t * 3);
      if (a.t > 0.4) setFace(a, 'happy');
    } else if (a.mode === 'hop') {
      // Bounced off another sheep's back: a springy arc to the side, then a normal landing.
      const k = clamp(a.t / 0.75, 0, 1), h = a.hop;
      a.cx = lerp(h.x0, h.x1, k); a.cy = lerp(h.y0, h.y1, k) - Math.sin(k * Math.PI) * h.hgt; a.sway = 0; a.R = 18 * h.dir * Math.sin(k * Math.PI);
      a.la = [-18, -12, 12, 18]; a.hr = -12;
      if (k >= 1) { a.x = clamp(a.cx, XMIN, XMAX); a.b = a.homeB; a.R = 0; a.mode = 'land'; a.t = 0; a.vx = 0; a.vb = 0; ground.insertBefore(a.g, ground.firstChild); burst(a.x, a.b, a.s * 0.6, 4, a.wool); thud(); a.shakeAfter = true; }
    } else if (a.mode === 'land') {
      const t = a.t;
      a.sy = t < 0.15 ? 1 - 0.12 * Math.sin(Math.PI * t / 0.15) : 1;
      a.ls = t < 0.15 ? lerp(1, 0.45, t / 0.15) : t < 0.75 ? 0.45 : t < 1 ? lerp(0.45, 1, (t - 0.75) / 0.25) : 1;
      a.la = [0, 0, 0, 0];
      a.hr = t > 0.45 && t < 0.75 ? 13 * Math.sin((t - 0.45) * Math.PI * 2 * 5) * (1 - (t - 0.45) / 0.3) : 0;
      a.R = t > 1 && t < 1.3 ? 4 * Math.sin((t - 1) * Math.PI * 2 * 6.5) * (1 - (t - 1) / 0.3) : 0;
      if (t > 0.3) setFace(a, 'happy');
      if (t > 1.3) { a.mode = 'ground'; a.act = a.shakeAfter ? 'shake' : 'chew'; a.actT = 0; a.actDur = a.shakeAfter ? 0.7 : 1; a.follow = 1; a.shakeAfter = false; }
    }
    drawSheep(a);
  });

  // --- shepherd ---
  sh.t += dt;
  if (!shAir && sh.onGround !== false) {
    if (['stand', 'wobble'].includes(sh.mode)) {
      sh.pressure = pressure >= 4 ? sh.pressure + dt : Math.max(0, sh.pressure - dt * 2);
      if (sh.mode === 'stand' && sh.pressure > 0.5) { sh.mode = 'wobble'; sh.t = 0; shFace('oh'); }
      if (sh.mode === 'wobble' && sh.pressure <= 0) { sh.mode = 'stand'; sh.t = 0; }
      if (sh.mode === 'wobble' && sh.t > 2 && pressure >= 4) { sh.mode = 'fallen'; sh.t = 0; sh.R0 = sh.R; launchHat(1); if (!sh.staffOut) dropStaff(); }
    }
  }
  const P = sh.mode, t = sh.t;
  sh.onGround = !['react', 'jump', 'held', 'cling', 'fall'].includes(P);
  if (P === 'stand') { sh.R = sm(sh.R, 0, 10, dt); sh.aL = sm(sh.aL, 0, 8, dt); sh.aR = sm(sh.aR, 0, 8, dt); sh.lL = sm(sh.lL, 0, 8, dt); sh.lR = sm(sh.lR, 0, 8, dt); sh.legS = sm(sh.legS, 1, 8, dt); sh.hat = [sm(sh.hat[0], 0, 10, dt), sm(sh.hat[1], 0, 10, dt)]; sh.hatR = sm(sh.hatR, 0, 10, dt); sh.hR = 3 * Math.sin(T / 1400); if (T > sh.guard) shFace('norm'); setArmsFront(false);
    if (T < sh.guard) { sh.aL = sm(sh.aL, 196, 8, dt); setArmsFront(true); shFace('frown'); }
    if (sh.staffOut && !sh.wantStaff) { sh.mode = 'walk'; sh.t = 0; } }
  else if (P === 'hold') { sh.aL = sm(sh.aL, 196, 12, dt); setArmsFront(true); shFace('frown'); if (t > 0.9) { sh.mode = 'stand'; sh.t = 0; } }
  else if (P === 'wobble') { sh.R = 8 * Math.sin(t * 9); sh.aL = 60 * Math.sin(t * 12); sh.aR = -60 * Math.sin(t * 12 + 1); sh.lL = 7 * Math.sin(t * 9); sh.lR = -7 * Math.sin(t * 9); sh.hR = 9 * Math.sin(t * 11); if (!sh.hatW) { sh.hat = [3 * Math.sin(t * 9), -1.5 - 1.5 * Math.abs(Math.sin(t * 9))]; sh.hatR = 10 * Math.sin(t * 9 + 0.5); } }
  else if (P === 'fallen') {
    if (t < 0.42) {
      // Goes over backwards, faster and faster; legs kick up, arms flail.
      const k = clamp(t / 0.42, 0, 1), kk = k * k;
      sh.R = lerp(sh.R0 || 0, -88, kk); sh.lL = lerp(0, -72, k); sh.lR = lerp(0, -54, k);
      sh.aL = 70 + 45 * Math.sin(t * 22); sh.aR = -70 - 45 * Math.sin(t * 22 + 1); sh.hR = -12 * k; shFace('oh');
    } else if (t < 0.75) {
      // Impact: a bounce on the back, legs drop, arms fall limp, a cloud of dust.
      const k = (t - 0.42) / 0.33;
      if (!sh.hit) { sh.hit = true; const hw = shWorld(150, 330); burst(hw[0], BASE, 1.1, 9); burst(hw[0] - 40 * S0, BASE, 0.6, 4); }
      sh.R = -84 - 6 * Math.sin(k * Math.PI) * (1 - k); sh.lL = lerp(-72, -40, k) - 10 * Math.sin(k * Math.PI * 2) * (1 - k); sh.lR = lerp(-54, -30, k);
      sh.aL = lerp(sh.aL, 40, 0.2); sh.aR = lerp(sh.aR, -30, 0.2); sh.hR = lerp(-12, 0, k);
    } else {
      // Dazed: spiral eyes, stars circling above the head, a twitch of the legs.
      sh.hit = false; shFace('dizzy'); sh.lL = -40 + 4 * Math.sin(t * 9); sh.lR = -30 + 3 * Math.sin(t * 7);
      const hw = shWorld(150, 96); stars.style.display = '';
      [...stars.children].forEach((st: any, i: number) => { const ang = t * 5 + i * 2.1; st.setAttribute('transform', 'translate(' + (hw[0] - 12 * S0 + Math.cos(ang) * 30 * S0).toFixed(1) + ',' + (hw[1] - 34 * S0 + Math.sin(ang) * 9 * S0).toFixed(1) + ') scale(' + (0.8 + 0.25 * Math.sin(ang)).toFixed(2) + ')'); });
      if (t > 2.1) { stars.style.display = 'none'; sh.mode = 'kneel'; sh.t = 0; shFace('frown'); }
    }
  }
  else if (P === 'kneel') {
    // Sits up into a crouch, one hand pushing on the grass.
    const k = ease(clamp(t / 0.6, 0, 1));
    sh.R = lerp(-84, -18, k); sh.legS = lerp(1, 0.72, k); sh.lL = lerp(-40, 10, k); sh.lR = lerp(-30, -8, k); sh.aL = lerp(40, 30, k); sh.aR = lerp(-30, 55, k); sh.hR = 6 * Math.sin(t * 3);
    if (t > 0.6) { sh.mode = 'getup'; sh.t = 0; }
  }
  else if (P === 'getup') {
    const k = ease(clamp(t / 0.45, 0, 1));
    sh.R = lerp(-18, 0, k); sh.legS = lerp(0.72, 1, k) + 0.04 * Math.sin(k * Math.PI); sh.lL = lerp(10, 0, k); sh.lR = lerp(-8, 0, k); sh.aL = lerp(30, 0, k); sh.aR = lerp(55, 0, k);
    if (t > 0.45) { sh.mode = 'dust'; sh.t = 0; sh.legS = 1; shFace('frown'); }
  }
  else if (P === 'dust') {
    // Pats the trousers and sleeves: little puffs of dust come off.
    sh.aL = 30 + 30 * Math.sin(t * 26); sh.aR = -30 - 30 * Math.sin(t * 26 + 1); sh.hR = -8;
    if (Math.floor(t / 0.18) !== Math.floor((t - dt) / 0.18) && t < 0.8) { const side = Math.floor(t / 0.18) % 2 ? 1 : -1; const hw = shWorld(150 + side * 34, 380); burst(hw[0], hw[1], 0.35, 3); }
    if (t > 0.9) { sh.mode = sh.hatW ? 'hatlook' : 'hatfix'; sh.t = 0; }
  }
  else if (P === 'hatlook') {
    // Looks round for the hat.
    const dir = sh.hatW ? Math.sign(sh.hatW.x - sh.x) || -1 : 1;
    sh.aL = sm(sh.aL, 0, 10, dt); sh.aR = sm(sh.aR, 0, 10, dt); sh.hR = sm(sh.hR, dir * 14, 8, dt);
    if (t > 0.55) { sh.mode = 'hatreach'; sh.t = 0; sh.hatDir = dir; }
  }
  else if (P === 'hatreach') {
    // Bends towards it and the hat comes back to his hand, then onto his head.
    const dir = sh.hatDir || -1, k = t < 0.35 ? ease(t / 0.35) : 1 - ease(clamp((t - 0.55) / 0.35, 0, 1));
    sh.R = dir * 18 * k; sh.hR = dir * 10 * k;
    if (dir < 0) { sh.aL = 35 * k; } else { sh.aR = 30 * k; }
    if (t > 0.35 && sh.hatW && !sh.hatW.back) sh.hatW.back = { t: 0, x: sh.hatW.x, y: sh.hatW.y, r: sh.hatW.r };
    if (t > 0.95 && !sh.hatW) { sh.mode = 'hatfix'; sh.t = 0; }
  }
  else if (P === 'catch') {
    // Arms up to meet it, a little give in the knees.
    const k = ease(clamp(t / 0.25, 0, 1));
    sh.aL = lerp(0, -22, k); sh.aR = lerp(0, 42, k); sh.legS = 1 - 0.12 * Math.sin(k * Math.PI); sh.hR = -6;
    if (t > 0.25) { sh.mode = 'cradle'; sh.t = 0; shFace('norm'); }
  }
  else if (P === 'cradle') {
    sh.aL = -22 + 3 * Math.sin(t * 4); sh.aR = 42 - 3 * Math.sin(t * 4); sh.R = 3 * Math.sin(t * 4); sh.hR = 8 * sh.catchDir;
    if (t > 1.4) { sh.mode = 'setdown'; sh.t = 0; }
  }
  else if (P === 'setdown') {
    // Bends to the side and lets it go gently on the grass.
    const dir = sh.catchDir || 1, k = t < 0.4 ? ease(t / 0.4) : 1 - ease(clamp((t - 0.55) / 0.35, 0, 1));
    sh.R = dir * 20 * k; sh.aL = lerp(-22, -12, k); sh.aR = lerp(42, 30, k);
    const a = sh.caught;
    if (a && t > 0.4) {
      const hand = shWorld(150 + dir * 70, 300);
      a.homeB = clamp(sh.b + rnd(-6, 6), BMIN, BMAX); a.x = clamp(hand[0], XMIN, XMAX); a.b = a.homeB; a.cx = a.x; a.R = 0; a.fd = dir;
      a.mode = 'land'; a.t = 0.2; ground.insertBefore(a.g, ground.firstChild); sh.caught = null; baa(1.2);
    }
    if (t > 0.9) { sh.mode = 'scold'; sh.t = 0; shFace('frown'); }
  }
  else if (P === 'scold') {
    // A wagging finger at the sheep.
    const dir = sh.catchDir || 1;
    sh.aL = sm(sh.aL, 0, 10, dt); sh.R = sm(sh.R, 0, 10, dt); sh.hR = dir * 10;
    sh.aR = dir > 0 ? -120 + 12 * Math.sin(t * 22) : sm(sh.aR, 0, 10, dt); if (dir < 0) sh.aL = 120 - 12 * Math.sin(t * 22);
    if (t > 1) { sh.mode = 'stand'; sh.t = 0; shFace('norm'); }
  }
  else if (P === 'hatfix') { sh.aL = sm(sh.aL, 196, 14, dt); sh.aR = sm(sh.aR, 0, 10, dt); setArmsFront(true); sh.hatR = 6 * Math.sin(t * 20) * (1 - t / 0.5); if (t > 0.5) { sh.mode = 'wave'; sh.t = 0; setArmsFront(false); } }
  else if (P === 'wave') { sh.aL = sm(sh.aL, 0, 10, dt); sh.aR = -40 + 35 * Math.sin(t * 14); if (t < 0.05) flock.forEach((a: any) => { if (a.mode === 'ground' && Math.abs(a.x - sh.x) < 240) { a.scat = { p: [clamp(a.x + Math.sign(a.x - sh.x || 1) * 160, XMIN, XMAX), a.b], until: T + 1000 }; a.fT = Math.sign(a.x - sh.x || 1); } }); if (t > 0.9) { sh.mode = 'stand'; sh.t = 0; sh.pressure = 0; } }
  else if (P === 'react' || P === 'jump') {
    const hl = sh.hist[sh.hist.length - 1];
    if (P === 'react') {
      sh.aL = lerp(0, 90, clamp(t / 0.15, 0, 1)); sh.aR = -sh.aL; setArmsFront(true);
      const L: [number, number] = shLocal(sh.px, sh.py); sh.hat = [L[0] - HAT_ANCHOR[0], L[1] - HAT_ANCHOR[1]];
      if (t > 0.15) { sh.mode = 'jump'; sh.t = 0; sh.j0 = { aw: sh.aw.slice(), anc: sh.anc.slice(), R: sh.R, hat: sh.hat.slice() }; shFace('det'); }
    } else {
      const k = ease(clamp(t / 0.18, 0, 1));
      const feetT = [sh.px, sh.py + 454 * S0];
      const f0 = sh.j0.anc[1] > 400 ? sh.j0.aw : [sh.j0.aw[0], sh.j0.aw[1]];
      sh.anc = [150, 506]; sh.aw = [lerp(f0[0], feetT[0], k), lerp(f0[1], feetT[1], k)]; sh.R = lerp(sh.j0.R, 0, k);
      sh.aL = lerp(90, 184, k); sh.aR = lerp(-90, -164, k);
      const L = shLocal(sh.px, sh.py); sh.hat = [lerp(L[0] - HAT_ANCHOR[0], 0, k), lerp(L[1] - HAT_ANCHOR[1], -18, k)];
      if (t > 0.18) { sh.hat = [0, -18]; setAnchor(150, 52); sh.aw = [sh.px, sh.py]; if (sh.released) { sh.released = false; shFall(0); } else { sh.mode = 'held'; sh.t = 0; } }
    }
  }
  else if (P === 'held') {
    const [vx] = velOf(sh.hist);
    sh.vxs = sm(sh.vxs, T - sh.hist[sh.hist.length - 1][2] > 90 ? 0 : vx, 10, dt);
    const tR = clamp(sh.vxs * 0.05, -45, 45);
    sh.Rv += ((tR - sh.R) * 55 - sh.Rv * 4) * dt; sh.R += sh.Rv * dt;
    sh.anc = [150, 52]; sh.aw = [sh.px, sh.py];
    sh.aL = 184; sh.aR = -164; sh.lL = -sh.R * 0.5 + 18 * Math.sin(t * 7); sh.lR = -sh.R * 0.5 + 18 * Math.sin(t * 7 + Math.PI); sh.hR = -sh.R * 0.3;
    if (!sh.said && t > 0.4) { sh.said = true; bubble(sh.px + 30, sh.py + 20, 'Віддай!'); }
    if (Math.abs(sh.vxs) > 1400 && T > sh.ohT) { sh.ohT = T + 1500; bubble(sh.px + 30, sh.py + 40, 'Ой-ой!'); }
  }
  else if (P === 'cling') {
    sh.Rsv += (-sh.Rs * 30 - sh.Rsv * 1.0) * dt; sh.Rs += sh.Rsv * dt; sh.R = sh.Rs;
    sh.aL = 180; sh.aR = -43; const hr_ = rot(-43, 241 - 196, 262 - 178), hand: [number, number] = [196 + hr_[0], 178 + hr_[1]];
    sh.hat = [hand[0] - 150, hand[1] - 70];
    sh.anc = [118, 59]; sh.aw = [sh.ex, TOP + 2]; sh.lL = -sh.R * 0.6 + 10 * Math.sin(t * 6); sh.lR = -sh.R * 0.6 + 10 * Math.sin(t * 6 + 2);
    if (t > 2) { sh.hat = [0, -18]; sh.aL = 184; sh.aR = -164; setAnchor(150, 52); shFall(0); }
  }
  else if (P === 'fall') {
    const k = clamp(t / 0.4, 0, 1), ph = t * Math.PI * 2 / 1.0;
    sh.aw[1] += sh.vf * dt * clamp(t / 0.25, 0.3, 1);
    sh.vx *= Math.exp(-dt * 3); sh.aw[0] = clamp(sh.aw[0] + sh.vx * dt + 8 * Math.cos(ph) * dt * 6 * k, 60, W - 60);
    sh.R = lerp(sh.R0, 6 * Math.sin(ph), k);
    sh.hat = [sm(sh.hat[0], 0, 12, dt), sm(sh.hat[1], -18, 12, dt)]; sh.aL = sm(sh.aL, 184, 12, dt); sh.aR = sm(sh.aR, -164, 12, dt);
    sh.lL = 12 * Math.sin(t * 5); sh.lR = 12 * Math.sin(t * 5 + Math.PI);
    const feet = shWorld(150, 506);
    if (feet[1] >= BASE) {
      sh.x = clamp(feet[0], XMIN, XMAX); sh.b = BASE; sh.R = 0; sh.mode = 'land'; sh.t = 0; sh.onGround = true;
      ground.appendChild(shG); burst(sh.x, BASE, 1, 8);
      flock.forEach((a: any) => { if (a.mode === 'ground' && Math.abs(a.x - sh.x) < 90) a.scat = { p: [clamp(a.x + Math.sign(a.x - sh.x || 1) * 110, XMIN, XMAX), a.b], until: T + 800 }; });
    }
  }
  else if (P === 'land') { sh.legS = t < 0.12 ? lerp(1, 0.8, t / 0.12) : lerp(0.8, 1, clamp((t - 0.12) / 0.25, 0, 1)); sh.lL = 0; sh.lR = 0; sh.R = 0; if (t > 0.4) { sh.mode = 'dress'; sh.t = 0; } }
  else if (P === 'dress') { const k = ease(clamp(t / 0.45, 0, 1)); sh.hat = [0, lerp(-18, 0, k)]; sh.aL = lerp(184, 186, k); sh.aR = lerp(-164, -166, k); shFace('det'); if (t > 0.45) { sh.mode = 'adjust'; sh.t = 0; } }
  else if (P === 'adjust') { sh.aL = sm(sh.aL, 196, 10, dt); sh.aR = sm(sh.aR, 0, 8, dt); sh.hatR = 5 * Math.sin(t * 22) * (1 - clamp(t / 0.4, 0, 1)); if (t > 0.45) { sh.mode = 'fist'; sh.t = 0; shFace('frown'); } }
  else if (P === 'fist') { sh.aL = sm(sh.aL, 0, 8, dt); sh.aR = sm(sh.aR, -140, 10, dt) + 8 * Math.sin(t * 24); if (t > 0.8) { sh.mode = 'walk'; sh.t = 0; shFace('norm'); setArmsFront(false); if (sh.lifts.length >= 3) { sh.guard = T + 5000; sh.lifts = []; } } }
  else if (P === 'walk') {
    const d = HOME - sh.x; sh.aR = sm(sh.aR, 0, 8, dt); sh.aL = sm(sh.aL, 0, 8, dt); sh.hatR = 0;
    sh.x += Math.sign(d) * Math.min(Math.abs(d), 110 * dt);
    sh.lL = 14 * Math.sin(t * 10); sh.lR = -sh.lL; sh.R = 1.5 * Math.sin(t * 10);
    if (Math.abs(d) < 1) { sh.R = 0; sh.lL = 0; sh.lR = 0; sh.mode = sh.staffOut ? 'pickup' : 'stand'; sh.t = 0; }
  }
  else if (P === 'pickup') {
    sh.R = t < 0.3 ? lerp(0, 16, t / 0.3) : lerp(16, 0, clamp((t - 0.3) / 0.3, 0, 1)); sh.aR = t < 0.3 ? lerp(0, 25, t / 0.3) : lerp(25, 0, clamp((t - 0.3) / 0.3, 0, 1));
    if (t > 0.3 && sh.staffOut) { sh.staffOut = false; staffIn.style.display = ''; staffG.style.display = 'none'; }
    if (t > 0.6) { sh.mode = 'stand'; sh.t = 0; }
  }
  if (sh.hatW) {
    const h = sh.hatW, floorY = BASE - 26 * S0;
    if (h.back) {
      h.back.t += dt; const k = ease(clamp(h.back.t / 0.5, 0, 1)); const head = shWorld(HAT_ANCHOR[0], HAT_ANCHOR[1]);
      h.x = lerp(h.back.x, head[0], k); h.y = lerp(h.back.y, head[1], k) - Math.sin(k * Math.PI) * 50 * S0; h.r = lerp(h.back.r, sh.R, k);
      if (k >= 1) { sh.hatW = null; sh.hat = [0, 0]; sh.hatR = 0; }
    } else if (!h.land) {
      h.vy += 1500 * dt; h.x = clamp(h.x + h.vx * dt, 40, W - 40); h.y += h.vy * dt; h.r += h.vr * dt;
      if (h.y >= floorY) {
        h.y = floorY;
        if (Math.abs(h.vy) > 220) { h.vy *= -0.32; h.vx *= 0.5; h.vr *= 0.35; burst(h.x, BASE, 0.4, 3); }
        else { h.land = true; h.vy = 0; h.vx = 0; h.vr = 0; }
      }
    } else { h.r = sm(h.r, 14 * Math.sign(h.r || 1), 6, dt); }
    if (sh.hatW) { const L = shLocal(h.x, h.y); sh.hat = [L[0] - HAT_ANCHOR[0], L[1] - HAT_ANCHOR[1]]; sh.hatR = h.r - sh.R; }
  }
  if (sh.staffOut && sh.staff) {
    const s = sh.staff; s.t += dt; const k = ease(clamp(s.t / 0.5, 0, 1));
    const ang = lerp(s.a, -82, k) + (s.t > 0.5 && s.t < 0.7 ? 3 * Math.sin((s.t - 0.5) * 40) : 0);
    staffG.setAttribute('transform', 'translate(' + s.x.toFixed(1) + ',' + lerp(s.y, BASE, k).toFixed(1) + ') rotate(' + ang.toFixed(1) + ') scale(' + S0 + ') translate(-238,-506)');
  }
  drawShep(); drawShades();
  showArmsFront(!!sh.caught && ['catch', 'cradle', 'setdown'].includes(sh.mode));

  // --- depth order on the ground ---
  if (T - (lastSort || 0) > 80) {
    lastSort = T;
    const items = gs.map((a: any) => [a.b + (a.mode === 'land' ? 0 : 0), a.g]);
    if (sh.onGround) items.push([sh.b + 0.5, shG]);
    if (sh.staffOut) items.push([BASE - 1, staffG]);
    items.sort((p: any, q: any) => p[0] - q[0]);
    let prev: any = null;
    items.forEach(([, g]) => { if (g.parentNode !== ground) return; const want = prev ? prev.nextSibling : ground.firstChild; if (want !== g) ground.insertBefore(g, want); prev = g; });
  }
  if (airborne !== lookUp) lookUp = airborne;

  // --- effects ---
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i]; q.life -= dt;
    if (q.life <= 0) { q.el.remove(); parts.splice(i, 1); continue; }
    q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
    q.el.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ') rotate(' + q.rot.toFixed(0) + ')');
    q.el.setAttribute('opacity', q.fade ? clamp(q.life / q.fade, 0, 1).toFixed(2) : (q.life / q.max).toFixed(2));
  }
}
// Narrow screens see only part of the 1440-wide scene (slice). Keep the shepherd and about eight
// sheep inside the visible band instead of leaving them off-screen (round 10: phones ≈ 8 sheep).
(function fitToViewport() {
  const m = land.getScreenCTM();
  const box = land.getBoundingClientRect();
  if (!m || !box.width) return;
  const pt = land.createSVGPoint();
  pt.x = box.left; pt.y = box.top; const x0 = pt.matrixTransform(m.inverse()).x;
  pt.x = box.right; const x1 = pt.matrixTransform(m.inverse()).x;
  if (x1 - x0 > 1300) return;
  XMIN = x0 + 40; XMAX = x1 - 30;
  const moveHut = () => {
    const hut = land.querySelector('[data-hut]');
    // The hut stands on the hill just behind the shepherd (round 17 B6); keep that relation.
    if (!hut) return;
    const hx = Math.max(x0 - 10, HOME - 154);
    // Seat it on the hill: the hill line is lower toward the valley, so sink the hut by the
    // difference from its drawn spot (x 58, ground 414), taking the lower of its two corners.
    const hill = (land.querySelector('[data-hill]')?.getAttribute('d') ?? '').match(/L-?[\d.]+ -?[\d.]+/g)?.map((q: string) => q.slice(1).split(' ').map(Number)).filter((q: number[]) => q[1]! < 620) ?? [];
    const ground = (x: number) => {
      const k = hill.findIndex((q: number[]) => q[0]! >= x);
      if (k <= 0) return hill[0]?.[1] ?? 414;
      const [ax, ay] = hill[k - 1]!, [bx, by] = hill[k]!;
      return ay! + ((by! - ay!) * (x - ax!)) / (bx! - ax!);
    };
    const dy = hill.length ? Math.max(ground(hx + 12), ground(hx + 108)) - Math.max(ground(70), ground(166)) : 0;
    hut.setAttribute('transform', 'translate(' + hx.toFixed(1) + ' ' + (346 + dy).toFixed(1) + ')');
    // The path and its fences run from the hut's door, so they move with it.
    for (const sel of ['[data-path]', '[data-path-fences]']) land.querySelector(sel)?.setAttribute('transform', 'translate(' + hx.toFixed(1) + ' ' + (346 + dy).toFixed(1) + ')');
    // Moved in among the firs of its hill (client, 2026-10-01: on a phone the firs covered the hut), the firs
    // standing on its spot step aside to either side, with their shadows, so the house is seen whole.
    if (hx > 70) {
      const base = 346 + dy + 100, cx = hx + 60, half = 66;
      land.querySelectorAll('[data-firs] use, [data-bigfirs] use').forEach((u: Element) => {
        const m = (u.getAttribute('transform') ?? '').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)(?: ([-\d.]+))?\)/);
        if (!m) return;
        const big = (u.getAttribute('href') ?? '').includes('bigfir');
        const x = +m[1]!, y = +m[2]!, sx = +m[3]!, sy = +(m[4] ?? m[3])!, hw = (big ? 43 : 31) * sx, tall = big ? 121 : 75;
        if (y - tall * sy >= base || y <= base - 105 || Math.abs(x - cx) >= half + hw) return;
        const nx = cx + (x < cx ? -1 : 1) * (half + hw), shade = u.previousElementSibling;
        u.setAttribute('transform', 'translate(' + nx.toFixed(1) + ' ' + y + ') scale(' + sx + ' ' + sy + ')');
        if (shade?.tagName === 'ellipse') shade.setAttribute('cx', (+shade.getAttribute('cx')! + nx - x).toFixed(1));
      });
    }
  };
  if (x1 - x0 >= 1000) {
    // Laptops: everyone fits; just pull anyone standing past the edge back into view.
    if (HOME < XMIN + 20) { HOME = XMIN + 50; sh.x = HOME; sh.aw = [HOME, BASE]; }
    moveHut(); // always: keeps the hut from being cut at the left edge
    flock.forEach((a: any) => { a.x = clamp(a.x, Math.max(XMIN, HOME + 70), XMAX); });
    return;
  }
  HOME = x0 + Math.min(90, (x1 - x0) * 0.16); sh.x = HOME; sh.aw = [HOME, BASE];
  moveHut();
  const keep = Math.max(4, Math.min(8, Math.round((x1 - x0) / 120)));
  const li = flock.findIndex((a: any) => a.lamb);
  if (li >= keep) [flock[keep - 1], flock[li]] = [flock[li], flock[keep - 1]];
  const extra = flock.splice(keep);
  extra.forEach((a: any) => { a.g.remove(); a.shade.remove(); });
  const from = HOME + 80, to = XMAX;
  flock.forEach((a: any, i: number) => { a.x = from + ((to - from) * (i + 0.5)) / flock.length + rnd(-15, 15); });
  flock.forEach((a: any) => { if (a.lamb && !flock.includes(a.mom)) a.mom = flock.find((o: any) => !o.lamb); });
})();
flock.forEach(drawSheep); drawShep(); drawShades();
// The chimney smoke is the only thing that moved inside the still picture: it goes to the moving layer too.
const smoke = land.querySelector('.vk-smoke'), hut = land.querySelector('[data-hut]');
if (smoke && hut) { const g = el('g', { transform: hut.getAttribute('transform') || '' }); groundSvg.insertBefore(g, groundSvg.firstChild); g.appendChild(smoke); }
// Development only: start the fall at once, to check the choreography without herding sheep.
if (import.meta.env.DEV) {
  const drop = (a: any, x: number, y: number) => { const S = sS(a); a.s = S; a.cx = x; a.cy = y; a.homeB = a.b; a.R = 0; a.la = [0, 0, 0, 0]; airG.appendChild(a.g); sheepFall(a, 0); };
  (win as any).__vkDropOnShepherd = () => { const a = flock.filter((q: any) => q.mode === 'ground').sort((p: any, q: any) => Math.abs(p.x - sh.x) - Math.abs(q.x - sh.x))[1]; if (a) drop(a, sh.x, sh.b - 620 * S0); };
  (win as any).__vkDropOnSheep = () => { const g = flock.filter((q: any) => q.mode === 'ground').sort((p: any, q: any) => Math.abs(p.x - 760) - Math.abs(q.x - 760)); const o = g[0], a = g[3]; if (o && a) { drop(a, o.x, o.b - 360); a.homeB = o.b; } };
}
if (import.meta.env.DEV) (win as any).__vkFall = () => { sh.mode = 'fallen'; sh.t = 0; sh.R0 = sh.R; launchHat(1); if (!sh.staffOut) dropStaff(); };
// Degradation ladder step 4 (36 §36.5): every loop pauses on a hidden tab or with the hero off-screen.
let visible = true, onScreen = true;
const run = () => {
  const go = visible && onScreen;
  if (go && !raf) { last = 0; raf = win.requestAnimationFrame(step); }
  if (!go && raf) { win.cancelAnimationFrame(raf); raf = 0; }
};
const onVis = () => { visible = doc.visibilityState === 'visible'; run(); };
doc.addEventListener('visibilitychange', onVis);
const io = 'IntersectionObserver' in win ? new IntersectionObserver((e) => { onScreen = e[0]!.isIntersecting; run(); }) : null;
io?.observe(root);
raf = 0; run();
return () => {
  win.cancelAnimationFrame(raf);
  doc.removeEventListener('visibilitychange', onVis); io?.disconnect();
  root.removeEventListener('pointermove', onMove); root.removeEventListener('pointerleave', onLeave);
  win.removeEventListener('wheel', onAbort); win.removeEventListener('blur', onAbort);
};
}
