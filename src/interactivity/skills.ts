
interface Star {
  x: number;
  y: number;
  name: string;
  size: number;
  group: number;
  phase: number;
  labelDir: 'r' | 'l' | 't' | 'b';
}

interface Group {
  name: string;
  color: string;
  rgb: string;
  haloX: number;
  haloY: number;
  haloR: number;
}

const GROUPS: Group[] = [
  { name: 'LANGUAGES',        color: '#7dd3fc', rgb: '125,211,252', haloX: 0.58, haloY: 0.24, haloR: 0.18 },
  { name: 'MACHINE LEARNING', color: '#fcd34d', rgb: '252,211,77',  haloX: 0.85, haloY: 0.30, haloR: 0.20 },
  { name: 'WEB DEVELOPMENT',  color: '#c4b5fd', rgb: '196,181,253', haloX: 0.73, haloY: 0.78, haloR: 0.24 },
];

const STARS: Star[] = [
  
  { name: 'Python',     x: 0.58, y: 0.13, size: 10, group: 0, phase: 0.0, labelDir: 't' },
  { name: 'C',          x: 0.50, y: 0.22, size: 7,  group: 0, phase: 0.7, labelDir: 'l' },
  { name: 'TypeScript', x: 0.66, y: 0.22, size: 9,  group: 0, phase: 1.0, labelDir: 'r' },
  { name: 'C++',        x: 0.53, y: 0.34, size: 8,  group: 0, phase: 1.4, labelDir: 'l' },
  { name: 'JavaScript', x: 0.63, y: 0.34, size: 10, group: 0, phase: 0.3, labelDir: 'r' },

  { name: 'NumPy',           x: 0.80, y: 0.13, size: 7,  group: 1, phase: 0.2, labelDir: 't' },
  { name: 'Pandas',          x: 0.90, y: 0.13, size: 7,  group: 1, phase: 0.9, labelDir: 't' },
  { name: 'PyTorch',         x: 0.79, y: 0.24, size: 9,  group: 1, phase: 1.6, labelDir: 'l' },
  { name: 'TensorFlow',      x: 0.91, y: 0.24, size: 9,  group: 1, phase: 0.5, labelDir: 'r' },
  { name: 'Neural Networks', x: 0.85, y: 0.33, size: 8,  group: 1, phase: 1.2, labelDir: 'r' },
  { name: 'Gen AI',          x: 0.78, y: 0.42, size: 7,  group: 1, phase: 0.1, labelDir: 'l' },
  { name: 'LLMs',            x: 0.91, y: 0.42, size: 7,  group: 1, phase: 1.8, labelDir: 'r' },
  { name: 'RAGs',            x: 0.85, y: 0.50, size: 6,  group: 1, phase: 0.6, labelDir: 'b' },


  { name: 'React',      x: 0.66, y: 0.66, size: 11, group: 2, phase: 1.1, labelDir: 'l' },
  { name: 'Next.js',    x: 0.78, y: 0.66, size: 9,  group: 2, phase: 1.7, labelDir: 'r' },
  { name: 'Tailwind',   x: 0.57, y: 0.74, size: 7,  group: 2, phase: 0.4, labelDir: 'l' },
  { name: 'Node',       x: 0.72, y: 0.77, size: 9,  group: 2, phase: 1.5, labelDir: 'b' },
  { name: 'Express',    x: 0.85, y: 0.74, size: 7,  group: 2, phase: 0.2, labelDir: 'r' },
  { name: 'MongoDB',    x: 0.62, y: 0.86, size: 7,  group: 2, phase: 0.8, labelDir: 'l' },
  { name: 'SQLite',     x: 0.74, y: 0.90, size: 6,  group: 2, phase: 1.9, labelDir: 'b' },
  { name: 'Electron',   x: 0.87, y: 0.87, size: 6,  group: 2, phase: 1.3, labelDir: 'r' },
];

const LINES: [number, number][] = [
  
  [0, 1], [1, 3], [3, 4], [4, 2], [2, 0],
  
  [5, 7], [6, 8], [7, 8], [7, 9], [8, 9], [9, 10], [9, 11], [10, 12], [11, 12],
 
  [13, 14], [13, 15], [13, 16], [14, 16], [14, 17], [16, 18], [16, 19], [17, 20], [19, 20], [15, 18], [18, 19],
];


const LINE_GROUP: number[] = LINES.map(([a]) => STARS[a].group);
const LINE_ORDER: number[] = (() => {
  const seen: Record<number, number> = {};
  return LINES.map((_, i) => {
    const g = LINE_GROUP[i];
    const o = seen[g] ?? 0;
    seen[g] = o + 1;
    return o;
  });
})();

const GROUP_TITLES = [
  { text: 'LANGUAGES',         x: 0.58, y: 0.05, group: 0 },
  { text: 'MACHINE LEARNING',  x: 0.85, y: 0.05, group: 1 },
  { text: 'WEB DEVELOPMENT',   x: 0.72, y: 0.58, group: 2 },
];


const LINE_DELAY_START  = 0.25;
const LINE_DELAY_STEP   = 0.04;
const LINE_DURATION     = 0.5;
const STAR_DELAY_START  = 1.10;
const STAR_DELAY_STEP   = 0.045;
const STAR_DURATION     = 0.35;
const TITLE_DELAY_START = 0.05;
const TITLE_DURATION    = 0.6;
const ANCHOR_LOCK_T = 0.9;


const HOVER_DIST     = 60;   
const DIM_ALPHA      = 0.22;  
const TRACE_STEP     = 0.05;  
const TRACE_DUR      = 0.34;  
const GROUP_RAMP_S   = 0.25; 

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function drawHalos(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  offX: number, offY: number, hoveredGroup: number,
) {
  for (let gi = 0; gi < GROUPS.length; gi++) {
    const g = GROUPS[gi];
    const hx = g.haloX * w + offX;
    const hy = g.haloY * h + offY;
    const hr = g.haloR * Math.min(w, h);
    // Focused group's halo intensifies; the others recede.
    const k = hoveredGroup < 0 ? 1 : gi === hoveredGroup ? 1.6 : 0.35;
    const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
    grad.addColorStop(0,   `rgba(${g.rgb},${(0.10 * k).toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(${g.rgb},${(0.03 * k).toFixed(3)})`);
    grad.addColorStop(1,   `rgba(${g.rgb},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderBackdrop(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  offX: number, offY: number, hoveredGroup: number,
) {
  
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(w, 0, w * 0.30, 0);
  bg.addColorStop(0,    'rgba(5, 3, 18, 0.42)');
  bg.addColorStop(0.70, 'rgba(5, 3, 18, 0.38)');
  bg.addColorStop(0.95, 'rgba(5, 3, 18, 0.10)');
  bg.addColorStop(1,    'rgba(5, 3, 18, 0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  drawHalos(ctx, w, h, offX, offY, hoveredGroup);
}

function renderConstellation(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  offX: number, offY: number,   // parallax displacement of the whole scene
  t: number, entryT: number,
  hoveredIdx: number,
  hoveredGroup: number,         // group of the hovered star, or -1
  traceElapsed: number,         // s since the current group was focused
) {
  const hovering = hoveredGroup >= 0;

 
  for (let i = 0; i < LINES.length; i++) {
    const [ai, bi] = LINES[i];
    const a = STARS[ai];
    const b = STARS[bi];
    const entryStart = LINE_DELAY_START + i * LINE_DELAY_STEP;
    const entryP     = clamp01((entryT - entryStart) / LINE_DURATION);
    if (entryP <= 0) continue;

    const isActive = hovering && LINE_GROUP[i] === hoveredGroup;
    const isDim    = hovering && LINE_GROUP[i] !== hoveredGroup;

    // The focused group re-draws from 0; the leading tip sparks while it grows.
    let drawFrac = entryP;
    let tracing  = false;
    if (isActive) {
      drawFrac = clamp01((traceElapsed - LINE_ORDER[i] * TRACE_STEP) / TRACE_DUR);
      tracing  = drawFrac > 0 && drawFrac < 1;
    }
    if (drawFrac <= 0) continue;

    const g  = GROUPS[a.group];
    const ax = a.x * w + offX;
    const ay = a.y * h + offY;
    const bx = b.x * w + offX;
    const by = b.y * h + offY;
    const ex = ax + (bx - ax) * drawFrac;
    const ey = ay + (by - ay) * drawFrac;

    if (isActive) {
      ctx.strokeStyle = `rgba(${g.rgb},1.0)`;
      ctx.lineWidth   = 1.8;
    } else if (isDim) {
      ctx.strokeStyle = `rgba(${g.rgb},${DIM_ALPHA * 0.7})`;
      ctx.lineWidth   = 1.0;
    } else {
      ctx.strokeStyle = `rgba(${g.rgb},0.70)`;
      ctx.lineWidth   = 1.2;
    }
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Spark riding the leading edge of a tracing line.
    if (tracing) {
      const glowR = 16;
      const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, glowR);
      glow.addColorStop(0,    'rgba(255,255,255,1.0)');
      glow.addColorStop(0.3,  `rgba(${g.rgb},0.8)`);
      glow.addColorStop(1,    `rgba(${g.rgb},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ex, ey, glowR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

 
  for (let i = 0; i < GROUP_TITLES.length; i++) {
    const gt = GROUP_TITLES[i];
    const tp = clamp01((entryT - TITLE_DELAY_START - i * 0.15) / TITLE_DURATION);
    if (tp <= 0) continue;

    const g       = GROUPS[gt.group];
    const isActive = hovering && gt.group === hoveredGroup;
    const isDim    = hovering && gt.group !== hoveredGroup;
    const tx = gt.x * w + offX;
    const ty = gt.y * h + offY;

    ctx.save();
    ctx.globalAlpha  = tp * (isDim ? DIM_ALPHA : 1);
    ctx.font         = `${isActive ? 700 : 600} 16px "JetBrains Mono", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = `rgba(${g.rgb},${isActive ? 1 : 0.9})`;
    ctx.fillText(gt.text, tx, ty);

    const tw2 = ctx.measureText(gt.text).width;
    ctx.beginPath();
    ctx.moveTo(tx - tw2 / 2 - 6, ty + 12);
    ctx.lineTo(tx + tw2 / 2 + 6, ty + 12);
    ctx.strokeStyle = `rgba(${g.rgb},${isActive ? 0.6 : 0.32})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.restore();
  }
  for (let i = 0; i < STARS.length; i++) {
    const s     = STARS[i];
    const start = STAR_DELAY_START + i * STAR_DELAY_STEP;
    const popP  = clamp01((entryT - start) / STAR_DURATION);
    if (popP <= 0) continue;

    const pop      = 1 - Math.pow(1 - popP, 3);
    const g        = GROUPS[s.group];
    const sx       = s.x * w + offX;
    const sy       = s.y * h + offY;
    const pulse    = 0.80 + 0.20 * Math.sin(t * 1.0 + s.phase);

    const isHovered   = i === hoveredIdx;
    const isActive    = hovering && s.group === hoveredGroup;
    const isDim       = hovering && s.group !== hoveredGroup;
    const groupRamp   = isActive ? clamp01(traceElapsed / GROUP_RAMP_S) : 0;
    const scaleK      = 1 + (isHovered ? 0.45 : 0) + groupRamp * 0.18;
    const brightK     = 1 + (isHovered ? 0.50 : 0) + groupRamp * 0.45;
    const dimK        = isDim ? DIM_ALPHA : 1;

    // Glow
    const glowR = s.size * 3.0 * pop * scaleK;
    const glow  = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
    glow.addColorStop(0,    `rgba(${g.rgb},${Math.min(1, pulse * 0.45 * pop * brightK * dimK).toFixed(2)})`);
    glow.addColorStop(0.45, `rgba(${g.rgb},${Math.min(1, pulse * 0.12 * pop * brightK * dimK).toFixed(2)})`);
    glow.addColorStop(1,    `rgba(${g.rgb},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(sx, sy, s.size * 0.55 * pop * scaleK, 0, Math.PI * 2);
    ctx.fillStyle   = g.color;
    ctx.globalAlpha = pop * dimK;
    ctx.fill();
    ctx.globalAlpha = 1;

    // White-hot centre
    ctx.beginPath();
    ctx.arc(sx, sy, s.size * 0.28 * pop * scaleK, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, pulse * 0.95 * pop * brightK * dimK).toFixed(2)})`;
    ctx.fill();

    // Label
    if (pop > 0.4) {
      const emphasised = isHovered || isActive;
      ctx.font         = `${emphasised ? 700 : 500} ${emphasised ? 14 : 13}px "JetBrains Mono", monospace`;
      ctx.fillStyle    = emphasised ? '#ffffff' : `rgba(${g.rgb},0.88)`;
      ctx.globalAlpha  = Math.min(1, (pop - 0.4) / 0.6) * dimK;
      ctx.shadowColor  = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur   = 6;
      const pad = s.size + 10;
      let lx = sx, ly = sy;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      if (s.labelDir === 'r') { lx = sx + pad;          ctx.textAlign = 'left';   ctx.textBaseline = 'middle'; }
      if (s.labelDir === 'l') { lx = sx - pad;          ctx.textAlign = 'right';  ctx.textBaseline = 'middle'; }
      if (s.labelDir === 't') { lx = sx; ly = sy - pad; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; }
      if (s.labelDir === 'b') { lx = sx; ly = sy + pad; ctx.textAlign = 'center'; ctx.textBaseline = 'top';    }
      ctx.fillText(s.name, lx, ly);
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;
    }
  }
}

function render(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  offX: number, offY: number,
  t: number, entryT: number,
  hoveredIdx: number,
  hoveredGroup: number,
  traceElapsed: number,
) {
  renderBackdrop(ctx, w, h, offX, offY, hoveredGroup);
  renderConstellation(ctx, w, h, offX, offY, t, entryT, hoveredIdx, hoveredGroup, traceElapsed);
}

function ensureCanvas(): HTMLCanvasElement {
  const existing = document.getElementById('skills-canvas') as HTMLCanvasElement | null;
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.id = 'skills-canvas';
  canvas.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:100vw',
    'height:100vh',
    'pointer-events:none',
    'z-index:500',
    'opacity:0',
    'transition:opacity 0.5s ease',
  ].join(';');
  document.body.appendChild(canvas);
  return canvas;
}

export default function initializeSkills() {
  const section = document.getElementById('tech-stack');
  if (!section) return;

  const canvas = ensureCanvas();
  const ctx    = canvas.getContext('2d')!;

  let rafId        = 0;
  let running      = false;
  let entryStartTs = 0;

  let mouseX = -1;
  let mouseY = -1;
  let hoveredIdx     = -1;
  let hoveredGroup   = -1;
  let groupHoverTs   = 0;  
  let anchorLocked = false;
  let anchorX = 0;
  let anchorY = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    if (!running) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function planetCentre(): { x: number; y: number } | null {
    const planet = document.getElementById('planet-4');
    if (!planet) return null;
    const r = planet.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function loop(ts: number) {
    if (entryStartTs === 0) entryStartTs = ts;
    const t      = ts / 1000;
    const entryT = (ts - entryStartTs) / 1000;
    const w      = window.innerWidth;
    const h      = window.innerHeight;


    let offX = 0;
    let offY = 0;
    const centre = planetCentre();
    if (centre) {
      if (!anchorLocked) {
        anchorX = centre.x;
        anchorY = centre.y;
        if (entryT > ANCHOR_LOCK_T) anchorLocked = true;
      } else {
        offX = centre.x - anchorX;
        offY = centre.y - anchorY;
      }
    }

    
    let newHovered = -1;
    if (mouseX >= 0 && mouseY >= 0) {
      let bestSq = HOVER_DIST * HOVER_DIST;
      for (let i = 0; i < STARS.length; i++) {
        const dx = mouseX - (STARS[i].x * w + offX);
        const dy = mouseY - (STARS[i].y * h + offY);
        const dSq = dx * dx + dy * dy;
        if (dSq < bestSq) { bestSq = dSq; newHovered = i; }
      }
    }
    hoveredIdx = newHovered;

    
    const newGroup = hoveredIdx >= 0 ? STARS[hoveredIdx].group : -1;
    if (newGroup !== hoveredGroup) {
      hoveredGroup = newGroup;
      groupHoverTs = ts;
    }
    const traceElapsed = hoveredGroup >= 0 ? (ts - groupHoverTs) / 1000 : 0;

    render(ctx, w, h, offX, offY, t, entryT, hoveredIdx, hoveredGroup, traceElapsed);
    rafId = requestAnimationFrame(loop);
  }

  new MutationObserver(() => {
    if (section.style.display === 'block' && !running) {
      running = true;
      entryStartTs = 0;
      mouseX = mouseY = -1;
      hoveredIdx = -1;
      hoveredGroup = -1;
      groupHoverTs = 0;
      anchorLocked = false;
      canvas.style.transition = 'opacity 0.5s ease';
      canvas.style.opacity = '1';
      rafId = requestAnimationFrame(loop);
    } else if (section.style.display !== 'block' && running) {
      running = false;
      canvas.style.transition = 'none';
      canvas.style.opacity = '0';
      cancelAnimationFrame(rafId);
    }
  }).observe(section, { attributes: true, attributeFilter: ['style'] });
}
