// Tiny hash router. The URL hash is the single source of truth for what's
// open: #/, #/gallery, #/blogs, #/blogs/<slug>. A "section" is a planet's
// --content id (see index.html); the optional second segment is a sub-view
// (a blog post slug). Modules register onRoute() and call navigate() rather
// than touching the DOM directly.

export interface Route {
  section: string | null;
  slug: string | null;
}

type Handler = (route: Route) => void;

const handlers: Handler[] = [];

export function parseRoute(): Route {
  const raw = location.hash.replace(/^#\/?/, '');
  const [section, slug] = raw.split('/');
  return { section: section || null, slug: slug || null };
}

export function currentRoute(): Route {
  return parseRoute();
}

export function navigate(section: string | null, slug?: string | null) {
  const target = section
    ? (slug ? `#/${section}/${slug}` : `#/${section}`)
    : '#/';
  if (location.hash === target) return;
  location.hash = target;   // fires 'hashchange' → emit()
}

export function onRoute(handler: Handler) {
  handlers.push(handler);
}

function emit() {
  const route = parseRoute();
  for (const h of handlers) h(route);
}

window.addEventListener('hashchange', emit);

// Called once after every module has registered its handler, so a
// deep-linked URL is applied on load (see main.ts).
export function startRouter() {
  emit();
}
