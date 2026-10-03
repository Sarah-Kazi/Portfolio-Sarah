import { defineConfig, loadEnv } from 'vite';
import blogPages from './blog-pages';

export default defineConfig(({ mode }) => {
  // Blog link previews need full URLs. Defaults to the live site; a SITE_URL
  // in .env or the hosting environment overrides it (e.g. a custom domain).
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [blogPages(env.SITE_URL || 'https://portfolio-sarah-five.vercel.app')],
  };
});
