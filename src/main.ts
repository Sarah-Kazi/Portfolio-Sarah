import './style.css';
import './content.css';
import './parallax/parallax.css';

import TemporaryLayersParallax from './parallax/temporaryLayersParallax.ts';

import './effects/animatedText.ts';
import './effects/planetsDistances.ts';
import './effects/loadOverlay.ts';
import './effects/dateSinceText.ts';

import addStarsToParallax from './effects/stars.ts';
import initializeGalaxy from './effects/galaxy.ts';
import initializeShootingStars from './effects/shootingStars.ts';
import startLoadOverlay from './effects/loadOverlay.ts';
import animateText from './effects/animatedText.ts';

import registerPlanetsInteractivity from './interactivity/planets.ts';
import initializeProjects from './interactivity/projects.ts';
import initializeSkills from './interactivity/skills.ts';
import initializeGallery from './interactivity/gallery.ts';
import initializePlaylists from './interactivity/playlists.ts';
import initializeBlogs from './interactivity/blogs.ts';
import initializeTimeline from './interactivity/timeline.ts';
import { initializeTerminal } from './effects/terminal.ts';
import { initializeCursor } from './effects/cursor.ts';
import { startRouter, navigate } from './router.ts';
import initializeMobile from './mobile/mobile.ts';

// One branch, decided at load. Phones and touch-only devices get the
// self-contained mobile experience (src/mobile); everything else gets the
// desktop parallax scene, untouched. If the viewport later crosses the
// boundary (DevTools device mode, exotic resizes), reload into the right one.
const MOBILE_QUERY = '(max-width: 768px), (hover: none) and (pointer: coarse)';
const isMobile = window.matchMedia(MOBILE_QUERY).matches;

window.addEventListener('resize', () => {
  if (window.matchMedia(MOBILE_QUERY).matches !== isMobile) location.reload();
});

if (isMobile) {
  initializeMobile();
  // A deep-linked post is open now; drop the black cover (see index.html).
  document.documentElement.classList.remove('deep-post');
} else {
  const parallax = new TemporaryLayersParallax({
    layerCount: 5,
    displacementFactor: 1.4,
    layerScaleDifferencePx: 110,
    animationInterpolationFactor: 0.1,
    inverted: true,
    linkedElements: {
      title: 0,
      'background-texture': 4,
      'planet-1': 1,
      'planet-2': 1,
      'planet-3': 1,
      'planet-4': 1,
      'planet-5': 1,
      'planet-7': 1,
      'planet-8': 1,
      'planet-9': 1,
      'bg-gaz-planet': 3,
      'bg-black-hole': 3,
      'bg-asteroid-1': 2,
      'bg-asteroid-2': 2,
    },
  });

  addStarsToParallax(parallax, 400);
  initializeGalaxy(parallax);
  initializeShootingStars(parallax);
  registerPlanetsInteractivity(parallax);
  animateText(parallax.getLayers()[0].element);
  initializeProjects();
  initializeSkills();
  initializeGallery(parallax);
  initializePlaylists();
  initializeBlogs(parallax, { readerOnDeepLink: true });
  // A deep-linked post is now open full screen over the intro; drop the
  // black cover (see index.html).
  document.documentElement.classList.remove('deep-post');
  initializeTimeline();
  initializeTerminal();
  initializeCursor();

  // Escape deorbits whatever planet is open. Registered after every section so
  // it runs last: gallery/blog get first crack at Escape (closing a carousel or
  // exiting fullscreen) and mark it handled, so this only fires otherwise.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (document.querySelector('.planet.active-planet')) navigate(null);
  });

  // Planets are placed and Deorbit hidden; reveal them (see index.html).
  document.documentElement.classList.add('scene-ready');
  // Start the intro zoom only once the scene's first (heavy) frame is on
  // screen: the second rAF runs after that frame has been drawn.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.add('intro-play');
  }));

  startLoadOverlay(() => {
    parallax.startInteraction();
    // Apply any deep-linked URL (e.g. #/blogs/my-post) once the scene is ready.
    startRouter();
  }, 3000);
}
