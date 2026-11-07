import { makePressable } from '../a11y';
import { play } from '../effects/sound';



export interface ImageItem {
  src: string;
  title: string;
}

interface CarouselConfig {
  id: string;        // root element id (#carousel-paintings, #carousel-clicks)
  anchorId: string;  // moon element id this carousel is glued to
  set: ImageItem[];
}

export const PAINTINGS: ImageItem[] = [
  { src: '/paintings/1.webp', title: 'Painting 01' },
  { src: '/paintings/2.webp', title: 'Painting 02' },
  { src: '/paintings/3.webp', title: 'Painting 03' },
  { src: '/paintings/4.webp', title: 'Painting 04' },
  { src: '/paintings/5.webp', title: 'Painting 05' },
  { src: '/paintings/6.webp', title: 'Painting 06' },
  { src: '/paintings/7.webp', title: 'Painting 07' },
  { src: '/paintings/8.webp', title: 'Painting 08' },
  { src: '/paintings/9.webp', title: 'Painting 09' },
  { src: '/paintings/10.webp', title: 'Painting 10' },
  { src: '/paintings/11.webp', title: 'Painting 11' },
  { src: '/paintings/12.webp', title: 'Painting 12' },
  { src: '/paintings/13.webp', title: 'Painting 13' },
  { src: '/paintings/14.webp', title: 'Painting 14' },
];

export const CLICKS: ImageItem[] = [
  { src: '/clicks/1.webp', title: 'Click 01' },
  { src: '/clicks/2.webp', title: 'Click 02' },
  { src: '/clicks/3.webp', title: 'Click 03' },
  { src: '/clicks/4.webp', title: 'Click 04' },
  { src: '/clicks/5.webp', title: 'Click 05' },
  { src: '/clicks/6.webp', title: 'Click 06' },
  { src: '/clicks/7.webp', title: 'Click 07' },
  { src: '/clicks/8.webp', title: 'Click 08' },
  { src: '/clicks/9.webp', title: 'Click 09' },
  { src: '/clicks/10.webp', title: 'Click 10' },
];

const CONFIGS: CarouselConfig[] = [
  { id: 'carousel-paintings', anchorId: 'moon-paintings', set: PAINTINGS },
  { id: 'carousel-clicks',    anchorId: 'moon-clicks',    set: CLICKS    },
];

// Per-carousel current image index: persists across open/close.
const indices: Record<string, number> = Object.fromEntries(
  CONFIGS.map(c => [c.id, 0]),
);

// Whichever carousel was opened most recently - keyboard arrows / Esc target it.
let focusedId: string | null = null;

// Parallax handle, so fullscreen can freeze the drifting scene behind it.
type ParallaxLike = { setMouseTrackingEnabled(enabled: boolean): void };
let parallaxRef: ParallaxLike | null = null;



function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function findConfig(id: string): CarouselConfig | undefined {
  return CONFIGS.find(c => c.id === id);
}

function parts(id: string) {
  const root = $(id);
  if (!root) return null;
  return {
    root,
    frame:   root.querySelector('.gc-frame')   as HTMLElement | null,
    caption: root.querySelector('.gc-caption') as HTMLElement | null,
    dots:    root.querySelector('.gc-dots')    as HTMLElement | null,
  };
}

function isOpen(id: string): boolean {
  return $(id)?.classList.contains('active') ?? false;
}

function anyOpen(): boolean {
  return CONFIGS.some(c => isOpen(c.id));
}



function renderImage(id: string) {
  const cfg = findConfig(id);
  const p   = parts(id);
  if (!cfg || !p || !p.frame || !p.caption || !p.dots) return;

  const item = cfg.set[indices[id]];

  p.frame.innerHTML = '';
  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.title;
  img.onerror = () => {
    p.frame!.innerHTML = `
      <div class="gc-placeholder">
        <p>Image not found</p>
        <code>${item.src}</code>
      </div>
    `;
  };
  p.frame.appendChild(img);

  p.caption.textContent = item.title;

  p.dots.innerHTML = '';
  for (let i = 0; i < cfg.set.length; i++) {
    const dot = document.createElement('button');
    dot.className = 'gc-dot' + (i === indices[id] ? ' active' : '');
    dot.setAttribute('aria-label', `Image ${i + 1}`);
    dot.addEventListener('click', () => {
      indices[id] = i;
      renderImage(id);
      focusedId = id;
    });
    p.dots.appendChild(dot);
  }
}

function positionCarousel(id: string) {
  const cfg = findConfig(id);
  if (!cfg) return;
  if (isFullscreen(id)) return;   // fullscreen fills the viewport via CSS, no pinning
  const anchor = $(cfg.anchorId);
  const root   = $(id);
  if (!anchor || !root) return;

  const rect = anchor.getBoundingClientRect();
  // 65px to the right of the moon, vertically centred on it via CSS
  // transform: translate(0, -50%).
  root.style.left = `${rect.right + 65}px`;
  root.style.top  = `${rect.top + rect.height / 2}px`;
}

function isFullscreen(id: string): boolean {
  return $(id)?.classList.contains('gc-fullscreen') ?? false;
}

function setFullscreen(id: string, on: boolean) {
  const root = $(id);
  if (!root) return;
  root.classList.toggle('gc-fullscreen', on);
  // Inline left/top from positionCarousel would override the CSS inset:0, so
  // clear them going in; positionCarousel re-pins them on the way out.
  if (on) { root.style.left = ''; root.style.top = ''; }
  const fsBtn = root.querySelector('.gc-fs') as HTMLElement | null;
  if (fsBtn) {
    fsBtn.textContent = on ? '⤡' : '⤢';
    fsBtn.title = on ? 'Exit full screen' : 'Full screen';
  }
  if (!on) positionCarousel(id);   // re-pin to the moon after leaving fullscreen
  const fs = anyFullscreen();
  // Freeze the drifting parallax and hide the Deorbit button while fullscreen.
  parallaxRef?.setMouseTrackingEnabled(!fs);
  const deorbit = $('go-back-button');
  if (deorbit) {
    // Only restore it when the gallery is still open (trackActive) — otherwise
    // this fires during gallery close and would re-show a hidden button.
    if (fs) deorbit.style.display = 'none';
    else if (trackActive) deorbit.style.display = 'block';
  }
}

function toggleFullscreen(id: string) {
  setFullscreen(id, !isFullscreen(id));
  focusedId = id;
}

function anyFullscreen(): boolean {
  return CONFIGS.some(c => isFullscreen(c.id));
}



function open(id: string) {
  // Re-clicking the same moon toggles its carousel off.
  if (isOpen(id)) { close(id); return; }
  play('moon');
  indices[id] = 0;
  renderImage(id);
  positionCarousel(id);
  $(id)?.classList.add('active');
  focusedId = id;
}

function close(id: string) {
  setFullscreen(id, false);
  $(id)?.classList.remove('active');
  if (focusedId === id) {
    // Pass focus to whichever other carousel is still open.
    focusedId = null;
    for (const cfg of CONFIGS) {
      if (cfg.id !== id && isOpen(cfg.id)) { focusedId = cfg.id; break; }
    }
  }
}

function closeAll() {
  for (const cfg of CONFIGS) close(cfg.id);
  focusedId = null;
}

function step(id: string, delta: number) {
  const cfg = findConfig(id);
  if (!cfg) return;
  const n = cfg.set.length;
  indices[id] = (indices[id] + delta + n) % n;
  play('step', { vary: 0.05 });
  renderImage(id);
  focusedId = id;
}



let trackRafId = 0;
let trackActive = false;

function trackScene() {
  const planet  = $('planet-5');
  const moonP   = $('moon-paintings');
  const moonC   = $('moon-clicks');
  const deorbit = $('go-back-button');
  if (!planet || !moonP || !moonC) return;

  const rect = planet.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;

  const orbitR = rect.width / 2 + 80;
  
  const extraRight = 110;
  // Paintings (top) and Clicks (bottom) share the same x and split vertically.
  // dy is the gap between them — smaller keeps the two moons (and their
  // carousels) closer so they stay in frame on larger screens.
  const dx = Math.cos(Math.PI / 4) * orbitR + extraRight;
  const dy = orbitR * 0.58;
  moonP.style.left = `${cx + dx}px`;
  moonP.style.top  = `${cy - dy}px`;
  moonC.style.left = `${cx + dx}px`;
  moonC.style.top  = `${cy + dy}px`;

  if (deorbit && deorbit.classList.contains('gallery-deorbit')) {
    deorbit.style.left      = `${cx}px`;
    deorbit.style.top       = `${rect.bottom - 80}px`;
    deorbit.style.transform = 'translateX(-50%)';
  }

  // Re-pin every open carousel to its anchor each frame.
  for (const cfg of CONFIGS) {
    if (isOpen(cfg.id)) positionCarousel(cfg.id);
  }
}

function startTracking() {
  if (trackActive) return;
  trackActive = true;

  const deorbit = $('go-back-button');
  if (deorbit) {
    document.body.appendChild(deorbit);
    deorbit.classList.add('gallery-deorbit');
  }

  const loop = () => {
    if (!trackActive) return;
    trackScene();
    trackRafId = requestAnimationFrame(loop);
  };
  loop();   // positions the moons synchronously before they're shown

  
  $('moon-paintings')?.classList.add('visible');
  $('moon-clicks')   ?.classList.add('visible');
}

function stopTracking() {
  trackActive = false;
  cancelAnimationFrame(trackRafId);
  $('moon-paintings')?.classList.remove('visible');
  $('moon-clicks')   ?.classList.remove('visible');

  const deorbit = $('go-back-button');
  if (deorbit) {
    deorbit.classList.remove('gallery-deorbit');
    deorbit.style.left      = '';
    deorbit.style.top       = '';
    deorbit.style.transform = '';
  }
}



export default function initializeGallery(parallax?: ParallaxLike) {
  parallaxRef = parallax ?? null;
  const moonP = $('moon-paintings');
  const moonC = $('moon-clicks');
  if (moonP) {
    document.body.appendChild(moonP);
    moonP.addEventListener('click', () => open('carousel-paintings'));
    makePressable(moonP, 'Paintings');
  }
  if (moonC) {
    document.body.appendChild(moonC);
    moonC.addEventListener('click', () => open('carousel-clicks'));
    makePressable(moonC, 'Photography');
  }

  for (const cfg of CONFIGS) {
    const root = $(cfg.id);
    if (!root) continue;
    root.querySelector('.gc-close')?.addEventListener('click', () => close(cfg.id));
    root.querySelector('.gc-prev') ?.addEventListener('click', () => step(cfg.id, -1));
    root.querySelector('.gc-next') ?.addEventListener('click', () => step(cfg.id, +1));
    root.querySelector('.gc-fs')   ?.addEventListener('click', () => toggleFullscreen(cfg.id));
    // Clicking a carousel focuses it; clicking the fullscreen backdrop exits.
    root.addEventListener('click', (e) => {
      focusedId = cfg.id;
      if (isFullscreen(cfg.id) && e.target === root) setFullscreen(cfg.id, false);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Consume Escape (preventDefault) only when it actually closes something
      // here, so the planet-level handler can deorbit when nothing's open.
      if (anyFullscreen()) { CONFIGS.forEach(c => setFullscreen(c.id, false)); e.preventDefault(); return; }
      if (anyOpen()) { closeAll(); e.preventDefault(); return; }
      return;
    }
    if (!focusedId) return;
    if (e.key === 'ArrowRight') step(focusedId, +1);
    if (e.key === 'ArrowLeft')  step(focusedId, -1);
  });

  const gallery = $('gallery');
  if (gallery) {
    new MutationObserver(() => {
      const showing = gallery.style.display === 'block';
      if (showing) startTracking();
      else         { stopTracking(); closeAll(); }
    }).observe(gallery, { attributes: true, attributeFilter: ['style'] });
  }
}
