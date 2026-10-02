

interface Project {
  title: string;
  description: string;
  status: 'live' | 'wip' | 'archived';
  statusLabel: string;
  languages: { name: string; color: string }[];
  tags: string[];
  period: string;
  repoUrl?: string;
  liveUrl?: string;
}


export const PROJECTS: Project[] = [
  {
    title: 'NginXray - eBPF/XDP Security Agent for Nginx',
    description: 'A kernel-space security agent for Nginx built with eBPF/XDP and libbpf (CO-RE) for portable, line-rate packet inspection: LPM-trie IPv4/IPv6 blocklisting, OpenSSL uprobe TLS inspection to capture cleartext at the SSL_write/read boundary, and a Go control plane for live rule updates over BPF maps.',
    status: 'wip',
    statusLabel: 'Ongoing',
    languages: [
      { name: 'C', color: '#555555' },
      { name: 'Go', color: '#00ADD8' },
    ],
    tags: ['eBPF/XDP', 'libbpf', 'OpenSSL'],
    period: 'Team · PES Innovation Lab',
    repoUrl: 'https://github.com/pes-innovation-lab/NginXray',
  },
  {
    title: 'Bluffmaster - Online Multiplayer Card Game',
    description: 'A real-time multiplayer bluffing card game: Next.js 14, React and TailwindCSS on the frontend, a Node.js + Socket.IO backend with Redis for room and session management, in-game chat, and a single-player bot mode.',
    status: 'live',
    statusLabel: 'Live',
    languages: [{ name: 'TypeScript', color: '#3178c6' }],
    tags: ['Next.js', 'Socket.IO', 'Redis', 'Node.js'],
    period: 'Solo',
    liveUrl: 'https://bluff-master-plum.vercel.app/play',
  },
  {
    title: 'Clipboard Manager - Browser Extension',
    description: 'A Chrome extension for a smarter clipboard: save multiple clips, organise them, and one-click copy across browsing sessions, backed by persistent local storage and a clean management UI.',
    status: 'archived',
    statusLabel: 'Complete',
    languages: [{ name: 'JavaScript', color: '#f1e05a' }],
    tags: ['Chrome Extension', 'HTML', 'CSS'],
    period: 'Solo',
    repoUrl: 'https://github.com/Sarah-Kazi/clipboard_extension',
  },
  {
    title: 'ATM Simulation System',
    description: 'A secure terminal banking app in C: SHA-256 hashed PINs, Twilio SMS notifications, and full transaction processing (withdrawals, deposits, transfers) over file-based account storage with receipts.',
    status: 'archived',
    statusLabel: 'Complete',
    languages: [{ name: 'C', color: '#555555' }],
    tags: ['C', 'SHA-256', 'Twilio API'],
    period: 'Solo',
    repoUrl: 'https://github.com/Sarah-Kazi/atm_simulation',
  },
  {
    title: 'aWASMe - WebAssembly Interpreter',
    description: 'A WebAssembly interpreter with dual modes: a browser-based VM and a WASM simulator. A structured parsing and execution pipeline in C++ and Emscripten loads binary modules, validates and decodes instructions, and simulates a full virtual machine in the browser.',
    status: 'wip',
    statusLabel: 'Mentored',
    languages: [{ name: 'C++', color: '#f34b7d' }],
    tags: ['C++', 'Emscripten', 'WebAssembly'],
    period: 'Mentored · ACM',
    repoUrl: 'https://github.com/acmpesuecc/aWASMe',
  },
  {
    title: 'Portfolio',
    description: 'You are here :D A personal portfolio website built with Vite, TypeScript, and a parallax engine for interactive 2D/3D effects. Features include a blog, gallery, and project showcase with smooth animations and responsive design.',
    status: 'live',
    statusLabel: 'Live',
    languages: [{ name: 'TypeScript', color: '#3178c6' }],
    tags: ['Vite', 'Canvas', 'Parallax'],
    period: 'Solo',
    repoUrl: 'https://github.com/Sarah-Kazi',
  },
];


const ARC_RADIUS    = 340;   // px: orbit radius the cards sit on
const ARC_SPREAD    = 0.62;  // rad: angular gap between adjacent cards
const ARC_Y         = 16;    // px: focused card offset below planet centre
const MAX_VISIBLE   = 2.6;   // |rel| beyond which a card fades fully out
const FOCUS_LERP    = 0.12;  // easing toward the focused index each frame
const DEORBIT_GAP   = 18;    // px above the planet's top edge

export function buildCard(p: Project): HTMLElement {
  const card = document.createElement('div');
  card.className = 'proj-card';

  const titleEl = p.repoUrl
    ? `<a class="proj-title" href="${p.repoUrl}" target="_blank" rel="noopener">${p.title}</a>`
    : `<span class="proj-title">${p.title}</span>`;

  const langs = p.languages
    .map(l => `<span class="proj-lang"><i style="background:${l.color}"></i>${l.name}</span>`)
    .join('');

  const tags = p.tags.map(t => `<span class="proj-tag">${t}</span>`).join('');

  const links = [
    p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener">repo ↗</a>` : '',
    p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener">live ↗</a>` : '',
  ].join('');

  card.innerHTML = `
    <div class="proj-head">
      ${titleEl}
      <span class="proj-status ${p.status}">${p.statusLabel}</span>
    </div>
    <p class="proj-desc">${p.description}</p>
    <div class="proj-langs">${langs}</div>
    <div class="proj-tags">${tags}</div>
    <div class="proj-foot">
      <span class="proj-period">${p.period}</span>
      <span class="proj-links">${links}</span>
    </div>`;

  return card;
}

export default function initializeProjects() {
  const section = document.getElementById('projects');
  if (!section) return;

  const goBack = document.getElementById('go-back-button');
  const P = PROJECTS.length;

  // Build cards once, parked on <body>.
  const cards = PROJECTS.map(p => {
    const el = buildCard(p);
    document.body.appendChild(el);
    return el;
  });

  let focusIndex = 0;   // which project is targeted
  let focusFloat = 0;   // eased position, wraps within [0, P)
  let running    = false;
  let rafId      = 0;

  // Shortest signed distance from focusFloat to index i on the ring.
  function relOf(i: number): number {
    let rel = i - focusFloat;
    rel = ((rel % P) + P) % P;
    if (rel > P / 2) rel -= P;
    return rel;
  }

  function go(delta: number) {
    focusIndex = (focusIndex + delta + P) % P;
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
    
      if (Math.abs(relOf(i)) < 0.5) return;
      e.preventDefault();
      focusIndex = i;
    });
  });

  function onKey(e: KeyboardEvent) {
    if (!running) return;
    if (e.key === 'ArrowRight') go(+1);
    if (e.key === 'ArrowLeft')  go(-1);
  }

  function planetRect(): DOMRect | null {

    const img = document.querySelector<HTMLImageElement>('#planet-2 img');
    return img ? img.getBoundingClientRect() : null;
  }

  function loop() {
    const rect = planetRect();

    if (rect) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Ease focusFloat toward focusIndex along the shortest wrapped path.
      let diff = focusIndex - focusFloat;
      diff = ((diff % P) + P) % P;
      if (diff > P / 2) diff -= P;
      focusFloat += diff * FOCUS_LERP;
      focusFloat = ((focusFloat % P) + P) % P;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rel  = relOf(i);
        const a    = Math.abs(rel);

        const theta = rel * ARC_SPREAD;
        const x = cx + ARC_RADIUS * Math.sin(theta);
        const y = (cy + ARC_Y) - ARC_RADIUS * (1 - Math.cos(theta));

        const scale   = Math.max(0.5, 1 - a * 0.16);
        const opacity = a >= MAX_VISIBLE ? 0 : Math.max(0, 1 - a * 0.34);
        const focused = a < 0.5;

        card.style.left      = `${x}px`;
        card.style.top       = `${y}px`;
        card.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        card.style.opacity   = opacity.toFixed(3);
        card.style.zIndex    = `${Math.round(400 - a * 20)}`;
        card.style.filter    = focused ? 'none' : 'brightness(0.82)';
        card.style.pointerEvents = opacity > 0.15 ? 'all' : 'none';
        card.classList.toggle('focused', focused);
      }

    
      if (goBack) {
        goBack.style.left = `${cx}px`;
        goBack.style.top  = `${rect.top - DEORBIT_GAP}px`;
        goBack.style.transform = 'translate(-50%, -100%)';
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    focusIndex = 0;
    focusFloat = 0;
    cards.forEach(c => c.classList.add('visible'));
   
    if (goBack) {
      document.body.appendChild(goBack);
      goBack.classList.add('projects-deorbit');
    }
    document.addEventListener('keydown', onKey);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    cards.forEach(c => {
      c.classList.remove('visible', 'focused');
      c.style.opacity = '0';
      c.style.pointerEvents = 'none';
    });
    document.removeEventListener('keydown', onKey);
    if (goBack) {
      goBack.classList.remove('projects-deorbit');
      goBack.style.left = '';
      goBack.style.top = '';
      goBack.style.transform = '';
    }
  }

  new MutationObserver(() => {
    if (section.style.display === 'block') start();
    else stop();
  }).observe(section, { attributes: true, attributeFilter: ['style'] });
}
