import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Each client builds into its own folder: dist/<slug>
const client = process.env.CLIENT || 'default';

export default defineConfig({
  outDir: `./dist/${client}`,
  vite: { plugins: [tailwindcss()] },
});
