export function initializeCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const cursorRing = document.createElement('div');
  cursorRing.className = 'cursor-ring';
  document.body.appendChild(cursorRing);

  const cursorRingOuter = document.createElement('div');
  cursorRingOuter.className = 'cursor-ring-outer';
  document.body.appendChild(cursorRingOuter);

  const trailContainer = document.createElement('div');
  trailContainer.className = 'cursor-trail-container';
  document.body.appendChild(trailContainer);

  const particleCount = 16;
  const particles: HTMLElement[] = [];
  const particlePositions = Array.from({ length: particleCount }, () => ({ x: 0, y: 0 }));

  // Color fades white → cyan → indigo → purple along the tail
  const trailColors = [
    '#ffffff', '#e0f9ff', '#67e8f9',
    '#67e8f9', '#22d3ee', '#22d3ee',
    '#0ea5e9', '#38bdf8', '#818cf8',
    '#a78bfa', '#a855f7', '#9333ea',
    '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
  ];
  const trailSizes = [7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    const size = trailSizes[i];
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = `radial-gradient(circle, ${trailColors[i]} 0%, transparent 70%)`;
    particle.style.boxShadow = `0 0 ${size * 2}px ${trailColors[i]}80`;
    particle.style.opacity = String(1 - i * 0.07);
    trailContainer.appendChild(particle);
    particles.push(particle);
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let ringX = mouseX;
  let ringY = mouseY;
  let outerRingX = mouseX;
  let outerRingY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (Math.random() < 0.22) createSpark(e.clientX, e.clientY);
  });

  document.addEventListener('mousedown', (e) => {
    createRipple(e.clientX, e.clientY);
    cursor.classList.add('clicking');
    cursorRing.classList.add('clicking');
    cursorRingOuter.classList.add('clicking');
  });

  document.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
    cursorRing.classList.remove('clicking');
    cursorRingOuter.classList.remove('clicking');
  });

  function createRipple(x: number, y: number) {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  function createSpark(x: number, y: number) {
    const count = Math.floor(Math.random() * 3) + 1;
    const sparkColors = ['#ffffff', '#67e8f9', '#22d3ee', '#a78bfa', '#a855f7', '#fbbf24', '#38bdf8'];
    for (let s = 0; s < count; s++) {
      const spark = document.createElement('div');
      spark.className = 'cursor-spark';
      const size = Math.random() * 3.5 + 1.5;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 50 + 25;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      spark.style.left = x + 'px';
      spark.style.top = y + 'px';
      spark.style.width = size + 'px';
      spark.style.height = size + 'px';
      spark.style.background = color;
      spark.style.boxShadow = `0 0 ${size * 3}px ${color}`;
      document.body.appendChild(spark);

      const duration = 400 + Math.random() * 300;
      const start = performance.now();
      function animateSpark(time: number) {
        const progress = (time - start) / duration;
        if (progress >= 1) { spark.remove(); return; }
        spark.style.left = (x + dx * progress) + 'px';
        spark.style.top = (y + dy * progress) + 'px';
        spark.style.opacity = String((1 - progress) * (1 - progress));
        requestAnimationFrame(animateSpark);
      }
      requestAnimationFrame(animateSpark);
    }
  }

  let frame = 0;
  function animate() {
    frame++;

    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    outerRingX += (mouseX - outerRingX) * 0.08;
    outerRingY += (mouseY - outerRingY) * 0.08;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    cursorRingOuter.style.left = outerRingX + 'px';
    cursorRingOuter.style.top = outerRingY + 'px';

    cursorRing.style.transform = `translate(-50%, -50%) rotate(${frame * 2}deg)`;
    cursorRingOuter.style.transform = `translate(-50%, -50%) rotate(${-frame * 1.3}deg)`;

    for (let i = 0; i < particleCount; i++) {
      const prevX = i === 0 ? cursorX : particlePositions[i - 1].x;
      const prevY = i === 0 ? cursorY : particlePositions[i - 1].y;
      const lerpFactor = 0.25 - i * 0.015;
      particlePositions[i].x += (prevX - particlePositions[i].x) * lerpFactor;
      particlePositions[i].y += (prevY - particlePositions[i].y) * lerpFactor;
      particles[i].style.left = particlePositions[i].x + 'px';
      particles[i].style.top = particlePositions[i].y + 'px';
    }

    requestAnimationFrame(animate);
  }

  particlePositions.forEach((pos) => { pos.x = mouseX; pos.y = mouseY; });
  animate();

  function addHover(el: Element | null, cls: string) {
    if (!el) return;
    el.addEventListener('mouseenter', () => {
      cursor.classList.add(cls);
      cursorRing.classList.add(cls);
      cursorRingOuter.classList.add(cls);
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove(cls);
      cursorRing.classList.remove(cls);
      cursorRingOuter.classList.remove(cls);
    });
  }

  document.querySelectorAll('.planet').forEach(p => addHover(p, 'hover-planet'));
  addHover(document.getElementById('go-back-button'), 'hover-button');
  addHover(document.querySelector('.term-dot.close'), 'hover-close');

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';
    cursorRingOuter.style.opacity = '0';
    trailContainer.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '1';
    cursorRingOuter.style.opacity = '1';
    trailContainer.style.opacity = '1';
  });
}
