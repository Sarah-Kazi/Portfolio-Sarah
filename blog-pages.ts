// Static site generation for the blog: every Markdown post in
// src/blog/posts becomes its own pre-rendered page at /blogs/<slug>/.
//
// - `npm run build` writes dist/blogs/<slug>/index.html for each post.
// - `npm run dev` serves the same pages on the fly, so they can be previewed.
//
// The page is the finished article in plain HTML (no app to boot), styled
// like the site's full-screen reader, with its own <title>, description and
// Open Graph tags so a shared link previews properly in chat apps.

import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { parsePost, postPath, type Post } from './src/blog/parse';

const POSTS_DIR = path.resolve(__dirname, 'src/blog/posts');
const ARTICLE_CSS = path.resolve(__dirname, 'src/blog/article.css');
const FONTS = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500&family=JetBrains+Mono:wght@400;500;700&display=swap';

function readPosts(): Post[] {
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => parsePost(f.replace(/\.md$/, ''), fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8')));
}

const esc = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Link previews need absolute URLs; SITE_URL (e.g. https://sarahkazi.dev) is
// read from the environment or a .env file. Without it, relative URLs are
// used, which most apps can't turn into a preview image.
function absolute(siteUrl: string, p: string): string {
  return siteUrl ? new URL(p, siteUrl).href : p;
}

function renderPage(post: Post, siteUrl: string): string {
  const css = fs.readFileSync(ARTICLE_CSS, 'utf-8');
  const description = post.excerpt || `${post.title} by Sarah Kazi`;
  const image = absolute(siteUrl, post.image || '/icon-512.png');
  const url = absolute(siteUrl, postPath(post.slug));
  const tags = post.tags.map(t => `<span class="blog-tag">${esc(t)}</span>`).join(' ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${esc(post.title)} · Sarah Kazi</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="canonical" href="${esc(url)}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Sarah Kazi" />
  <meta property="og:title" content="${esc(post.title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:image" content="${esc(image)}" />
  ${post.date ? `<meta property="article:published_time" content="${esc(post.date)}" />` : ''}
  <meta name="twitter:card" content="${post.image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${esc(post.title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet" media="print" onload="this.media='all'">

  <style>
    html, body { margin: 0; background: #000; color: #e9e7e2; }
    body { font-family: 'Chakra Petch', sans-serif; -webkit-tap-highlight-color: transparent; }

    .bp-bar {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: calc(14px + env(safe-area-inset-top)) 18px 14px;
      background: rgba(0, 0, 0, 0.88);
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }
    .bp-spacer { flex: 1; }
    .bp-bar a,
    .bp-bar button {
      padding: 4px 8px;
      background: none;
      border: none;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.74rem;
      letter-spacing: 0.06em;
      color: #8f9bb3;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .bp-bar a:hover,
    .bp-bar button:hover { color: #9ecbf0; }

    /* Same reading column as the site's full-screen reader. */
    .blog-reader {
      padding: 40px max(5vw, calc((100vw - 760px) / 2)) calc(80px + env(safe-area-inset-bottom));
    }

${css}
  </style>
</head>
<body>
  <header class="bp-bar">
    <a href="/#/blogs">&larr; All posts</a>
    <span class="bp-spacer"></span>
    <button class="bp-share" type="button">Share</button>
    <a href="/">Sarah Kazi</a>
  </header>

  <article class="blog-reader">
    <h1 class="blog-art-title">${esc(post.title)}</h1>
    <div class="blog-art-meta">${esc(post.dateLabel)} · ${post.readingMin} min read${tags ? ` · ${tags}` : ''}</div>
    <div class="blog-art-body">${post.html}</div>
  </article>

  <script>
    // Share sheet on phones; elsewhere copy the link.
    (function () {
      var btn = document.querySelector('.bp-share');
      var reset = 0;
      function flash(text) {
        btn.textContent = text;
        clearTimeout(reset);
        reset = setTimeout(function () { btn.textContent = 'Share'; }, 1600);
      }
      btn.addEventListener('click', function () {
        var url = location.origin + location.pathname;
        var title = ${JSON.stringify(post.title)};
        if (navigator.share && matchMedia('(pointer: coarse)').matches) {
          navigator.share({ title: title, url: url }).catch(function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () { flash('Link copied'); }, function () { flash('Copy failed'); });
        }
      });
    })();
  </script>
</body>
</html>
`;
}

export default function blogPages(siteUrl = ''): Plugin {
  return {
    name: 'blog-pages',

    // Dev: render /blogs/<slug> and /blogs/<slug>/ on request.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.split('?')[0].match(/^\/blogs\/([\w-]+)\/?$/);
        if (!m) return next();
        const post = readPosts().find(p => p.slug === m[1]);
        if (!post) return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(renderPage(post, siteUrl));
      });
    },

    // Build: one dist/blogs/<slug>/index.html per post.
    generateBundle() {
      for (const post of readPosts()) {
        this.emitFile({
          type: 'asset',
          fileName: `blogs/${post.slug}/index.html`,
          source: renderPage(post, siteUrl),
        });
      }
    },
  };
}
