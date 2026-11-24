// Shared stock photos in public/images/, used when a client has no photos of their own.
// All from Unsplash (free for commercial use, no attribution required): https://unsplash.com/license
import type { Category, Package } from './types';

export const IMAGES = {
  hero: '/images/hero-kaaba.jpg',
  hospitality: ['/images/madinah-dome.jpg', '/images/madinah-umbrellas.jpg'],
  banners: {
    makkah: '/images/banner-makkah.jpg',
    madinah: '/images/banner-madinah.jpg',
    haram: '/images/banner-haram.jpg',
    night: '/images/banner-night.jpg',
  },
};

const BY_CATEGORY: Record<Category, string> = {
  umrah: '/images/pkg-umrah.jpg',
  ramadan: '/images/pkg-ramadan.jpg',
  hajj: '/images/pkg-hajj.jpg',
};

/** Card photo for a package: its own `image`, else one picked from its name, else its category's. */
export function packageImage(p: Package & { category: Category }): string {
  if (p.image) return p.image;
  if (/deluxe|premium|luxury|5\s*star|★/i.test(p.name)) return '/images/pkg-deluxe.jpg';
  if (/family|group|winter|holiday/i.test(p.name)) return '/images/pkg-family.jpg';
  return BY_CATEGORY[p.category];
}

/** Wide banner for a package's detail page. */
export const packageBanner = (category: Category) =>
  category === 'hajj' ? IMAGES.banners.haram : category === 'ramadan' ? IMAGES.banners.night : IMAGES.banners.makkah;
