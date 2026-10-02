

import './timeline.css';

interface Phase {
  short: string;
  core: [number, number, number];
  halo: [number, number, number];
  coreR: number;   // px @ a 800px reference, scaled responsively
  haloR: number;
}

interface Milestone {
  year: string;
  title: string;
  blurb: string;
}

export const PHASES: Phase[] = [
  { short: 'Nebula',    core: [190, 160, 225], halo: [150, 90, 205], coreR: 9,  haloR: 120 },
  { short: 'Protostar', core: [255, 150, 80],  halo: [225, 115, 55], coreR: 20, haloR: 95 },
  { short: 'Main Seq.', core: [255, 246, 214], halo: [255, 206, 120], coreR: 36, haloR: 130 },
  { short: 'Red Giant', core: [255, 125, 72],  halo: [228, 70, 42],  coreR: 66, haloR: 175 },
  { short: 'Supernova', core: [255, 255, 255], halo: [200, 222, 255], coreR: 34, haloR: 230 },
  { short: 'Now',       core: [214, 236, 255], halo: [120, 180, 255], coreR: 15, haloR: 85 },
];


export const MILESTONES: Milestone[] = [
  { year: '2024', title: 'The first spark',     blurb: 'Joined PES University as a Computer Science student.' },
  { year: '2024', title: 'Taking shape',        blurb: 'Attended a PESU I/O course on Neural Networks.' },
  { year: '2025', title: 'Finding my rhythm',   blurb: 'Joined ACM PESUECC Student Chapter. Hacknight repository maintainer, Submitted bluffmaster for an internal ACM contest.' },
  { year: '2025', title: 'Expanding outward',   blurb: 'Gave a Fireside talk on Indic Dictionaries inspired from the talk by Kailash Nadh at MangaloreFOSS.' },
  { year: '2025', title: 'A breakthrough',      blurb: 'Co-mentored for aWASMe - a WASM interpreter and instruction level simulator under AIEP, started diving deeper into systems programming' },
  { year: '2026', title: 'The present',         blurb: 'Interning at PES Innovation Lab, working on NginXray - an Nginx security agent.' },
];

const N = PHASES.length;


const JIT = [-7, 9, -12, 6, -9, 4];

const FOCUS_LERP    = 0.1;
const ANCHOR_LOCK_T = 0.9;
const STAR_FRAC = 0.34;   // vertical centre of the star (fraction of h)
const CARD_FRAC = 0.60;
const RAIL_FRAC = 0.83;
const DEORBIT_GAP = 14;

const clampIdx = (i: number) => Math.max(0, Math.min(N - 1, i));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (c: number[], d: number[], t: number): number[] => [lerp(c[0], d[0], t), lerp(c[1], d[1], t), lerp(c[2], d[2], t)];
const rgba = (c: number[], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const rgb = (c: number[]) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

function ensureCanvas(): HTMLCanvasElement {
  const existing = document.getElementById('timeline-canvas') as HTMLCanvasElement | null;
  if (existing) return existing;
  const canvas = document.createElement('canvas');
  canvas.id = 'timeline-canvas';
  canvas.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'width:100vw', 'height:100vh',
    'pointer-events:none', 'z-index:500', 'opacity:0', 'transition:opacity 0.5s ease',
  ].join(';');
  document.body.appendChild(canvas);
  return canvas;
}

export default function initializeTimeline() {
  const section = document.getElementById('timeline');
  if (!section) return;

  const goBack = document.getElementById('go-back-button');
  const canvas = ensureCanvas();
  const ctx = canvas.getContext('2d')!;

  // Detail card
  const card = document.createElement('div');
  card.className = 'tl-card';
  card.innerHTML = `<div class="tl-card-phase"></div><div class="tl-card-title"></div><div class="tl-card-blurb"></div>`;
  document.body.appendChild(card);
  const cardPhase = card.querySelector('.tl-card-phase') as HTMLElement;
  const cardTitle = card.querySelector('.tl-card-title') as HTMLElement;
  const cardBlurb = card.querySelector('.tl-card-blurb') as HTMLElement;

  // Lifecycle rail
  const rail = document.createElement('div');
  rail.className = 'tl-rail';
  // The connecting line is drawn on the canvas as a constellation (see
  // drawRail) so it can jitter, glow per-segment and split into a bright
  // traveled trail + a faint dotted path ahead. The rail element only carries
  // the clickable node "stars" (dots + labels), positioned to match.
  const nodes: HTMLElement[] = PHASES.map((p, i) => {
    const n = document.createElement('button');
    n.className = 'tl-node';
    n.type = 'button';
    n.style.left = `${(i / (N - 1)) * 100}%`;
    n.style.setProperty('--c', rgb(p.halo));
    n.innerHTML = `<span class="tl-node-dot"></span><span class="tl-node-label">${p.short}</span><span class="tl-node-year">${MILESTONES[i].year}</span>`;
    n.addEventListener('click', () => { focusIndex = i; });
    rail.appendChild(n);
    return n;
  });
  document.body.appendChild(rail);

  let focusIndex = 0;
  let focusFloat = 0;
  let displayed = -1;
  let running = false;
  let rafId = 0;
  let entryStartTs = 0;
  let anchorLocked = false;
  let anchorX = 0, anchorY = 0;
  let jitScale = 1;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Keep the DOM node "stars" on the same jittered constellation the canvas draws.
    const railW = Math.min(760, window.innerWidth * 0.92);
    jitScale = Math.min(1, railW / 760);
    nodes.forEach((n, i) => { n.style.top = `${JIT[i] * jitScale}px`; });
  }
  window.addEventListener('resize', resize);
  resize();

  function onKey(e: KeyboardEvent) {
    if (!running) return;
    if (e.key === 'ArrowRight') focusIndex = clampIdx(focusIndex + 1);
    if (e.key === 'ArrowLeft')  focusIndex = clampIdx(focusIndex - 1);
  }

  function planetRect(): DOMRect | null {
    const img = document.querySelector<HTMLImageElement>('#planet-9 img');
    return img ? img.getBoundingClientRect() : null;
  }

  function loop(ts: number) {
    if (entryStartTs === 0) entryStartTs = ts;
    const entryT = (ts - entryStartTs) / 1000;
    const t = ts / 1000;
    const w = window.innerWidth;
    const h = window.innerHeight;

    let offX = 0, offY = 0;
    const rect = planetRect();
    if (rect) {
      const pcx = rect.left + rect.width / 2;
      const pcy = rect.top + rect.height / 2;
      if (!anchorLocked) {
        anchorX = pcx; anchorY = pcy;
        if (entryT > ANCHOR_LOCK_T) anchorLocked = true;
      } else { offX = pcx - anchorX; offY = pcy - anchorY; }
    }

    focusFloat += (focusIndex - focusFloat) * FOCUS_LERP;
    if (Math.abs(focusIndex - focusFloat) < 0.0008) focusFloat = focusIndex;

    const cx = w / 2 + offX;
    const sy = h * STAR_FRAC + offY;
    const k = Math.min(w, h) / 800;

    // Rail sits first so the star's beam can reach the active node.
    rail.style.left = `${cx}px`;
    rail.style.top  = `${h * RAIL_FRAC + offY}px`;
    const rr = rail.getBoundingClientRect();

    // Constellation points (screen space): evenly spaced x, jittered y.
    const baseY = rr.top + 6;
    const pts = PHASES.map((_, i) => ({
      x: rr.left + (i / (N - 1)) * rr.width,
      y: baseY + JIT[i] * jitScale,
    }));

    // Playhead: interpolate along the segment the focus currently sits on.
    const lo = Math.max(0, Math.min(N - 2, Math.floor(focusFloat)));
    const f = focusFloat - lo;
    const php = { x: lerp(pts[lo].x, pts[lo + 1].x, f), y: lerp(pts[lo].y, pts[lo + 1].y, f) };

    renderStar(ctx, w, h, cx, sy, k, focusFloat, t, php.x, php.y);
    drawRail(ctx, pts, focusFloat, k, t);

    // Card
    const near = clampIdx(Math.round(focusFloat));
    if (near !== displayed) {
      cardPhase.textContent = `${PHASES[near].short} · ${MILESTONES[near].year}`;
      cardPhase.style.color = rgb(PHASES[near].halo);
      cardTitle.textContent = MILESTONES[near].title;
      cardBlurb.textContent = MILESTONES[near].blurb;
      nodes.forEach((n, i) => n.classList.toggle('active', i === near));
      displayed = near;
    }
    card.style.left = `${cx}px`;
    card.style.top  = `${h * CARD_FRAC + offY}px`;

    // Deorbit below the rail
    if (goBack) {
      goBack.style.left = `${cx}px`;
      goBack.style.top  = `${rail.getBoundingClientRect().bottom + DEORBIT_GAP}px`;
      goBack.style.transform = 'translateX(-50%)';
    }

    rafId = requestAnimationFrame(loop);
  }

  new MutationObserver(() => {
    if (section.style.display === 'block' && !running) {
      running = true;
      focusIndex = 0; focusFloat = 0; displayed = -1;
      entryStartTs = 0; anchorLocked = false;
      canvas.style.transition = 'opacity 0.5s ease';
      canvas.style.opacity = '1';
      card.classList.add('visible');
      rail.classList.add('visible');
      document.addEventListener('keydown', onKey);
      if (goBack) {
        document.body.appendChild(goBack);
        goBack.classList.add('timeline-deorbit');
      }
      rafId = requestAnimationFrame(loop);
    } else if (section.style.display !== 'block' && running) {
      running = false;
      canvas.style.transition = 'none';
      canvas.style.opacity = '0';
      card.classList.remove('visible');
      rail.classList.remove('visible');
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onKey);
      if (goBack) {
        goBack.classList.remove('timeline-deorbit');
        goBack.style.left = '';
        goBack.style.top = '';
        goBack.style.transform = '';
      }
    }
  }).observe(section, { attributes: true, attributeFilter: ['style'] });
}

const bump = (x: number, c: number, width: number) => Math.max(0, 1 - Math.abs(x - c) / width);

interface Pt { x: number; y: number; }

// The lifecycle rail, drawn as a constellation. Each phase is a star; the
// segments between them form the traced line. Behind the playhead they glow as
// a colour-graded light trail (the path already lived); ahead they're a faint
// dotted route (the journey still to come). A comet head rides the playhead.
function drawRail(ctx: CanvasRenderingContext2D, pts: Pt[], pf: number, k: number, t: number) {
  const n = pts.length;

  // Faint dotted future, overpainted by the traveled trail.
  ctx.save();
  ctx.lineCap = 'round';
  ctx.setLineDash([0.5, 8]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(160, 190, 225, 0.30)';
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();

  const lo = Math.max(0, Math.min(n - 2, Math.floor(pf)));
  const f = pf - lo;
  const php: Pt = { x: lerp(pts[lo].x, pts[lo + 1].x, f), y: lerp(pts[lo].y, pts[lo + 1].y, f) };

  // Bright glowing trail from the start up to the playhead, colour-graded.
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2.6;
  for (let s = 0; s <= lo; s++) {
    const a = pts[s];
    const b = s === lo ? php : pts[s + 1];
    const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    g.addColorStop(0, rgba(PHASES[s].halo, 0.95));
    g.addColorStop(1, rgba(PHASES[s + 1].halo, 0.95));
    ctx.strokeStyle = g;
    ctx.shadowColor = rgba(PHASES[s + 1].halo, 0.9);
    ctx.shadowBlur = 9;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();

  // Comet head at the playhead, gently pulsing.
  const headCol = mix(PHASES[lo].halo, PHASES[lo + 1].halo, f);
  const pulse = 1 + 0.12 * Math.sin(t * 3);
  const gr = 15 * k * pulse;
  const gg = ctx.createRadialGradient(php.x, php.y, 0, php.x, php.y, gr);
  gg.addColorStop(0, rgba(headCol, 0.85));
  gg.addColorStop(1, rgba(headCol, 0));
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(php.x, php.y, gr, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(php.x, php.y, 3 * pulse, 0, Math.PI * 2); ctx.fill();
}

function renderStar(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  sx: number, sy: number, k: number,
  phase: number, t: number,
  plumbX: number, railY: number,
) {
  ctx.clearRect(0, 0, w, h);

  const lo = Math.floor(phase);
  const hi = Math.min(N - 1, lo + 1);
  const f = phase - lo;
  const core = mix(PHASES[lo].core, PHASES[hi].core, f);
  const halo = mix(PHASES[lo].halo, PHASES[hi].halo, f);
  const coreR = lerp(PHASES[lo].coreR, PHASES[hi].coreR, f) * k;
  const haloR = lerp(PHASES[lo].haloR, PHASES[hi].haloR, f) * k;

  // Plumb line tying the star to its active milestone. Drawn first so the
  // star and halo settle over its top.
  {
    const g = ctx.createLinearGradient(sx, sy, plumbX, railY);
    g.addColorStop(0,    rgba(halo, 0));
    g.addColorStop(0.12, rgba(halo, 0.20));
    g.addColorStop(0.9,  rgba(halo, 0.22));
    g.addColorStop(1,    rgba(halo, 0.55));
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(plumbX, railY); ctx.stroke();
  }

  const nebula = Math.max(0, Math.min(1, 1.5 - phase));
  const giant  = bump(phase, 3, 1);
  const nova   = bump(phase, 4, 0.7);
  const ring   = Math.max(0, Math.min(1, (phase - 4.2) / 0.8));
  const pulse  = 1 + 0.035 * Math.sin(t * 2.2) + giant * 0.07 * Math.sin(t * 1.5);

  // Nebula gas cloud
  if (nebula > 0.01) {
    const cols = [[150, 90, 205], [90, 120, 215], [210, 110, 175], [120, 160, 225]];
    const R = 210 * k;
    for (let b = 0; b < 7; b++) {
      const ang = (b / 7) * Math.PI * 2 + t * 0.05;
      const dist = (0.25 + 0.55 * ((b * 37 % 10) / 10)) * R;
      const bx = sx + Math.cos(ang) * dist;
      const by = sy + Math.sin(ang) * dist * 0.7;
      const br = R * (0.4 + 0.35 * ((b * 53 % 10) / 10));
      const col = cols[b % cols.length];
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, rgba(col, 0.14 * nebula));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }
    for (let s = 0; s < 14; s++) {
      const a = (s * 99 % 360) * Math.PI / 180;
      const d = ((s * 61 % 10) / 10) * R * 0.9;
      const px = sx + Math.cos(a) * d, py = sy + Math.sin(a) * d * 0.7;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + s));
      ctx.fillStyle = rgba([255, 255, 255], tw * 0.5 * nebula);
      ctx.beginPath(); ctx.arc(px, py, 1.1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Halo glow
  const hr = haloR * pulse;
  const hg = ctx.createRadialGradient(sx, sy, 0, sx, sy, hr);
  hg.addColorStop(0, rgba(halo, 0.5));
  hg.addColorStop(0.4, rgba(halo, 0.18));
  hg.addColorStop(1, rgba(halo, 0));
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(sx, sy, hr, 0, Math.PI * 2); ctx.fill();

  // Supernova shockwave + spikes
  if (nova > 0.01) {
    for (let r = 0; r < 2; r++) {
      const rp = (t * 0.5 + r * 0.5) % 1;
      const rad = rp * 270 * k;
      ctx.beginPath(); ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.strokeStyle = rgba([220, 235, 255], (1 - rp) * 0.5 * nova);
      ctx.lineWidth = 1 + (1 - rp) * 3;
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * 0.12;
      const len = (110 + 34 * Math.sin(t * 5 + i)) * k * nova;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      ctx.strokeStyle = rgba([255, 255, 255], 0.14 * nova);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Core
  const cr = Math.max(2, coreR * pulse);
  const cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, cr);
  cg.addColorStop(0, 'rgba(255,255,255,1)');
  cg.addColorStop(0.5, rgba(core, 1));
  cg.addColorStop(1, rgba(core, 0));
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(sx, sy, cr, 0, Math.PI * 2); ctx.fill();

  ctx.beginPath();
  ctx.arc(sx, sy, Math.max(2, coreR * 0.32), 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Neutron-star accretion ring + jets
  if (ring > 0.01) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.shadowColor = 'rgba(120,180,255,0.8)';
    ctx.shadowBlur = 10 * ring;
    ctx.beginPath();
    ctx.ellipse(0, 0, 50 * k, 15 * k, 0, 0, Math.PI * 2);
    ctx.strokeStyle = rgba([150, 200, 255], 0.85 * ring);
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -12 * k); ctx.lineTo(0, -62 * k);
    ctx.moveTo(0, 12 * k);  ctx.lineTo(0, 62 * k);
    ctx.strokeStyle = rgba([180, 220, 255], 0.5 * ring);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}
