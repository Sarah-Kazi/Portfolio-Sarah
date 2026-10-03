// Turns a Markdown post (with a small front-matter block) into a Post.
// Shared by the in-site blog reader (blogs.ts) and the build step that
// pre-renders each post to its own static page (blog-pages.ts), so both
// always show the same thing.

import { marked } from 'marked';

export interface Post {
  slug: string;
  title: string;
  date: string;       // raw YYYY-MM-DD for sorting
  dateLabel: string;  // human-readable
  tags: string[];
  excerpt: string;
  image: string;      // first image in the post ('' if none), for link previews
  html: string;       // rendered body
  readingMin: number;
}

export function parsePost(slug: string, raw: string): Post {
  const fm = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  const metaBlock = fm ? fm[1] : '';
  const body = (fm ? fm[2] : raw).trim();

  const meta: Record<string, string | string[]> = {};
  for (const line of metaBlock.split(/\r?\n/)) {
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

  // Parsed as UTC and formatted in UTC, so the label is the same whether it
  // is rendered at build time or in a visitor's browser.
  const dateLabel = date
    ? new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : '';

  const html = marked.parse(body) as string;
  const image = (meta.image as string) || html.match(/<img[^>]+src="([^"]+)"/)?.[1] || '';

  return { slug, title, date, dateLabel, tags, excerpt, image, html, readingMin };
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));   // newest first
}

// Where a post's own pre-rendered page lives (see blog-pages.ts).
export function postPath(slug: string): string {
  return `/blogs/${slug}/`;
}
