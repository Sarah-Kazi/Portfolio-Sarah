
import { marked } from 'marked';
import { navigate, onRoute } from '../router';
import './blogs.css';

interface Post {
  slug: string;
  title: string;
  date: string;       // raw YYYY-MM-DD for sorting
  dateLabel: string;  // human-readable
  tags: string[];
  excerpt: string;
  html: string;       // rendered body
  readingMin: number;
}

// Eagerly import every post as a raw string at build time.
const raws = import.meta.glob('../blog/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function parsePost(path: string, raw: string): Post {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');

  const fm = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const metaBlock = fm ? fm[1] : '';
  const body = (fm ? fm[2] : raw).trim();

  const meta: Record<string, string | string[]> = {};
  for (const line of metaBlock.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      meta[key] = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else {
      meta[key] = val.replace(/^["']|["']$/g, '');
    }
  }

  const title = (meta.title as string) || slug;
  const date  = (meta.date as string) || '';
  const tags  = Array.isArray(meta.tags) ? meta.tags : [];
  const excerpt = (meta.excerpt as string) || '';

  const words = body.split(/\s+/).filter(Boolean).length;
  const readingMin = Math.max(1, Math.round(words / 200));

  const dateLabel = date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const html = marked.parse(body) as string;

  return { slug, title, date, dateLabel, tags, excerpt, html, readingMin };
}

const POSTS: Post[] = Object.entries(raws)
  .map(([path, raw]) => parsePost(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : -1));   // newest first

const PANEL_MARKUP = `
  <div class="blog-panel">
    <div class="blog-toolbar">
      <button class="blog-back" type="button" hidden>← All posts</button>
      <span class="blog-spacer"></span>
      <button class="blog-fs" type="button" aria-label="Toggle full screen" title="Full screen">⤢</button>
    </div>
    <div class="blog-scroll">
      <section class="blog-index">
        <div class="blog-eyebrow">Writing</div>
        <div class="blog-list"></div>
      </section>
      <article class="blog-reader" hidden>
        <h1 class="blog-art-title"></h1>
        <div class="blog-art-meta"></div>
        <div class="blog-art-body"></div>
      </article>
    </div>
  </div>`;

export default function initializeBlogs() {
  const section = document.getElementById('blogs');
  if (!section) return;

  const goBack = document.getElementById('go-back-button');

 
  section.innerHTML = PANEL_MARKUP;

  const panel    = section.querySelector('.blog-panel')     as HTMLElement;
  const scrollEl = section.querySelector('.blog-scroll')    as HTMLElement;
  const indexEl  = section.querySelector('.blog-index')     as HTMLElement;
  const readerEl = section.querySelector('.blog-reader')    as HTMLElement;
  const listEl   = section.querySelector('.blog-list')      as HTMLElement;
  const artTitle = section.querySelector('.blog-art-title') as HTMLElement;
  const artMeta  = section.querySelector('.blog-art-meta')  as HTMLElement;
  const artBody  = section.querySelector('.blog-art-body')  as HTMLElement;
  const backBtn  = section.querySelector('.blog-back')      as HTMLButtonElement;
  const fsBtn    = section.querySelector('.blog-fs')        as HTMLButtonElement;

  // Build the index once.
  if (!POSTS.length) {
    listEl.innerHTML = '<p class="blog-empty">No posts yet. Add a Markdown file to <code>src/blog/posts</code>.</p>';
  } else {
    POSTS.forEach((p) => {
      const item = document.createElement('button');
      item.className = 'blog-item';
      item.type = 'button';
      item.innerHTML = `
        <span class="blog-item-title">${p.title}</span>
        <span class="blog-item-meta">${p.dateLabel} · ${p.readingMin} min read</span>
        ${p.excerpt ? `<span class="blog-item-excerpt">${p.excerpt}</span>` : ''}`;
      item.addEventListener('click', () => navigate('blogs', p.slug));
      listEl.appendChild(item);
    });
  }

  function showIndex() {
    readerEl.hidden = true;
    indexEl.hidden = false;
    backBtn.hidden = true;
    scrollEl.scrollTop = 0;
  }

  function openPost(i: number) {
    const p = POSTS[i];
    artTitle.textContent = p.title;
    const tagsHtml = p.tags.length
      ? ' · ' + p.tags.map(t => `<span class="blog-tag">${t}</span>`).join(' ')
      : '';
    artMeta.innerHTML = `${p.dateLabel} · ${p.readingMin} min read${tagsHtml}`;
    artBody.innerHTML = p.html;
    indexEl.hidden = true;
    readerEl.hidden = false;
    backBtn.hidden = false;
    scrollEl.scrollTop = 0;
  }

  // Full screen: lift the panel out to <body> so it fills the viewport (rather
  // than being trapped, scaled, in the parallax layer), then drop it back.
  let isFs = false;
  function setFullscreen(on: boolean) {
    if (on === isFs) return;
    isFs = on;
    if (on) {
      document.body.appendChild(panel);
      panel.classList.add('blog-fullscreen');
      fsBtn.textContent = '⤡';
      fsBtn.title = 'Exit full screen';
    } else {
      section!.appendChild(panel);
      panel.classList.remove('blog-fullscreen');
      fsBtn.textContent = '⤢';
      fsBtn.title = 'Full screen';
    }
  }

  backBtn.addEventListener('click', () => navigate('blogs'));
  fsBtn.addEventListener('click', () => setFullscreen(!isFs));
  document.addEventListener('keydown', (e) => {
    // Exit fullscreen and consume the key so the planet handler doesn't also
    // deorbit; when not fullscreen, let Escape fall through to deorbit.
    if (e.key === 'Escape' && isFs) { setFullscreen(false); e.preventDefault(); }
  });

  // Keep Deorbit drifting in the parallax layer (just nudged below the panel).
  // Whether the index or a specific post shows is decided by the route below,
  // not here, so a deep-linked #/blogs/<slug> lands straight on the post.
  new MutationObserver(() => {
    if (section.style.display === 'block') {
      if (goBack) goBack.classList.add('blogs-deorbit');
    } else {
      if (isFs) setFullscreen(false);
      if (goBack) goBack.classList.remove('blogs-deorbit');
    }
  }).observe(section, { attributes: true, attributeFilter: ['style'] });

  // The route drives which view shows. Planets open/close the #blogs section
  // itself (matching the leading segment); this only reconciles the sub-view:
  //   #/blogs          → the index
  //   #/blogs/<slug>   → that post (falls back to the index if unknown)
  onRoute(({ section: routeSection, slug }) => {
    if (routeSection !== 'blogs') return;
    if (!slug) { showIndex(); return; }
    const i = POSTS.findIndex(p => p.slug === slug);
    if (i >= 0) openPost(i); else showIndex();
  });
}
