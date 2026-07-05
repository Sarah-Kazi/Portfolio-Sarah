import Parrallax from '../parallax/parallax';

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trailLength: number;
  opacity: number;
  life: number;
  maxLife: number;
}

function spawnStar(w: number, h: number): ShootingStar {
  const fromTop = Math.random() > 0.25;
  const angle = Math.PI / 5 + Math.random() * (Math.PI / 6);
  const speed = 380 + Math.random() * 320;

  const x = fromTop ? Math.random() * w * 0.9 : -10;
  const y = fromTop ? -10 : Math.random() * h * 0.45;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    trailLength: 70 + Math.random() * 90,
    opacity: 0,
    life: 0,
    maxLife: 0.7 + Math.random() * 0.7,
  };
}

function drawStar(ctx: CanvasRenderingContext2D, star: ShootingStar) {
  const tailX = star.x - (star.vx / Math.hypot(star.vx, star.vy)) * star.trailLength;
  const tailY = star.y - (star.vy / Math.hypot(star.vx, star.vy)) * star.trailLength;

  const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
  grad.addColorStop(0,   'rgba(255,255,255,0)');
  grad.addColorStop(0.6, `rgba(180,220,255,${(star.opacity * 0.4).toFixed(3)})`);
  grad.addColorStop(1,   `rgba(255,255,255,${star.opacity.toFixed(3)})`);

  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(star.x, star.y);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 4);
  glow.addColorStop(0, `rgba(255,255,255,${star.opacity.toFixed(3)})`);
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

export default function initializeShootingStars(parallax: Parrallax) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';

  parallax.getLayers()[2].element.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const stars: ShootingStar[] = [];
  let lastTime       = performance.now();
  let timeSinceSpawn = 0;
  let nextSpawn      = 2 + Math.random() * 3;

  function animate(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    timeSinceSpawn += dt;
    if (timeSinceSpawn >= nextSpawn) {
      stars.push(spawnStar(canvas.width, canvas.height));
      timeSinceSpawn = 0;
      nextSpawn = 3 + Math.random() * 5;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      const t = s.life / s.maxLife;
      s.opacity = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;

      if (s.life >= s.maxLife) { stars.splice(i, 1); continue; }
      drawStar(ctx, s);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
