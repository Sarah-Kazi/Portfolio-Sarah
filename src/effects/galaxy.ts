import Parrallax from '../parallax/parallax';

function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.46;

  ctx.clearRect(0, 0, w, h);

  // Nebula layers — deep purples, teals, magentas
  const nebulae = [
    { x: cx,        y: cy,        rx: radius,        ry: radius * 0.50, angle:  0.18, rgb: '60,0,160',     a: 0.28 },
    { x: cx - 100,  y: cy + 80,   rx: radius * 0.72, ry: radius * 0.42, angle: -0.30, rgb: '0,80,180',     a: 0.20 },
    { x: cx + 120,  y: cy - 90,   rx: radius * 0.60, ry: radius * 0.36, angle:  0.52, rgb: '120,30,220',   a: 0.17 },
    { x: cx - 60,   y: cy - 120,  rx: radius * 0.50, ry: radius * 0.30, angle: -0.15, rgb: '0,160,200',    a: 0.13 },
    { x: cx + 60,   y: cy + 140,  rx: radius * 0.46, ry: radius * 0.27, angle:  0.40, rgb: '180,20,110',   a: 0.10 },
    { x: cx - 20,   y: cy + 20,   rx: radius * 0.32, ry: radius * 0.20, angle:  0.00, rgb: '80,0,180',     a: 0.32 },
    { x: cx + 80,   y: cy - 40,   rx: radius * 0.38, ry: radius * 0.22, angle:  0.70, rgb: '0,200,180',    a: 0.09 },
  ];

  for (const n of nebulae) {
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate(n.angle);
    ctx.scale(1, n.ry / n.rx);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
    grad.addColorStop(0, `rgba(${n.rgb},${n.a})`);
    grad.addColorStop(0.5, `rgba(${n.rgb},${n.a * 0.4})`);
    grad.addColorStop(1, `rgba(${n.rgb},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Star colors — cyan/purple/lavender palette, no plain white
  const starColors = [
    '34,211,238',   // cyan
    '139,92,246',   // purple
    '196,181,253',  // lavender
    '167,139,250',  // soft violet
    '224,242,255',  // ice blue
    '34,211,238',   // cyan again (weighted)
    '103,232,249',  // light cyan
    '192,132,252',  // light purple
  ];

  const pick = () => starColors[Math.floor(Math.random() * starColors.length)];

  // Spiral arm stars (2 arms, winding outward)
  const armCount = 2;
  for (let i = 0; i < 520; i++) {
    const arm = i % armCount;
    const t = Math.pow(Math.random(), 1.4);
    const dist = t * radius * 0.92;
    const spread = (Math.random() - 0.5) * 0.7;
    const armAngle = (arm * Math.PI) + t * Math.PI * 2.6 + spread;
    const x = cx + Math.cos(armAngle) * dist;
    const y = cy + Math.sin(armAngle) * dist * 0.50;
    const size = Math.random() * 1.5 + 0.2;
    const opacity = (1 - t * 0.65) * (0.35 + Math.random() * 0.65);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${pick()},${opacity.toFixed(2)})`;
    ctx.fill();
  }

  // Scattered halo stars
  for (let i = 0; i < 200; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.pow(Math.random(), 2.2) * radius * 0.90;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist * 0.50;
    const size = Math.random() * 0.9 + 0.1;
    const t = dist / (radius * 0.90);
    const opacity = (1 - t * 0.8) * (0.15 + Math.random() * 0.35);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${pick()},${opacity.toFixed(2)})`;
    ctx.fill();
  }

  // Core glow — deep violet/cyan, intentionally NOT white
  const coreR = radius * 0.22;
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  coreGrad.addColorStop(0,    'rgba(190,120,255,0.60)');
  coreGrad.addColorStop(0.15, 'rgba(100,50,240,0.42)');
  coreGrad.addColorStop(0.40, 'rgba(34,211,238,0.18)');
  coreGrad.addColorStop(0.70, 'rgba(60,0,160,0.08)');
  coreGrad.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  // Inner bright nucleus — violet, not white
  const pointR = coreR * 0.28;
  const pointGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pointR);
  pointGrad.addColorStop(0,   'rgba(210,170,255,0.92)');
  pointGrad.addColorStop(0.4, 'rgba(140,70,240,0.55)');
  pointGrad.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = pointGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, pointR, 0, Math.PI * 2);
  ctx.fill();
}

export default function initializeGalaxy(parallax: Parrallax) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';

  const bgLayer = parallax.getLayers()[4];
  bgLayer.element.insertBefore(canvas, bgLayer.element.firstChild);

  const ctx = canvas.getContext('2d')!;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(ctx, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);
  requestAnimationFrame(resize);
}
