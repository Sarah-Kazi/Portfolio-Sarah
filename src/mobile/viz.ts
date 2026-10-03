// Mobile version of the desktop skills constellations, built from the same
// data: one SVG per group, stacked.

import { GROUPS, STARS, LINES } from '../interactivity/skills';
import { reduceMotion } from './motion';

const SVG = 'http://www.w3.org/2000/svg';

// Desktop star coordinates are fractions of a roughly 16:10 screen.
const ASPECT_X = 16;
const ASPECT_Y = 10;
const VIEW_W = 360;
const PAD_X = 70;      // room for side labels
const PAD_Y = 26;      // room for top/bottom labels
const MAX_H = 240;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

function buildConstellation(gi: number): HTMLElement {
  const g = GROUPS[gi];
  const idx = STARS.map((s, i) => (s.group === gi ? i : -1)).filter(i => i >= 0);
  const xs = idx.map(i => STARS[i].x * ASPECT_X);
  const ys = idx.map(i => STARS[i].y * ASPECT_Y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min((VIEW_W - 2 * PAD_X) / (maxX - minX), MAX_H / (maxY - minY));
  const w = (maxX - minX) * s;
  const h = (maxY - minY) * s;
  const offX = (VIEW_W - w) / 2;
  const pos = new Map(idx.map((i, k) => [i, { x: offX + (xs[k] - minX) * s, y: PAD_Y + (ys[k] - minY) * s }]));

  const svg = el('svg', { viewBox: `0 0 ${VIEW_W} ${h + 2 * PAD_Y}`, class: 'm-con-svg', role: 'img', 'aria-label': `${g.name.toLowerCase()}: ${idx.map(i => STARS[i].name).join(', ')}` });

  // Soft halo behind the group, as on desktop.
  const gradId = `m-halo-${gi}`;
  const defs = el('defs', {});
  const grad = el('radialGradient', { id: gradId });
  grad.append(
    el('stop', { offset: '0', 'stop-color': `rgb(${g.rgb})`, 'stop-opacity': 0.16 }),
    el('stop', { offset: '0.5', 'stop-color': `rgb(${g.rgb})`, 'stop-opacity': 0.05 }),
    el('stop', { offset: '1', 'stop-color': `rgb(${g.rgb})`, 'stop-opacity': 0 }),
  );
  defs.appendChild(grad);
  svg.appendChild(defs);
  svg.appendChild(el('ellipse', { cx: VIEW_W / 2, cy: PAD_Y + h / 2, rx: VIEW_W * 0.48, ry: h / 2 + PAD_Y * 1.6, fill: `url(#${gradId})` }));

  let order = 0;
  LINES.forEach(([a, b]) => {
    if (STARS[a].group !== gi) return;
    const p = pos.get(a)!, q = pos.get(b)!;
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    const line = el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: 'm-con-line', stroke: g.color });
    line.style.setProperty('--len', len.toFixed(1));
    line.style.setProperty('--d', `${0.15 + order++ * 0.06}s`);
    svg.appendChild(line);
  });

  idx.forEach((i, k) => {
    const st = STARS[i];
    const p = pos.get(i)!;
    const r = st.size * 0.34;
    const grp = el('g', { class: 'm-con-star' });
    grp.style.setProperty('--d', `${0.6 + k * 0.05}s`);
    grp.style.setProperty('--tw', `${st.phase * 1.7}s`);
    grp.style.transformOrigin = `${p.x}px ${p.y}px`;
    grp.append(
      el('circle', { cx: p.x, cy: p.y, r: r * 2.6, fill: g.color, opacity: 0.18, class: 'm-con-glow' }),
      el('circle', { cx: p.x, cy: p.y, r, fill: '#fff' }),
      el('circle', { cx: p.x, cy: p.y, r: r * 1.5, fill: 'none', stroke: g.color, 'stroke-width': 1, opacity: 0.7 }),
    );
    const off = r + 7;
    const [lx, ly, anchor] =
      st.labelDir === 'r' ? [p.x + off, p.y + 3.5, 'start'] :
      st.labelDir === 'l' ? [p.x - off, p.y + 3.5, 'end'] :
      st.labelDir === 't' ? [p.x, p.y - off, 'middle'] :
                            [p.x, p.y + off + 8, 'middle'];
    const label = el('text', { x: lx, y: ly, 'text-anchor': anchor, class: 'm-con-label', fill: g.color });
    label.textContent = st.name;
    grp.appendChild(label);
    svg.appendChild(grp);
  });

  const block = document.createElement('section');
  block.className = 'm-con';
  block.innerHTML = `<h3 style="--c:${g.color}">${g.name}</h3>`;
  block.appendChild(svg);
  return block;
}

// Constellations draw themselves in as they scroll into view.
export function buildConstellations(section: HTMLElement, scroller: HTMLElement) {
  const wrap = document.createElement('div');
  wrap.className = 'm-skills';
  const blocks = GROUPS.map((_, gi) => buildConstellation(gi));
  blocks.forEach(b => wrap.appendChild(b));
  section.appendChild(wrap);

  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    blocks.forEach(b => b.classList.add('m-con-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('m-con-in', e.isIntersecting);
  }, { root: scroller, threshold: 0.3 });
  blocks.forEach(b => io.observe(b));
}
