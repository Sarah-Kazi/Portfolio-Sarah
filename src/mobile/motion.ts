// Motion for the mobile home: the starfield follows the phone's tilt (the
// touch stand-in for desktop mouse parallax), and planets swell as they pass
// through the middle of the screen.

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Max shift in px for each star sheet, far to near.
const SHEET_DEPTH = [6, 12, 20];

export function initTilt(stars: HTMLElement) {
  if (reduceMotion || typeof DeviceOrientationEvent === 'undefined') return;

  const sheets = Array.from(stars.children) as HTMLElement[];
  let base: { x: number; y: number } | null = null;
  let targetX = 0, targetY = 0, x = 0, y = 0;
  let raf = 0;

  function tick() {
    raf = 0;
    x += (targetX - x) * 0.12;
    y += (targetY - y) * 0.12;
    sheets.forEach((s, i) => {
      const d = SHEET_DEPTH[i] ?? 10;
      s.style.transform = `translate3d(${(-x * d).toFixed(2)}px, ${(-y * d).toFixed(2)}px, 0)`;
    });
    if (Math.abs(targetX - x) > 0.002 || Math.abs(targetY - y) > 0.002) {
      raf = requestAnimationFrame(tick);
    }
  }

  function onOrient(e: DeviceOrientationEvent) {
    if (e.beta == null || e.gamma == null) return;
    // Map device axes to screen axes for the current rotation.
    const angle = screen.orientation?.angle ?? 0;
    let ax = e.gamma, ay = e.beta;
    if (angle === 90) { ax = e.beta; ay = -e.gamma; }
    else if (angle === 270 || angle === -90) { ax = -e.beta; ay = e.gamma; }

    if (!base) base = { x: ax, y: ay };
    // The resting position slowly follows how the phone is held, so the
    // stars settle back to centre instead of staying pushed to one side.
    base.x += (ax - base.x) * 0.01;
    base.y += (ay - base.y) * 0.01;

    targetX = clamp((ax - base.x) / 25, -1, 1);
    targetY = clamp((ay - base.y) / 25, -1, 1);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // iOS only hands out orientation data after a permission prompt, which has
  // to come from a user gesture; ask on the first tap anywhere.
  const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof DOE.requestPermission === 'function') {
    document.addEventListener('click', () => {
      DOE.requestPermission!()
        .then(r => { if (r === 'granted') window.addEventListener('deviceorientation', onOrient); })
        .catch(() => {});
    }, { once: true });
  } else {
    window.addEventListener('deviceorientation', onOrient);
  }
}

// Sets --focus (0..1) on each planet by how close it is to the screen centre,
// and its distance label: kilometres that count down as it approaches (the
// desktop measures from the mouse; here the centre of the screen is "you").
export function initPlanetFocus(planets: HTMLElement[]) {
  if (!planets.length) return;

  let raf = 0;
  function update() {
    raf = 0;
    const mid = window.innerHeight / 2;
    const reach = window.innerHeight * 0.55;
    for (const p of planets) {
      const img = p.querySelector('img') ?? p;
      const r = img.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - mid);
      const f = clamp(1 - dist / reach, 0, 1);
      p.style.setProperty('--focus', f.toFixed(3));
      const km = p.querySelector('.m-planet-km');
      if (km) {
        km.innerHTML = dist < r.height * 0.3
          ? 'tap to orbit'
          : `${Math.floor(Math.max(dist * 10 - 400, 0))}<span>km</span>`;
      }
    }
  }

  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}
