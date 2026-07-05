import animateText from '../effects/animatedText';
import TemporaryLayersParallax from '../parallax/temporaryLayersParallax';
import { navigate, onRoute } from '../router';

import './planets.css';

const PLANET_DISPOSITION_CIRCLE_RADIUS = window.innerHeight / 1.8;

const title = document.getElementById('title')!;
const goBackButton = document.getElementById('go-back-button')! as HTMLElement;
const planets = document.querySelectorAll('.planet');

setPlanetsPositions();

function setPlanetsPositions() {
  planets.forEach((_planet, index) => {
    const planet = _planet as HTMLElement;
    const { x, y } = getPlanetPositionOffset(index);
    planet.style.setProperty('--x', `${x}px`);
    planet.style.setProperty('--y', `${y}px`);
  });
}

function getPlanetPositionOffset(index: number) {
  const offsetAngle = (Math.PI / 4) * 5;
  const angle = (index / planets.length) * 2 * Math.PI + offsetAngle;
  const x = PLANET_DISPOSITION_CIRCLE_RADIUS * Math.cos(angle);
  const y = PLANET_DISPOSITION_CIRCLE_RADIUS * Math.sin(angle);
  return { x, y };
}

function getPlanetContentId(planet: Element) {
  const contentId = getComputedStyle(planet).getPropertyValue('--content')?.toString();
  return contentId;
}

function getPlanetContentElt(planet: Element) {
  const contentId = getPlanetContentId(planet);
  if (contentId == null) return null;
  return document.getElementById(contentId);
}

function parallaxZoomToPlanet(
  planetIndex: number,
  parallax: TemporaryLayersParallax,
  originMulX: number = -4,
  originMulY: number = originMulX,
) {
  const planetPosition = getPlanetPositionOffset(planetIndex);
  const newOrigin = {
    x: planetPosition.x * originMulX,
    y: planetPosition.y * originMulY,
  };
  parallax.setOrigin(newOrigin);
  parallax.setZoom(3);
}

function parallaxZoomReset(parallax: TemporaryLayersParallax) {
  parallax.setOrigin({ x: 0, y: 0 });
  parallax.setZoom(1);
}

function showGoBackButton() {
  goBackButton.style.display = 'block';
}

function hideGoBackButton() {
  goBackButton.style.display = 'none';
}

function showTitle() {
  title.classList.remove('fade-out');
  title.classList.add('fade-in');
}

function hideTitle() {
  title.classList.remove('fade-in');
  title.classList.add('fade-out');
}

function createContentParallaxLayer(parallax: TemporaryLayersParallax, contentBody: HTMLElement | null) {
  const layerElt = parallax.createTemporyLayer();
  layerElt.classList.add('fade-initial-0');
  layerElt.classList.add('fade-in');
  layerElt.appendChild(goBackButton);

  if (contentBody == null) return;
  animateText(contentBody);
  layerElt.appendChild(contentBody);
  contentBody.style.display = 'block';
}

function hidePlanetContent(planet: Element) {
  const contentBody = getPlanetContentElt(planet);
  if (contentBody == null) return;
  contentBody.style.display = 'none';
}

function isPlanetFocused(planet: Element) {
  return planet.classList.contains('active-planet');
}

export default function registerPlanetsInteractivity(parallax: TemporaryLayersParallax) {
  const planets = document.getElementsByClassName('planet');
  hideGoBackButton();

  // contentId → open/close controls, so the router can drive any section.
  const controllers: Record<string, { open: () => void; close: () => void }> = {};

  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const contentId = getPlanetContentId(planet).trim();

    const focusPlanet = (): void => {
      if (contentId === 'gallery') {
        parallaxZoomToPlanet(i, parallax, -4.3, -3.0);
      } else {
        parallaxZoomToPlanet(i, parallax);
      }
      showGoBackButton();
      if (contentId === 'about-me') hideGoBackButton();
      if (contentId === 'tech-stack') goBackButton.classList.add('on-planet');
      hideTitle();
      createContentParallaxLayer(parallax, getPlanetContentElt(planet));
      planet.classList.add('active-planet');
    };

    const unfocusPlanet = (): void => {
      parallax.setMouseTrackingEnabled(true);
      parallaxZoomReset(parallax);
      showTitle();
      hideGoBackButton();
      goBackButton.classList.remove('on-planet');
      parallax.deleteAllTemporaryLayers();
      hidePlanetContent(planet);
      planet.classList.remove('active-planet');
    };

    controllers[contentId] = {
      open:  () => { if (!isPlanetFocused(planet)) focusPlanet(); },
      close: () => { if (isPlanetFocused(planet)) unfocusPlanet(); },
    };

    // Clicks don't mutate the view directly; they navigate and the router reacts.
    planet.addEventListener('click', () => {
      if (!isPlanetFocused(planet)) navigate(contentId);
    });
  }

  // Deorbit / go-back closes whatever's open by returning to the home route.
  goBackButton.addEventListener('click', () => navigate(null));

  // The hash is the source of truth: open/close the matching section to suit.
  let activeId: string | null = null;
  onRoute(({ section }) => {
    const target = section && controllers[section] ? section : null;
    if (target === activeId) return;
    if (activeId) controllers[activeId].close();
    if (target) controllers[target].open();
    activeId = target;
  });
}
