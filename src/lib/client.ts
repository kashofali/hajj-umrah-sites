import fs from 'node:fs';
import path from 'node:path';
import type { Category, Client, Faq, Item, Package, Photo, Theme } from './types';
import { defaultFaqs, defaultServices, DEFAULT_HIGHLIGHTS, DEFAULT_STEPS } from './defaults';
import { IMAGES, packageImage } from './images';

export const THEMES: Theme[] = ['navy', 'emerald', 'maroon'];

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/packages', label: 'Packages' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export const CATEGORIES: Record<Category, string> = {
  umrah: 'Umrah',
  ramadan: 'Ramadan Umrah',
  hajj: 'Hajj',
};

/** A package after loadClient(): slug, category and price are always set. */
export type Pkg = Package & { slug: string; category: Category; price: string; image: string };
export type LoadedClient = Omit<Client, 'packages'> & {
  packages: Pkg[];
  brand: NonNullable<Client['brand']>;
  services: Item[];
  highlights: Item[];
  steps: Item[];
  faqs: Faq[];
};

let cached: LoadedClient | undefined;

/** Loads clients/<CLIENT>.json (falls back to the first client alphabetically). */
export function loadClient(): LoadedClient {
  if (cached && cached.slug === (process.env.CLIENT || cached.slug)) return cached;
  const dir = path.resolve(process.cwd(), 'clients');
  const slugs = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort()
    : [];
  const slug = process.env.CLIENT || slugs[0];
  if (!slug) throw new Error('No client configs in clients/. Run "npm run import" first.');
  if (!slugs.includes(slug)) {
    throw new Error(`Unknown client "${slug}". Available: ${slugs.join(', ')}`);
  }

  const raw = JSON.parse(fs.readFileSync(path.join(dir, `${slug}.json`), 'utf8')) as Client;
  const missing = (['slug', 'name', 'intro', 'city', 'theme'] as const).filter((k) => !raw[k]);
  if (missing.length) throw new Error(`clients/${slug}.json is missing: ${missing.join(', ')}`);
  if (!THEMES.includes(raw.theme)) {
    throw new Error(`clients/${slug}.json has unknown theme "${raw.theme}" (use ${THEMES.join(', ')})`);
  }

  const packages = (raw.packages ?? []).map(normalisePackage);
  const dupes = packages.map((p) => p.slug).filter((s, i, all) => all.indexOf(s) !== i);
  if (dupes.length) throw new Error(`clients/${slug}.json has packages with the same slug: ${dupes.join(', ')}`);

  cached = {
    ...raw,
    phones: raw.phones ?? [],
    testimonials: raw.testimonials ?? [],
    gallery: raw.gallery ?? [],
    heroImage: raw.heroImage ?? IMAGES.hero,
    hospitalityImages: raw.hospitalityImages?.length ? raw.hospitalityImages : IMAGES.hospitality,
    packages,
    brand: raw.brand ?? brandParts(raw.name),
    services: raw.services?.length ? raw.services : defaultServices(raw),
    highlights: raw.highlights?.length ? raw.highlights : DEFAULT_HIGHLIGHTS,
    steps: raw.steps?.length ? raw.steps : DEFAULT_STEPS,
    faqs: raw.faqs?.length ? raw.faqs : defaultFaqs(raw),
  };
  return cached;
}

function normalisePackage(p: Package): Pkg {
  const category: Category = p.category ?? (/hajj/i.test(p.name) ? 'hajj' : /ramadan/i.test(p.name) ? 'ramadan' : 'umrah');
  const price = p.price ?? (p.prices ? formatINR(p.prices.quad) : 'On request');
  return { ...p, slug: p.slug ?? slugify(p.name), category, price, image: packageImage({ ...p, category }) };
}

/** Packages for the home page: the featured ones, or the first three. */
export function featuredPackages(client: LoadedClient): Pkg[] {
  const featured = client.packages.filter((p) => p.featured);
  return (featured.length ? featured : client.packages).slice(0, 3);
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/★/g, '-star').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

/** "Al Barkat Travels" → { main: "Al Barkat", sub: "Travels" } */
export function brandParts(name: string): { main: string; sub?: string } {
  const m = name.match(
    /^(.+?)\s+((?:hajj?\s+(?:and\s+|&\s+)?umrah\s+)?(?:tours\s+(?:and|&)\s+travels|travels|tours|tourism|international|holidays))$/i,
  );
  if (!m) return { main: name };
  const sub = /tours\s+(and|&)\s+travels/i.test(m[2]) ? 'Tours & Travels' : m[2];
  return { main: m[1], sub };
}

/** Letter for the logo mark: first significant word, skipping "Al". */
export function initial(main: string): string {
  const words = main.split(/\s+/).filter((w) => !/^al$/i.test(w));
  return (words[0] ?? main).charAt(0).toUpperCase();
}

export function photo(p: string | Photo): Photo {
  return typeof p === 'string' ? { src: p } : p;
}

export function waHref(client: Pick<Client, 'whatsapp'>, message: string): string | undefined {
  return client.whatsapp ? `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(message)}` : undefined;
}

/** Best way to reach the agency: WhatsApp → phone → Instagram → contact page. */
export function contactHref(client: Pick<Client, 'whatsapp' | 'phones' | 'instagram'>, message: string): string {
  return (
    waHref(client, message) ??
    (client.phones[0] ? `tel:+91${client.phones[0]}` : undefined) ??
    client.instagram ??
    '/contact'
  );
}

export function contactLabel(client: Pick<Client, 'whatsapp' | 'phones' | 'instagram'>, short = false): string {
  if (client.whatsapp) return short ? 'WhatsApp us' : 'Book on WhatsApp';
  if (client.phones[0]) return 'Call us';
  if (client.instagram) return short ? 'Instagram' : 'Message on Instagram';
  return 'Contact us';
}

export const isExternal = (href: string) => href.startsWith('http');

/** "9221330015" → "+91 92213 30015" */
export function formatPhone(p: string): string {
  const d = p.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : p;
}

export function mapEmbedUrl(client: Pick<Client, 'name' | 'address'>): string | undefined {
  // Only embed with a real street address; name + city alone pins unrelated businesses.
  if (!client.address) return undefined;
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${client.name}, ${client.address}`)}&output=embed`;
}

export const hasAmount = (price: string) => /\d/.test(price);
