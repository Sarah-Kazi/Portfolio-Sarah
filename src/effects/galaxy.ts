import Parrallax from '../parallax/parallax';

function gaussRand(): number {
  const u1 = Math.max(Math.random(), 1e-10);
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function drawGalaxy(ctx: CanvasRenderingContext2D, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const R  = size * 0.36;
  const flatness = 0.46;

  ctx.clearRect(0, 0, size, size);


  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.2);
  ctx.scale(1, flatness);
  const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.15);
  haze.addColorStop(0,   'rgba(60,20,120,0.20)');
  haze.addColorStop(0.5, 'rgba(30,10,80, 0.10)');
  haze.addColorStop(1,   'rgba(0, 0, 0,  0)');
  ctx.fillStyle = haze;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const nebulae = [
    { ox:  R*0.42, oy:  R*0.18, rx: R*0.55, ry: R*0.28, angle:  0.40, rgb:'80,20,180',   op:0.15 },
    { ox: -R*0.44, oy: -R*0.18, rx: R*0.55, ry: R*0.27, angle: -0.40, rgb:'30,50,180',   op:0.14 },
    { ox:  R*0.18, oy:  R*0.46, rx: R*0.40, ry: R*0.22, angle:  0.90, rgb:'0,90,170',    op:0.11 },
    { ox: -R*0.20, oy: -R*0.44, rx: R*0.38, ry: R*0.20, angle: -0.90, rgb:'130,20,100',  op:0.10 },
    { ox:  R*0.62, oy: -R*0.10, rx: R*0.28, ry: R*0.16, angle:  0.20, rgb:'0,130,150',   op:0.09 },
    { ox: -R*0.58, oy:  R*0.12, rx: R*0.28, ry: R*0.15, angle: -0.20, rgb:'150,30,80',   op:0.08 },
    { ox:  0,      oy:  0,      rx: R*0.28, ry: R*0.14, angle:  0.00, rgb:'70,0,140',    op:0.22 },
    { ox:  R*0.25, oy: -R*0.35, rx: R*0.22, ry: R*0.12, angle:  0.60, rgb:'0,100,180',   op:0.08 },
  ];

  for (const n of nebulae) {
    ctx.save();
    ctx.translate(cx + n.ox, cy + n.oy * flatness);
    ctx.rotate(n.angle);
    ctx.scale(1, n.ry / n.rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
    g.addColorStop(0,   `rgba(${n.rgb},${n.op})`);
    g.addColorStop(0.5, `rgba(${n.rgb},${(n.op * 0.35).toFixed(3)})`);
    g.addColorStop(1,   `rgba(${n.rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }


  const winding  = Math.PI * 2.8;
  const numArms  = 2;
  const armStars = 900;

  const innerColors = ['220,210,255','210,205,255','230,220,255','240,235,255'];
  const midColors   = ['180,215,255','160,200,255','200,190,255','220,225,255','190,220,255'];
  const outerColors = ['200,155,255','255,165,205','150,235,255','180,205,255','210,160,255'];

  for (let arm = 0; arm < numArms; arm++) {
    const baseAngle = Math.PI * arm;
    for (let j = 0; j < armStars; j++) {
      const t      = Math.pow(Math.random(), 0.85);
      const dist   = t * R * 0.96;
      const spread = gaussRand() * 0.26 * (0.35 + t * 0.85);
      const angle  = baseAngle + t * winding + spread;

      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist * flatness;

      const sz  = (1.8 - t * 0.6) * Math.random() + 0.2;
      const op  = (0.95 - t * 0.45) * (0.45 + Math.random() * 0.55);

      const palette = t < 0.25 ? innerColors : t < 0.65 ? midColors : outerColors;
      const col = palette[Math.floor(Math.random() * palette.length)];

      ctx.beginPath();
      ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${op.toFixed(2)})`;
      ctx.fill();
    }
  }


  const discColors = ['190,185,255','200,195,255','180,190,255','170,180,255'];
  for (let i = 0; i < 500; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.pow(Math.random(), 1.2) * R * 0.90;
    const x  = cx + Math.cos(angle) * dist;
    const y  = cy + Math.sin(angle) * dist * flatness;
    const sz = Math.random() * 0.8 + 0.1;
    const op = (0.08 + Math.random() * 0.18) * (1 - dist / R * 0.5);
    const c  = discColors[Math.floor(Math.random() * discColors.length)];
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c},${op.toFixed(2)})`;
    ctx.fill();
  }


  const fieldColors = ['200,205,255','220,215,255','180,205,255','210,205,255'];
  for (let i = 0; i < 300; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.pow(Math.random(), 1.6) * R * 0.92;
    const x  = cx + Math.cos(angle) * dist;
    const y  = cy + Math.sin(angle) * dist * flatness;
    const sz = Math.random() * 0.9 + 0.1;
    const op = (0.10 + Math.random() * 0.22) * (1 - dist / R * 0.6);
    const c  = fieldColors[Math.floor(Math.random() * fieldColors.length)];
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c},${op.toFixed(2)})`;
    ctx.fill();
  }

}

export default function initializeGalaxy(parallax: Parrallax) {
  // Inject rotation keyframe once
  if (!document.getElementById('galaxy-spin-style')) {
    const style = document.createElement('style');
    style.id = 'galaxy-spin-style';
    style.textContent = `
      @keyframes galaxySpin {
        from { transform: rotate(0deg);   }
        to   { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Wrapper: centers the canvas via absolute positioning
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:absolute;top:50%;left:50%;pointer-events:none;';

  // Canvas: rotation animation, centered via negative margins (set in resize)
  const canvas = document.createElement('canvas');
  canvas.style.cssText = [
    'display:block',
    'pointer-events:none',
    'transform-origin:center',
    'animation:galaxySpin 220s linear infinite',
    'opacity:0.90',
  ].join(';');

  wrapper.appendChild(canvas);

  const bgLayer = parallax.getLayers()[4];
  bgLayer.element.insertBefore(wrapper, bgLayer.element.firstChild);

  const ctx = canvas.getContext('2d')!;

  function resize() {
    const size = Math.round(Math.max(window.innerWidth, window.innerHeight) * 1.55);
    canvas.width  = size;
    canvas.height = size;
    canvas.style.marginLeft = `${-size / 2}px`;
    canvas.style.marginTop  = `${-size / 2}px`;
    drawGalaxy(ctx, size);
  }

  window.addEventListener('resize', resize);
  resize();
}
