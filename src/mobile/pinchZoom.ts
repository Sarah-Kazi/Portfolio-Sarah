// Touch gestures for the gallery lightbox: pinch to zoom, drag to pan while
// zoomed, double-tap to toggle zoom, and a horizontal swipe (only when not
// zoomed) to step between images.

interface Pt { x: number; y: number }

const MAX_SCALE = 5;
const TAP_ZOOM = 2.5;

const dist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
const mid = (a: Touch, b: Touch): Pt => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });

export function attachPinchZoom(
  area: HTMLElement,
  img: HTMLImageElement,
  onSwipe: (dir: 1 | -1) => void,
) {
  let scale = 1, tx = 0, ty = 0;

  // Gesture start state.
  let pinchDist = 0, pinchScale = 1;
  let pinchMid: Pt = { x: 0, y: 0 };
  let startT: Pt = { x: 0, y: 0 };
  let startTouch: Pt = { x: 0, y: 0 };
  let pinched = false;
  let lastTap = 0;
  let lastTapPt: Pt = { x: 0, y: 0 };

  function centre(): Pt {
    // Layout centre of the image, which the transform is relative to.
    const r = img.getBoundingClientRect();
    return { x: r.left + r.width / 2 - tx, y: r.top + r.height / 2 - ty };
  }

  function apply(animate: boolean) {
    img.classList.toggle('m-lb-live', !animate);
    img.style.transform = scale === 1 && tx === 0 && ty === 0
      ? ''
      : `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  // Keep the zoomed image covering the screen instead of drifting off it.
  function settle() {
    if (scale < 1.02) { scale = 1; tx = 0; ty = 0; }
    else {
      const w = img.offsetWidth, h = img.offsetHeight;
      const maxX = Math.max(0, (w * scale - window.innerWidth) / 2);
      const maxY = Math.max(0, (h * scale - window.innerHeight) / 2);
      tx = Math.min(maxX, Math.max(-maxX, tx));
      ty = Math.min(maxY, Math.max(-maxY, ty));
    }
    apply(true);
  }

  // Zoom so the content under screen point p stays under p.
  function zoomAround(p: Pt, from: Pt, s0: number, t0: Pt, s: number) {
    const c = centre();
    const qx = (from.x - c.x - t0.x) / s0;
    const qy = (from.y - c.y - t0.y) / s0;
    scale = s;
    tx = p.x - c.x - s * qx;
    ty = p.y - c.y - s * qy;
  }

  area.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      pinched = true;
      pinchDist = dist(e.touches[0], e.touches[1]);
      pinchScale = scale;
      pinchMid = mid(e.touches[0], e.touches[1]);
      startT = { x: tx, y: ty };
    } else if (e.touches.length === 1) {
      pinched = false;
      startTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startT = { x: tx, y: ty };
    }
  }, { passive: true });

  area.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchDist > 0) {
      e.preventDefault();
      const s = Math.min(MAX_SCALE, Math.max(0.8, pinchScale * dist(e.touches[0], e.touches[1]) / pinchDist));
      zoomAround(mid(e.touches[0], e.touches[1]), pinchMid, pinchScale, startT, s);
      apply(false);
    } else if (e.touches.length === 1 && scale > 1 && pinchDist === 0) {
      e.preventDefault();
      tx = startT.x + e.touches[0].clientX - startTouch.x;
      ty = startT.y + e.touches[0].clientY - startTouch.y;
      apply(false);
    }
  }, { passive: false });

  area.addEventListener('touchend', (e) => {
    if (e.touches.length > 0) {
      // One finger lifted mid-pinch: carry on as a pan from here.
      if (e.touches.length === 1) {
        pinchDist = 0;
        startTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startT = { x: tx, y: ty };
      }
      return;
    }
    pinchDist = 0;
    const t = e.changedTouches[0];
    const dx = t.clientX - startTouch.x;
    const dy = t.clientY - startTouch.y;

    if (!pinched && scale === 1 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onSwipe(dx < 0 ? 1 : -1);
      return;
    }

    // Double-tap on the image toggles zoom at that point.
    const now = Date.now();
    const p = { x: t.clientX, y: t.clientY };
    const still = Math.abs(dx) < 10 && Math.abs(dy) < 10;
    if (!pinched && still && e.target === img) {
      if (now - lastTap < 300 && Math.hypot(p.x - lastTapPt.x, p.y - lastTapPt.y) < 30) {
        if (scale > 1) { scale = 1; tx = 0; ty = 0; }
        else zoomAround(p, p, 1, { x: 0, y: 0 }, TAP_ZOOM);
        lastTap = 0;
        settle();
        e.preventDefault();   // swallow the synthetic click
        return;
      }
      lastTap = now;
      lastTapPt = p;
    }
    settle();
  }, { passive: false });

  return {
    reset() { scale = 1; tx = 0; ty = 0; apply(false); },
  };
}
