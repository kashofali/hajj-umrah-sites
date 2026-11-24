export type Theme = 'navy' | 'emerald' | 'maroon';

export type IconName =
  | 'calendar' | 'award' | 'plane' | 'hotel' | 'utensils' | 'bus' | 'mosque' | 'drop' | 'bag'
  | 'laundry' | 'moon' | 'compass' | 'ticket' | 'passport' | 'phone' | 'pin' | 'mail' | 'clock'
  | 'instagram' | 'globe' | 'chat' | 'arrow' | 'check' | 'star' | 'menu' | 'close' | 'shield' | 'users'
  | 'heart' | 'book' | 'chevron';

export type Category = 'umrah' | 'ramadan' | 'hajj';

export interface Hotel {
  city: string;
  /** 0 for tents / unrated */
  stars: number;
  distance: string;
  nights: number;
}

export interface Package {
  name: string;
  /** URL slug for /packages/<slug>; derived from `name` when absent */
  slug?: string;
  /** Used by the filters on /packages; guessed from `name` when absent */
  category?: Category;
  /** Shown on the home page. When no package is featured, the first three are shown. */
  featured?: boolean;
  /** Small chip on the card art, e.g. "Deluxe Umrah" */
  type?: string;
  /** Highlight chip, e.g. "Departing soon" */
  badge?: string;
  badgeTone?: 'gold' | 'accent';
  /** e.g. "6 December 2026" or "Every month" */
  date?: string;
  description?: string;
  days?: number;
  nights?: number;
  flight?: string;
  /** e.g. "250 m in Madinah" (shown on the card) */
  hotelDistance?: string;
  /** "Starting from" (default) or "Package price" */
  priceLabel?: string;
  /** Display string, e.g. "₹96,000" or "On request". Derived from `prices.quad` when absent. */
  price?: string;
  /** Per-person price by room sharing, shown on the package page */
  prices?: { quad: number; triple?: number; double?: number };
  hotels?: Hotel[];
  meals?: string;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: { day: string; title: string; text: string }[];
  /** Card photo under public/, e.g. "/clients/<slug>/deluxe.jpg" (a stock photo is used when absent) */
  image?: string;
}

export interface Testimonial {
  name: string;
  location?: string;
  /** e.g. "Deluxe Umrah · Jan 2026" */
  trip?: string;
  text: string;
}

export interface Item {
  icon?: IconName;
  title: string;
  text?: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Photo {
  src: string;
  caption?: string;
}

export interface ContactPerson {
  name?: string;
  phones: string[];
}

export interface Client {
  slug: string;
  name: string;
  /** Logo text: big name + small caps line. Derived from `name` when absent. */
  brand?: { main: string; sub?: string };
  /** Short slogan, shown in the top bar and footer, e.g. "Aapka Umrah, Hamari Zimmedari" */
  slogan?: string;
  /** Hero heading; wrap words in *asterisks* for the gold italic accent */
  heroTitle?: string;
  /** Hero paragraph */
  intro: string;
  city: string;
  address?: string;
  /** 10-digit Indian numbers */
  phones: string[];
  /** Named contacts for the footer (falls back to `phones`) */
  contacts?: ContactPerson[];
  saudiPhone?: string;
  /** Full international number without "+", e.g. "919876543210" */
  whatsapp?: string;
  email?: string;
  hours?: string;
  instagram?: string;
  website?: string;
  mapsLink?: string;
  rating?: number;
  reviews?: number;
  since?: number;
  certification?: string;
  theme: Theme;
  /** Demo mode: adds the demo banner and noindex */
  demo: boolean;
  /** Packages/reviews are placeholders until the client sends real ones */
  sampleContent: boolean;
  packages: Package[];
  services?: Item[];
  highlights?: Item[];
  /** "How it works" steps on the home page */
  steps?: Item[];
  faqs?: Faq[];
  about?: {
    /** Paragraphs for "Our story" */
    story?: string[];
    values?: Item[];
    milestones?: { year: string; text: string }[];
    pilgrims?: string;
  };
  testimonials: Testimonial[];
  /** Image paths under public/, e.g. "/clients/<slug>/hero.jpg" */
  heroImage?: string;
  hospitalityImages?: string[];
  gallery: (string | Photo)[];
  logo?: string;
}
