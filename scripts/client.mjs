// Runs Astro for one client (or all), passing the client slug via the CLIENT env var.
//
//   npm run dev -- <slug>          live preview at http://localhost:4321
//   npm run build -- <slug>        static site → dist/<slug>
//   npm run build:all              every client in clients/
//   npm run preview -- <slug>      serve a built site
//   npm run list                   show available slugs
//
// With no slug, CLIENT from the environment is used (handy for Vercel/Netlify).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [command, ...rest] = process.argv.slice(2);
const slugs = fs
  .readdirSync(path.resolve('clients'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -5))
  .sort();

if (command === 'list') {
  console.log(slugs.join('\n') || 'No clients yet. Run "npm run import".');
  process.exit(0);
}

if (!['dev', 'build', 'preview'].includes(command)) {
  console.error('Usage: node scripts/client.mjs <dev|build|preview|list> [slug | --all]');
  process.exit(1);
}

const targets = rest.includes('--all') ? slugs : [rest.find((a) => !a.startsWith('--')) ?? process.env.CLIENT];

const astro = path.resolve('node_modules/astro/astro.js');
for (const slug of targets) {
  if (!slug || !slugs.includes(slug)) {
    console.error(`Unknown or missing client "${slug ?? ''}". Available:\n  ${slugs.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`\n▶ ${command} ${slug}`);
  const res = spawnSync(process.execPath, [astro, command], {
    stdio: 'inherit',
    env: { ...process.env, CLIENT: slug },
  });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

if (command === 'build') console.log(`\nDone. Output in dist/${targets.length === 1 ? targets[0] : '<slug>'}/`);
