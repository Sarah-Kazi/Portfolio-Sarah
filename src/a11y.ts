// Lets a clickable div be reached with Tab and pressed with Enter or Space,
// the way a real <button> would.
export function makePressable(el: Element | null, label?: string) {
  if (!(el instanceof HTMLElement)) return;
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  if (label) el.setAttribute('aria-label', label);
  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    el.click();
  });
  // A mouse click shouldn't leave focus here: a later key press (Escape to
  // deorbit) would then show the keyboard focus ring on it.
  el.addEventListener('mousedown', (e) => e.preventDefault());
}

// True while the visitor is moving around with Tab, false once they use the
// mouse or touch. Focus is only moved for keyboard users, so mouse users
// never see a focus ring appear on its own.
let keyboardMode = false;
window.addEventListener('keydown', (e) => { if (e.key === 'Tab') keyboardMode = true; }, true);
window.addEventListener('pointerdown', () => { keyboardMode = false; }, true);
export const usingKeyboard = () => keyboardMode;

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
