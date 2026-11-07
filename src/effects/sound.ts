// UI sound effects (Kenney Interface Sounds, CC0). Off until the visitor
// turns them on; the choice is remembered. Files are only fetched once sound
// is enabled, so visitors who never turn it on download nothing.

export type SoundName =
  | 'hover' | 'open' | 'close' | 'moon' | 'step'
  | 'key' | 'enter' | 'error' | 'sound-on';

const VOLUME: Record<SoundName, number> = {
  hover: 0.25,
  open: 0.45,
  close: 0.45,
  moon: 0.4,
  step: 0.35,
  key: 0.18,
  enter: 0.3,
  error: 0.35,
  'sound-on': 0.4,
};

const STORAGE_KEY = 'spacefolio-sound';

let enabled = false;
let ctx: AudioContext | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
const loading = new Map<SoundName, Promise<void>>();
const listeners: ((on: boolean) => void)[] = [];

try { enabled = localStorage.getItem(STORAGE_KEY) === 'on'; } catch { /* storage blocked */ }

function load(name: SoundName): Promise<void> {
  if (!ctx) return Promise.resolve();
  let p = loading.get(name);
  if (!p) {
    const audio = ctx;
    p = fetch(`/sfx/${name}.mp3`)
      .then(r => r.arrayBuffer())
      .then(data => audio.decodeAudioData(data))
      .then(buf => { buffers.set(name, buf); })
      .catch(() => { loading.delete(name); });
    loading.set(name, p);
  }
  return p;
}

function ensureContext() {
  // Creating audio before any click or key press only gets a console warning.
  const activated = navigator.userActivation?.hasBeenActive ?? true;
  if (!ctx && !activated) return;
  if (!ctx) {
    ctx = new AudioContext();
    (Object.keys(VOLUME) as SoundName[]).forEach(load);
  }
  // Browsers start audio suspended until the page has had a click or key.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

// Small random pitch changes stop repeated sounds (typing) from sounding robotic.
export function play(name: SoundName, opts: { vary?: number } = {}) {
  if (!enabled) return;
  ensureContext();
  const buf = buffers.get(name);
  if (!ctx || !buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  if (opts.vary) src.playbackRate.value = 1 + (Math.random() * 2 - 1) * opts.vary;
  const gain = ctx.createGain();
  gain.gain.value = VOLUME[name];
  src.connect(gain).connect(ctx.destination);
  src.start();
}

export function isSoundOn() {
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  try { localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off'); } catch { /* storage blocked */ }
  if (on) {
    ensureContext();
    load('sound-on').then(() => play('sound-on'));
  }
  listeners.forEach(l => l(on));
}

export function onSoundChange(listener: (on: boolean) => void) {
  listeners.push(listener);
}

// If sound was left on from a previous visit, the context still needs a user
// gesture before it can play, so warm it up on the first one.
if (enabled) {
  const warm = () => ensureContext();
  window.addEventListener('pointerdown', warm, { once: true, capture: true });
  window.addEventListener('keydown', warm, { once: true, capture: true });
}

function hasChosen(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== null; } catch { return false; }
}

// A short "sound on/off" note at the bottom of the screen, so the M key gives
// feedback even when turning sound off (which is silent by definition).
let toast: HTMLElement | null = null;
let toastTimer = 0;
function showToast(text: string) {
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sound-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast?.classList.remove('show'), 1400);
}

// M toggles sound anywhere except while typing.
export function initializeSoundShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'm' && e.key !== 'M') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
    setSound(!enabled);
    showToast(`sound ${enabled ? 'on' : 'off'} · press M to toggle`);
  });
}

// Asked once, under the title, after the intro. Ignoring it is fine: it fades
// away and asks again next visit. Answering it is remembered.
export function askAboutSound(container: HTMLElement) {
  if (hasChosen()) return;
  const prompt = document.createElement('div');
  prompt.id = 'sound-prompt';
  prompt.innerHTML = `
    <span>sound?</span>
    <button type="button" data-on="1">on</button>
    <button type="button" data-on="0">off</button>
    <span class="sp-hint">(M toggles it later)</span>`;
  container.appendChild(prompt);

  const dismiss = () => {
    prompt.classList.remove('show');
    setTimeout(() => prompt.remove(), 600);
  };
  prompt.querySelectorAll<HTMLButtonElement>('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setSound(btn.dataset.on === '1');
      dismiss();
    });
  });
  requestAnimationFrame(() => prompt.classList.add('show'));
  setTimeout(() => { if (prompt.isConnected) dismiss(); }, 9000);
}
