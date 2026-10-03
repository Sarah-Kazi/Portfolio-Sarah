// The space behind the mobile site: the same galaxy, grain texture and
// background planets as the desktop scene, stacked as fixed layers that drift
// at different speeds as you scroll (scroll stands in for the desktop mouse).

import { drawGalaxy } from '../effects/galaxy';
import { reduceMotion } from './motion';

interface Layer { el: HTMLElement; depth: number }

function layer(scene: HTMLElement, depth: number): Layer {
  const el = document.createElement('div');
  el.className = 'm-layer';
  scene.appendChild(el);
  return { el, depth };
}

function buildGalaxy(parent: HTMLElement) {
  const wrap = document.createElement('div');
  wrap.className = 'm-galaxy';
  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);
  parent.appendChild(wrap);

  const ctx = canvas.getContext('2d')!;
  let drawnFor = 0;
  const resize = () => {
    // Same sizing rule as desktop. Only redraw when the long side changes,
    // so the mobile URL bar showing/hiding doesn't reshuffle the stars.
    const size = Math.round(Math.max(window.innerWidth, window.innerHeight) * 1.55);
    if (Math.abs(size - drawnFor) < 80) return;
    drawnFor = size;
    canvas.width = size;
    canvas.height = size;
    canvas.style.marginLeft = `${-size / 2}px`;
    canvas.style.marginTop = `${-size / 2}px`;
    drawGalaxy(ctx, size);
  };
  window.addEventListener('resize', resize);
  resize();
  return wrap;
}

// Moves a desktop element (still in the hidden #parallax-root) into a layer.
function adopt(id: string, into: HTMLElement) {
  const el = document.getElementById(id);
  if (el) into.appendChild(el);
}

export function buildScene() {
  const scene = document.createElement('div');
  scene.id = 'm-scene';
  document.body.prepend(scene);

  const far = layer(scene, 0.12);
  const galaxy = buildGalaxy(far.el);
  adopt('background-texture', scene);   // vignette + grain, fixed
  const mid = layer(scene, 0.32);
  adopt('bg-gaz-planet', mid.el);
  adopt('bg-black-hole', mid.el);
  const near = layer(scene, 0);
  adopt('bg-asteroid-1', near.el);
  adopt('bg-asteroid-2', near.el);

  if (reduceMotion) return;

  const layers = [far, mid];

  // Browsers with scroll-driven animations move these layers in CSS (see
  // .m-layer[data-parallax]); they need each layer's total travel over the
  // page's full scroll range. The JS update below still runs: it's the
  // fallback elsewhere, and holds the layers in place while a section is
  // open and the page is pinned.
  // Measured from the home itself rather than the document, which has no
  // scroll height while a section has the page pinned (e.g. a deep link).
  const setTravel = () => {
    const home = document.getElementById('m-home');
    if (!home) return;
    const max = Math.max(0, home.offsetHeight - window.innerHeight);
    for (const l of layers) {
      l.el.dataset.parallax = '';
      l.el.style.setProperty('--shift', `${(-max * l.depth).toFixed(1)}px`);
    }
  };
  // The home is built right after the scene; watch it from then on.
  requestAnimationFrame(() => {
    const home = document.getElementById('m-home');
    if (home && typeof ResizeObserver !== 'undefined') new ResizeObserver(setTravel).observe(home);
    setTravel();
  });
  window.addEventListener('resize', setTravel);

  let raf = 0;
  const update = () => {
    raf = 0;
    // While a section is open the body is pinned at -scrollY; read that.
    const y = document.body.style.position === 'fixed'
      ? -parseFloat(document.body.style.top || '0')
      : window.scrollY;
    for (const l of layers) l.el.style.transform = `translate3d(0, ${(-y * l.depth).toFixed(1)}px, 0)`;
    // The galaxy is the hero's backdrop; let it recede once you're travelling.
    galaxy.style.opacity = Math.max(0.45, 1 - y / (window.innerHeight * 1.4)).toFixed(3);
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

// The desktop intro: a white screen with a circular window around the title
// that rushes outward. Only on a fresh visit to the home, not on deep links.
export function playIntro(title: HTMLElement) {
  if (reduceMotion || location.hash.replace(/^#\/?/, '')) return;
  const r = title.getBoundingClientRect();
  const el = document.createElement('div');
  el.id = 'm-intro';
  el.style.setProperty('--cx', `${r.left + r.width / 2}px`);
  el.style.setProperty('--cy', `${r.top + r.height / 2}px`);
  el.style.setProperty('--r', `${Math.max(r.width, r.height) * 0.62}px`);
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
