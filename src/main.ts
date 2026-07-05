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
import { startRouter } from './router.ts';

// Desktop-only for now. On phones / touch-only devices the CSS #mobile-gate
// message is shown instead, and we skip the whole cursor-driven experience so
// its parallax + canvas loops don't run and drain the battery.
const isMobile = window.matchMedia(
  '(max-width: 768px), (hover: none) and (pointer: coarse)',
).matches;

if (!isMobile) {
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
  initializeGallery();
  initializePlaylists();
  initializeBlogs();
  initializeTimeline();
  initializeTerminal();
  initializeCursor();

  startLoadOverlay(() => {
    parallax.startInteraction();
    // Apply any deep-linked URL (e.g. #/blogs/my-post) once the scene is ready.
    startRouter();
  }, 3000);
}
