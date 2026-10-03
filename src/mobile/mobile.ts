// The mobile experience. Fully separate from the desktop parallax engine: a
// plain scrolling "vertical solar system" home plus full-screen overlay
// sections, driven by the same hash router and the same content. Sections
// whose desktop modules are self-contained (terminal, links, playlists,
// blogs) are reused as-is; the planet-anchored ones (projects, skills,
// gallery, timeline) are re-rendered mobile-native from their exported data.

import './mobile.css';

import { navigate, onRoute, startRouter } from '../router';
import initializeBlogs from '../interactivity/blogs';
import initializePlaylists from '../interactivity/playlists';
import { initializeTerminal } from '../effects/terminal';
import { PROJECTS, buildCard } from '../interactivity/projects';
import { PAINTINGS, CLICKS, type ImageItem } from '../interactivity/gallery';
import { PHASES, MILESTONES } from '../interactivity/timeline';
import animateText from '../effects/animatedText';
import { initTilt, initPlanetFocus, reduceMotion } from './motion';
import { attachPinchZoom } from './pinchZoom';
import { buildScene, playIntro } from './scene';
import { buildConstellations } from './viz';

interface PlanetInfo {
  id: string;      // section element id (= route segment)
  name: string;
  img: string;
}

// The desktop planet divs are the single source of truth for section ids,
// names and sprites; read them instead of duplicating the list.
function readPlanets(): PlanetInfo[] {
  const out: PlanetInfo[] = [];
  document.querySelectorAll<HTMLElement>('#parallax-root .planet').forEach(p => {
    const id = getComputedStyle(p).getPropertyValue('--content').trim();
    const img = p.querySelector('img')?.getAttribute('src') ?? '';
    const name = p.querySelector('h2')?.textContent ?? id;
    if (id) out.push({ id, name, img });
  });
  return out;
}

// ---------------------------------------------------------------- starfield

function starShadows(count: number, sizePx: number, alpha: number): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    parts.push(`${x}vmax ${y}vmax 0 ${sizePx}px rgba(255,255,255,${alpha})`);
  }
  return parts.join(',');
}

function buildStars() {
  const wrap = document.createElement('div');
  wrap.id = 'm-stars';
  const sheets: [string, number, number, number][] = [
    ['s1', 70, 0.6, 0.5],
    ['s2', 45, 1.1, 0.75],
    ['s3', 24, 1.6, 0.95],
  ];
  for (const [cls, count, size, alpha] of sheets) {
    const sheet = document.createElement('i');
    sheet.className = `m-star-sheet ${cls}`;
    sheet.style.boxShadow = starShadows(count, size, alpha);
    wrap.appendChild(sheet);
  }
  document.body.appendChild(wrap);
  return wrap;
}

// --------------------------------------------------------------------- home

function buildHome(planetInfos: PlanetInfo[]) {
  const home = document.createElement('div');
  home.id = 'm-home';

  // Same title markup as the desktop #title, so animateText letterizes it.
  const hero = document.createElement('header');
  hero.className = 'm-hero';
  hero.innerHTML = `
    <div class="m-title">
      <h1 class="animated-text"><span>Hey, I'm </span>Sarah<span> :D</span></h1>
      <p>Welcome to my little space on the internet!</p>
    </div>
    <span class="m-hint">scroll to explore<span class="m-hint-arrow" aria-hidden="true">&darr;</span></span>`;
  home.appendChild(hero);

  const system = document.createElement('nav');
  system.className = 'm-system';
  system.setAttribute('aria-label', 'Sections');
  for (const info of planetInfos) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'm-planet';
    b.dataset.section = info.id;
    b.innerHTML = `
      <img src="${info.img}" alt="">
      <span class="m-planet-name">${info.name}</span>
      <span class="m-planet-km"></span>`;
    b.addEventListener('click', () => navigate(info.id));
    system.appendChild(b);
  }
  home.appendChild(system);

  const footer = document.createElement('footer');
  footer.className = 'm-footer';
  footer.textContent = '© 2026 Sarah Kazi';
  home.appendChild(footer);

  document.body.appendChild(home);
  animateText(hero);
  playIntro(hero.querySelector('.m-title') as HTMLElement);
  return Array.from(system.children) as HTMLElement[];
}

// ------------------------------------------------------------------ overlay

let overlay: HTMLElement;
let overlayBody: HTMLElement;
let overlayTitle: HTMLElement;
let head: HTMLElement;
let headPlanet: HTMLImageElement;
let headTitle: HTMLElement;

function buildOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'm-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="m-bar">
      <button class="m-back glassy-background" type="button">&larr; Deorbit</button>
      <span class="m-bar-title"></span>
    </div>
    <div class="m-body">
      <header class="m-head">
        <img class="m-head-planet" alt="">
        <h1 class="m-head-title"></h1>
      </header>
    </div>`;
  overlayBody = overlay.querySelector('.m-body') as HTMLElement;
  overlayTitle = overlay.querySelector('.m-bar-title') as HTMLElement;
  head = overlay.querySelector('.m-head') as HTMLElement;
  headPlanet = overlay.querySelector('.m-head-planet') as HTMLImageElement;
  headTitle = overlay.querySelector('.m-head-title') as HTMLElement;
  overlay.querySelector('.m-back')?.addEventListener('click', deorbit);

  // The header planet drifts up slower than the content (the planet you've
  // just arrived at, receding), and the bar picks up the section name once
  // the big title has scrolled away.
  let raf = 0;
  const onScroll = () => {
    raf = 0;
    const y = overlayBody.scrollTop;
    overlay.classList.toggle('m-scrolled', y > 4);
    overlay.classList.toggle('m-past-head', y > head.offsetHeight - 70);
    if (!reduceMotion) headPlanet.style.transform = `translate3d(0, ${(y * 0.45).toFixed(1)}px, 0)`;
    // Fade it out as the content passes over, so text never sits on it.
    headPlanet.style.opacity = Math.max(0, 1 - y / head.offsetHeight).toFixed(3);
  };
  overlayBody.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(onScroll); }, { passive: true });
  document.body.appendChild(overlay);
}

function setHead(info: PlanetInfo) {
  headPlanet.src = info.img;
  headPlanet.dataset.section = info.id;
  headPlanet.style.transform = '';
  headPlanet.style.opacity = '';
  overlayTitle.textContent = info.name;
  headTitle.innerHTML = `<span class="animated-text">${info.name}</span>`;
  animateText(head);
}

// Each history entry remembers how many steps it sits above the home entry,
// so Deorbit can rewind with history.go() instead of pushing a new entry
// (which made the phone's back gesture reopen the section just closed).
interface Depth { d: number; home: boolean }
let lastDepth: Depth | null = null;

function stampDepth(section: string | null) {
  let s = history.state as Depth | null;
  if (!s || typeof s.d !== 'number') {
    s = section === null ? { d: 0, home: true }
      : lastDepth ? { d: lastDepth.d + 1, home: lastDepth.home }
      : { d: 1, home: false };   // deep link: no home entry below this one
    history.replaceState(s, '');
  }
  lastDepth = s;
}

function deorbit() {
  const s = history.state as Depth | null;
  if (s && s.home && s.d > 0) history.go(-s.d);
  else navigate(null);
}

// iOS-safe scroll lock: freeze the body at the current offset while the
// overlay is open, restore it on close.
let savedScrollY = 0;

function lockScroll() {
  savedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  // Scroll-driven CSS (the scene's parallax) would read the pinned page as
  // scrolled to the top; this class switches it to the held inline values.
  document.body.classList.add('m-locked');
}

function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  window.scrollTo(0, savedScrollY);
  document.body.classList.remove('m-locked');
}

// ------------------------------------------------- mobile-native sections

function buildProjects() {
  const section = document.getElementById('projects');
  if (!section) return;
  const wrap = document.createElement('div');
  wrap.className = 'm-proj';
  for (const p of PROJECTS) {
    const card = buildCard(p);
    card.classList.add('visible');
    wrap.appendChild(card);
  }
  section.appendChild(wrap);
}

function buildSkills() {
  const section = document.getElementById('tech-stack');
  if (section) buildConstellations(section, overlayBody);
}

function buildTimeline() {
  const section = document.getElementById('timeline');
  if (!section) return;
  const wrap = document.createElement('div');
  wrap.className = 'm-timeline';
  const fill = document.createElement('div');
  fill.className = 'm-tl-fill';
  wrap.appendChild(fill);
  MILESTONES.forEach((m, i) => {
    const phase = PHASES[i];
    const c = `rgb(${phase.halo[0]},${phase.halo[1]},${phase.halo[2]})`;
    const item = document.createElement('div');
    item.className = 'm-milestone';
    item.style.setProperty('--c', c);
    item.innerHTML = `
      <div class="m-phase">${phase.short} &middot; ${m.year}</div>
      <h4>${m.title}</h4>
      <p>${m.blurb}</p>`;
    wrap.appendChild(item);
  });
  section.appendChild(wrap);

  const items = Array.from(wrap.querySelectorAll<HTMLElement>('.m-milestone'));
  let raf = 0;
  const update = () => {
    raf = 0;
    if (section.style.display !== 'block') return;
    // Layout offsets rather than getBoundingClientRect, so the overlay's
    // zoom-in transform doesn't skew the reading. The wrap's offsetParent is
    // the full-screen overlay, so this is its position on screen.
    const top = wrap.offsetTop - overlayBody.scrollTop;
    // Progress is read at 60% down the screen; at the bottom of the scroll
    // everything counts as reached, so a short timeline can still complete.
    const atEnd = overlayBody.scrollTop + overlayBody.clientHeight >= overlayBody.scrollHeight - 2;
    const line = atEnd ? Infinity : window.innerHeight * 0.6;
    fill.style.height = `${Math.min(wrap.offsetHeight, Math.max(0, line - top))}px`;
    for (const it of items) it.classList.toggle('m-lit', top + it.offsetTop + 10 < line);
  };
  overlayBody.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  onRoute(({ section: s }) => { if (s === 'timeline') requestAnimationFrame(update); });
}

// Tappable commands under the terminal, so it's usable without typing on a
// phone keyboard. Tapping runs the command without focusing the input, so
// the keyboard stays down.
const TERM_CHIPS = ['help', 'ls', 'cat about.txt', 'cat interests.txt', 'whoami', 'cowsay hi', 'wordle', 'meow', 'nyan', 'clear', 'deorbit'];

function buildTermChips() {
  const term = document.querySelector('#about-me .term');
  const input = document.getElementById('term-input') as HTMLInputElement | null;
  if (!term || !input) return;
  const row = document.createElement('div');
  row.className = 'm-term-chips';
  for (const cmd of TERM_CHIPS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'm-chip';
    b.textContent = cmd;
    b.addEventListener('click', () => {
      input.value = cmd;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    row.appendChild(b);
  }
  term.after(row);
}

// Gallery: snap strips + a shared lightbox.
let lightbox: HTMLElement;
let lbImg: HTMLImageElement;
let lbCap: HTMLElement;
let lbSet: ImageItem[] = [];
let lbIndex = 0;
let lbZoom: { reset(): void } | null = null;

function openLightbox(set: ImageItem[], index: number) {
  lbSet = set;
  lbIndex = index;
  renderLightbox();
  lightbox.hidden = false;
}

function renderLightbox() {
  const item = lbSet[lbIndex];
  lbZoom?.reset();
  lbImg.src = item.src;
  lbImg.alt = item.title;
  lbCap.textContent = `${item.title} (${lbIndex + 1}/${lbSet.length})`;
}

function stepLightbox(delta: number) {
  lbIndex = (lbIndex + delta + lbSet.length) % lbSet.length;
  renderLightbox();
}

function buildLightbox() {
  lightbox = document.createElement('div');
  lightbox.className = 'm-lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <img alt="">
    <button class="m-lb-close" type="button" aria-label="Close">&times;</button>
    <button class="m-lb-prev" type="button" aria-label="Previous">&lsaquo;</button>
    <button class="m-lb-next" type="button" aria-label="Next">&rsaquo;</button>
    <div class="m-lb-cap"></div>`;
  lbImg = lightbox.querySelector('img') as HTMLImageElement;
  lbCap = lightbox.querySelector('.m-lb-cap') as HTMLElement;
  lightbox.querySelector('.m-lb-close')?.addEventListener('click', () => { lightbox.hidden = true; });
  lightbox.querySelector('.m-lb-prev')?.addEventListener('click', () => stepLightbox(-1));
  lightbox.querySelector('.m-lb-next')?.addEventListener('click', () => stepLightbox(+1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.hidden = true;
  });
  lbZoom = attachPinchZoom(lightbox, lbImg, stepLightbox);
  document.body.appendChild(lightbox);
}

function buildStrip(parent: HTMLElement, heading: string, moonId: string, set: ImageItem[]) {
  // Each strip is headed by its desktop moon sprite.
  const h = document.createElement('h3');
  const moon = document.querySelector<HTMLImageElement>(`#${moonId} img`)?.getAttribute('src');
  h.innerHTML = `${moon ? `<img class="m-moon" src="${moon}" alt="">` : ''}<span>${heading}</span>`;
  parent.appendChild(h);
  const strip = document.createElement('div');
  strip.className = 'm-strip';
  set.forEach((item, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'm-thumb';
    // Strips show small WebP thumbnails (public/*/thumbs); the lightbox
    // loads the full image. Fall back to the original if a thumb is missing.
    const thumb = item.src.replace(/\/([^/]+)\.\w+$/, '/thumbs/$1.webp');
    b.innerHTML = `<img src="${thumb}" alt="${item.title}" loading="lazy">`;
    b.querySelector('img')!.addEventListener('error', (e) => {
      (e.currentTarget as HTMLImageElement).src = item.src;
    }, { once: true });
    b.addEventListener('click', () => openLightbox(set, i));
    strip.appendChild(b);
  });
  parent.appendChild(strip);
}

function buildGallery() {
  const section = document.getElementById('gallery');
  if (!section) return;
  const wrap = document.createElement('div');
  wrap.className = 'm-gallery';
  buildStrip(wrap, 'Paintings', 'moon-paintings', PAINTINGS);
  buildStrip(wrap, 'Clicks', 'moon-clicks', CLICKS);
  section.appendChild(wrap);
  buildLightbox();
}

// ------------------------------------------------------------------- router

// Opening a section flies the tapped planet from the home up into the
// section header (and back down on close), while the section fades in around
// it: the mobile take on the desktop zoom into a planet.
function homePlanetImg(id: string) {
  return document.querySelector<HTMLImageElement>(`.m-planet[data-section="${id}"] img`);
}

const EASE_OUT = 'cubic-bezier(.22, 1, .36, 1)';
const EASE_IN_OUT = 'cubic-bezier(.65, 0, .35, 1)';

function flyPlanet(
  src: HTMLImageElement, from: DOMRect, to: DOMRect,
  timing: { duration: number; easing: string }, onDone: () => void,
) {
  const clone = document.createElement('img');
  clone.src = src.src;
  clone.className = 'm-flyer';
  Object.assign(clone.style, {
    left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`,
  });
  document.body.appendChild(clone);
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const sc = from.width / to.width;
  const anim = clone.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${sc})` },
    { transform: 'none' },
  ], timing);
  const finish = () => { clone.remove(); onDone(); };
  anim.onfinish = finish;
  anim.oncancel = finish;
  return anim;
}

function wireRouter(planetInfos: PlanetInfo[]) {
  const infos = new Map(planetInfos.map(p => [p.id, p]));
  let current: string | null = null;
  let started = false;
  // Hides the previous section once its exit animation ends; run early if
  // another section opens before then.
  let pendingHide: (() => void) | null = null;
  let flight: Animation | null = null;
  // The open transition's fades on the bar, title and section.
  let enterAnims: Animation[] = [];

  const open = (id: string, animate: boolean) => {
    const section = document.getElementById(id);
    const info = infos.get(id);
    if (!section || !info) return;
    pendingHide?.();
    flight?.cancel();
    enterAnims.forEach(a => a.cancel());
    enterAnims = [];
    overlay.getAnimations().forEach(a => a.cancel());
    overlayBody.getAnimations().forEach(a => a.cancel());

    const homeImg = animate ? homePlanetImg(id) : null;
    const from = homeImg?.getBoundingClientRect();

    setHead(info);
    overlayBody.appendChild(section);
    section.style.display = 'block';   // fires the reused modules' observers
    overlay.hidden = false;
    overlayBody.scrollTop = 0;
    overlay.classList.remove('m-scrolled', 'm-past-head');
    lockScroll();
    // Starts the home's fade-out right away (see #m-home in mobile.css).
    document.body.classList.add('m-in-section');

    const done = () => {
      headPlanet.style.visibility = '';
      if (homeImg) homeImg.style.visibility = '';
    };
    if (!homeImg || !from) { done(); return; }

    homeImg.style.visibility = 'hidden';
    // The header planet itself flies up from the home (rather than a copy on
    // top of everything), so it's behind the content from the first frame
    // and nothing has to swap when it lands. Because of that, nothing the
    // planet sits inside may fade: the tint fades by colour, and the bar,
    // title and section fade on their own.
    const to = headPlanet.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    overlay.animate(
      [{ backgroundColor: 'rgba(8, 3, 20, 0)' }, { backgroundColor: 'rgba(8, 3, 20, 0.45)' }],
      { duration: 340, easing: 'ease-out' },
    );
    enterAnims.push(overlay.querySelector('.m-bar')!.animate(
      [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 120, fill: 'backwards' },
    ));
    for (const el of [headTitle, section]) {
      enterAnims.push(el.animate(
        [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 560, delay: el === section ? 150 : 90, easing: EASE_OUT, fill: 'backwards' },
      ));
    }
    flight = headPlanet.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})` }, { transform: 'none' }],
      { duration: 640, easing: EASE_OUT },
    );
    const landed = () => { flight = null; done(); };
    flight.onfinish = landed;
    flight.oncancel = landed;
  };

  const close = (id: string, animate: boolean) => {
    const section = document.getElementById(id);
    if (!lightbox.hidden) lightbox.hidden = true;
    flight?.cancel();
    enterAnims.forEach(a => a.cancel());
    enterAnims = [];
    document.body.classList.remove('m-in-section');
    const from = headPlanet.getBoundingClientRect();
    unlockScroll();   // first, so the home planet is back where it shows
    const hide = () => {
      pendingHide = null;
      if (section) section.style.display = 'none';
      overlay.hidden = true;
    };
    const homeImg = animate ? homePlanetImg(id) : null;
    if (!homeImg) { hide(); return; }

    pendingHide = hide;
    homeImg.style.visibility = 'hidden';
    headPlanet.style.visibility = 'hidden';
    // Content drops away first, then the tint lifts while the planet glides
    // back into its place on the home.
    overlayBody.animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateY(18px)', opacity: 0 }],
      { duration: 220, easing: 'ease-in', fill: 'forwards' },
    );
    const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 300, delay: 80, easing: 'ease-in', fill: 'forwards',
    });
    fade.onfinish = () => {
      if (pendingHide === hide) hide();
      overlay.getAnimations().forEach(a => a.cancel());
      overlayBody.getAnimations().forEach(a => a.cancel());
    };
    flight = flyPlanet(homeImg, from, homeImg.getBoundingClientRect(), { duration: 540, easing: EASE_IN_OUT }, () => {
      flight = null;
      homeImg.style.visibility = '';
      headPlanet.style.visibility = '';
    });
  };

  onRoute(({ section }) => {
    stampDepth(section);
    const target = section && infos.has(section) ? section : null;
    const animate = started && !reduceMotion;
    started = true;
    if (target === current) return;
    if (current) close(current, animate && !target);
    if (target) open(target, animate);
    current = target;
  });
}

// --------------------------------------------------------------------- init

export default function initializeMobile() {
  document.documentElement.classList.add('is-mobile');
  document.body.classList.add('is-mobile');
  document.getElementById('load-overlay')?.remove();

  const planetInfos = readPlanets();

  buildScene();
  const stars = buildStars();
  const planets = buildHome(planetInfos);
  buildOverlay();
  initTilt(stars);
  initPlanetFocus(planets);

  // Self-contained desktop modules, reused as-is.
  initializeTerminal();
  initializePlaylists();
  initializeBlogs();
  buildTermChips();
  // The terminal's `deorbit` command clicks the desktop Deorbit button, which
  // is never shown on mobile; route it to the mobile one instead.
  document.getElementById('go-back-button')?.addEventListener('click', deorbit);

  // Planet-anchored sections, re-rendered mobile-native from shared data.
  buildProjects();
  buildSkills();
  buildGallery();
  buildTimeline();

  wireRouter(planetInfos);
  startRouter();   // applies deep links (#/blogs/<slug>, #/gallery, ...)
}
