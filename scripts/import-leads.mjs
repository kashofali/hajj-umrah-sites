// Reads the leads tracker (or a Google Maps leads export) and writes one clients/<slug>.json per lead.
// Existing configs are never overwritten (unless --force), so your edits are safe.
//
// Usage:  npm run import [-- <path-to-xlsx>] [-- --force]
import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

XLSX.set_fs(fs);

const args = process.argv.slice(2);
const force = args.includes('--force');
const xlsxPath = path.resolve(args.find((a) => !a.startsWith('--')) ?? '../Hajj & Umrah Leads Tracker.xlsx');
const outDir = path.resolve('clients');
const THEMES = ['navy', 'emerald', 'maroon'];

if (!fs.existsSync(xlsxPath)) {
  console.error(`Tracker not found: ${xlsxPath}`);
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);
const sheet = wb.Sheets['Leads'] ?? wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

const text = (v) => String(v ?? '').trim();
const slugify = (s) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
// The tracker and the Google Maps export name their columns differently; take the first one present.
const col = (row, ...keys) => {
  for (const k of keys) if (text(row[k])) return text(row[k]);
  return '';
};
// "..., Kalyan West, Kalyan, Maharashtra 421301, India" -> "Kalyan"
const cityFromAddress = (address) => {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.at(-1)?.toLowerCase() === 'india') parts.pop();
  const statePin = parts.length && /\d{6}$/.test(parts.at(-1)) ? parts.pop() : undefined;
  const city = statePin ? parts.at(-1) : undefined;
  return city ? city.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';
};
// Google Maps names are often stuffed with keywords:
// "Al Madina Tours - Hajj & Umrah Packages / Ziyarat Service / ..." -> "Al Madina Tours"
const cleanName = (raw) => {
  let n = raw.replace(/\s+/g, ' ').trim();
  if (n.length <= 40) return n;
  n = n.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  for (const sep of [' - ', ' | ', ' / ', ',']) {
    const first = n.split(sep)[0].trim();
    if (n.length > 40 && first.split(' ').length >= 2) n = first;
  }
  return n;
};
const phonesOf = (s) =>
  text(s)
    .split(/[\/,;]/)
    .map((p) => p.replace(/\D/g, '').slice(-10))
    .filter((p) => p.length === 10);

// Sample content, shown with "sample" notes until the client sends real details.
const UMRAH_INCLUSIONS = [
  'Umrah visa with medical insurance',
  'Return economy air tickets from India',
  'Hotel stay in Makkah and Madinah as listed',
  'All transfers by AC bus in Saudi Arabia',
  'Makkah & Madinah Ziyarat with a guide',
  'Pre-departure Umrah training session',
  'Experienced group leader throughout',
  'Umrah kit: ihram, belt, bag and dua book',
];

const SAMPLE_PACKAGES = [
  {
    name: 'Economy Umrah',
    type: 'Economy Umrah',
    category: 'umrah',
    featured: true,
    badge: 'Best value',
    date: 'Departures every month',
    description: 'A comfortable, well-organised Umrah for families, with everything arranged from visa to Ziyarat.',
    days: 15,
    nights: 14,
    flight: 'Return flight',
    hotelDistance: '700 m in Makkah',
    prices: { quad: 85000, triple: 91000, double: 99000 },
    hotels: [
      { city: 'Makkah', stars: 3, distance: '700 m from Masjid al-Haram (shuttle)', nights: 9 },
      { city: 'Madinah', stars: 3, distance: '400 m from Masjid an-Nabawi', nights: 5 },
    ],
    meals: 'Breakfast, lunch and dinner (Indian buffet)',
    inclusions: UMRAH_INCLUSIONS,
    itinerary: [
      { day: 'Day 1', title: 'India → Jeddah', text: 'Assemble at the airport in ihram. Arrive in Jeddah and transfer to Makkah by AC bus.' },
      { day: 'Day 2', title: 'Perform Umrah', text: "Perform Umrah together with the group leader: tawaf, sa'i and halq/taqsir." },
      { day: 'Day 3 – 9', title: 'Ibadah in Makkah', text: 'Prayers in the Haram. Makkah Ziyarat: Jabal al-Nour, Jabal Thawr, Mina, Muzdalifah and Arafat.' },
      { day: 'Day 10', title: 'Makkah → Madinah', text: 'Farewell tawaf, then travel to Madinah by AC bus.' },
      { day: 'Day 11 – 14', title: 'Ibadah in Madinah', text: 'Salam at Rawdah (subject to Nusuk permit). Ziyarat of Masjid Quba, Uhud and Masjid Qiblatain.' },
      { day: 'Day 15', title: 'Return home', text: 'Transfer to Madinah airport and fly home.' },
    ],
  },
  {
    name: 'Deluxe Umrah',
    type: 'Deluxe Umrah',
    category: 'umrah',
    featured: true,
    badge: 'Most popular',
    date: 'Winter 2026 departures',
    description: 'Hotels a short walk from both Harams, full-board Indian buffet and Ziyarat with an experienced guide.',
    days: 15,
    nights: 14,
    flight: 'Direct flight',
    hotelDistance: '250 m in Madinah',
    prices: { quad: 110000, triple: 118000, double: 130000 },
    hotels: [
      { city: 'Makkah', stars: 4, distance: '350 m from Masjid al-Haram', nights: 9 },
      { city: 'Madinah', stars: 4, distance: '250 m from Masjid an-Nabawi', nights: 5 },
    ],
    meals: 'Breakfast, lunch and dinner (Indian buffet)',
    inclusions: [...UMRAH_INCLUSIONS, 'Zamzam water on return'],
    itinerary: [
      { day: 'Day 1', title: 'India → Jeddah', text: 'Direct flight in ihram. Arrive in Jeddah and transfer to your hotel in Makkah.' },
      { day: 'Day 2', title: 'Perform Umrah', text: 'Guided Umrah with the group leader, followed by rest.' },
      { day: 'Day 3 – 9', title: 'Ibadah in Makkah', text: 'Prayers in the Haram, Makkah Ziyarat and an optional second Umrah from Masjid Aisha.' },
      { day: 'Day 10', title: 'Makkah → Madinah', text: 'Farewell tawaf. Travel to Madinah by AC bus or Haramain train (on request).' },
      { day: 'Day 11 – 14', title: 'Ibadah in Madinah', text: 'Prayers in Masjid an-Nabawi, Rawdah visit and Madinah Ziyarat.' },
      { day: 'Day 15', title: 'Return home', text: 'Fly home with Zamzam.' },
    ],
  },
  {
    name: 'Ramadan Umrah',
    type: 'Ramadan Umrah',
    category: 'ramadan',
    featured: true,
    badge: 'Ramadan special',
    badgeTone: 'accent',
    date: 'Ramadan 2027 · last ashra',
    description: 'Spend the blessed last ten nights in the Haram, with suhoor and iftar arranged for your group, and Eid in Madinah.',
    days: 20,
    nights: 19,
    flight: 'Direct flight',
    hotelDistance: '300 m in Makkah',
    prices: { quad: 160000, triple: 172000, double: 190000 },
    hotels: [
      { city: 'Makkah', stars: 4, distance: '300 m from Masjid al-Haram', nights: 12 },
      { city: 'Madinah', stars: 4, distance: '200 m from Masjid an-Nabawi', nights: 7 },
    ],
    meals: 'Suhoor and iftar buffet daily, Eid lunch',
    inclusions: [...UMRAH_INCLUSIONS, 'Suhoor and iftar every day'],
    itinerary: [
      { day: 'Day 1', title: 'India → Jeddah', text: 'Fly in ihram and transfer to Makkah.' },
      { day: 'Day 2', title: 'Perform Umrah', text: 'Guided Umrah in the blessed month.' },
      { day: 'Day 3 – 12', title: 'Last ten nights in Makkah', text: 'Taraweeh and Qiyam ul-Layl in the Haram, seeking Laylat al-Qadr.' },
      { day: 'Day 13', title: 'Makkah → Madinah', text: 'Travel to Madinah after the khatam ul-Quran.' },
      { day: 'Day 14 – 19', title: 'Eid in Madinah', text: 'Eid prayer in Masjid an-Nabawi, Rawdah visit and Madinah Ziyarat.' },
      { day: 'Day 20', title: 'Return home', text: 'Fly home with Zamzam.' },
    ],
  },
  {
    name: 'Family Winter Umrah',
    type: 'Family Umrah',
    category: 'umrah',
    badge: 'School holidays',
    date: 'December 2026',
    description: 'Timed with the winter school break, with family rooms, child-friendly meals and a slower pace for elders.',
    days: 12,
    nights: 11,
    flight: 'Direct flight',
    hotelDistance: '450 m in Makkah',
    prices: { quad: 99000, triple: 106000, double: 117000 },
    hotels: [
      { city: 'Makkah', stars: 4, distance: '450 m from Masjid al-Haram', nights: 7 },
      { city: 'Madinah', stars: 4, distance: '250 m from Masjid an-Nabawi', nights: 4 },
    ],
    meals: 'Breakfast, lunch and dinner (Indian buffet)',
    inclusions: [...UMRAH_INCLUSIONS, 'Wheelchair assistance for elders (on request)', 'Child fare discount (2 – 11 yrs)'],
    itinerary: [
      { day: 'Day 1', title: 'India → Jeddah', text: 'Fly in ihram and transfer to Makkah.' },
      { day: 'Day 2', title: 'Perform Umrah', text: 'Guided Umrah at a gentle pace, with wheelchair help for elders.' },
      { day: 'Day 3 – 7', title: 'Ibadah in Makkah', text: 'Prayers in the Haram and Makkah Ziyarat.' },
      { day: 'Day 8', title: 'Makkah → Madinah', text: 'Travel to Madinah by AC bus.' },
      { day: 'Day 9 – 11', title: 'Ibadah in Madinah', text: 'Prayers in Masjid an-Nabawi and Madinah Ziyarat.' },
      { day: 'Day 12', title: 'Return home', text: 'Fly home from Madinah.' },
    ],
  },
  {
    name: 'Hajj 2027',
    type: 'Hajj',
    category: 'hajj',
    badge: 'Limited seats',
    date: 'May 2027 · Dhul Hijjah 1448',
    description: 'A complete, scholar-guided Hajj with Aziziyah and Haram-side stays, upgraded Mina tents and full-board meals.',
    days: 35,
    nights: 34,
    flight: 'Direct flight',
    hotelDistance: '400 m in Makkah',
    prices: { quad: 740000, triple: 790000, double: 865000 },
    hotels: [
      { city: 'Aziziyah', stars: 4, distance: 'Building with shuttle to the Haram', nights: 15 },
      { city: 'Makkah', stars: 4, distance: '400 m from Masjid al-Haram', nights: 6 },
      { city: 'Mina', stars: 0, distance: 'Upgraded AC tents with sofa-beds', nights: 5 },
      { city: 'Madinah', stars: 4, distance: '200 m from Masjid an-Nabawi', nights: 8 },
    ],
    meals: 'Full board (Indian buffet), plus meals in Mina and Arafat',
    inclusions: [
      'Hajj visa and Nusuk registration',
      'Return economy air tickets from India',
      'Hotel stays and Mina tents as listed',
      'All transfers in Saudi Arabia, including the Mashair',
      'Qurbani (sacrifice) arranged',
      'Daily lectures by an accompanying Aalim',
      'Hajj training workshops before departure',
      'Hajj kit: ihram, bags, umbrella and dua book',
    ],
    itinerary: [
      { day: 'Day 1', title: 'India → Jeddah / Madinah', text: 'Group departure. Arrival city depends on the flight allotment.' },
      { day: 'Day 2 – 15', title: 'Makkah & Aziziyah', text: 'Umrah, ibadah in the Haram and preparation sessions for Hajj.' },
      { day: '8 Dhul Hijjah', title: 'Mina', text: 'Move to Mina in ihram for Yawm at-Tarwiyah.' },
      { day: '9 Dhul Hijjah', title: 'Arafat & Muzdalifah', text: 'Wuquf at Arafat, then the night under the open sky at Muzdalifah.' },
      { day: '10 – 13 Dhul Hijjah', title: 'Rami, Qurbani, Tawaf', text: 'Stoning of the Jamarat, sacrifice, halq and Tawaf al-Ifadah.' },
      { day: 'Day 26 – 34', title: 'Madinah', text: 'Prayers in Masjid an-Nabawi, Rawdah visit and Ziyarat.' },
      { day: 'Day 35', title: 'Return home', text: 'Fly home with Zamzam.' },
    ],
  },
];

const SAMPLE_TESTIMONIALS = (city) => [
  {
    name: 'Mohammed Arif',
    location: city,
    trip: 'Deluxe Umrah',
    text: 'Alhamdulillah, everything was arranged perfectly, from visa to hotel. Our family could focus completely on our ibadah.',
  },
  {
    name: 'Shabana Shaikh',
    location: city,
    trip: 'Family Umrah',
    text: 'The hotel was very close to the Haram and the group leader helped my elderly parents at every step.',
  },
  {
    name: 'Imran Khan',
    location: city,
    trip: 'Ramadan Umrah',
    text: 'Transparent pricing with no hidden charges. JazakAllah khair to the whole team, we will travel with them again.',
  },
];

fs.mkdirSync(outDir, { recursive: true });
const cityCount = {};
const seen = new Set();
const cityOffset = {};
let created = 0,
  skipped = 0;

for (const row of rows) {
  const name = cleanName(col(row, 'Business Name', 'name'));
  if (!name) continue;
  const address = col(row, 'Address', 'address');
  const city = col(row, 'City') || cityFromAddress(address) || 'India';
  // Two different agencies can share a name; add the city to keep slugs unique.
  let slug = slugify(name);
  if (seen.has(slug)) slug = slugify(`${name} ${city}`);
  seen.add(slug);

  // Rotate themes within each city so neighbouring agencies get different colours.
  // Each city starts at a different theme so single-lead cities aren't all the same.
  cityOffset[city] ??= Object.keys(cityOffset).length;
  const n = (cityCount[city] = (cityCount[city] ?? 0) + 1);
  const theme = THEMES[(cityOffset[city] + n - 1) % THEMES.length];

  const file = path.join(outDir, `${slug}.json`);
  if (fs.existsSync(file) && !force) {
    skipped++;
    continue;
  }

  const phones = [...new Set([...phonesOf(col(row, 'Phone', 'phone')), ...phonesOf(col(row, 'intl_phone'))])];

  const client = {
    slug,
    name,
    intro: `Families from ${city} trust us with the journey of a lifetime: Umrah visa, flights, hotels a short walk from the Haram, fresh meals and guided Ziyarat, all taken care of.`,
    city,
    address: address && address !== city ? address : undefined,
    phones,
    whatsapp: phones[0] ? `91${phones[0]}` : undefined,
    instagram: col(row, 'Instagram') || undefined,
    website: col(row, 'Website', 'website') || undefined,
    mapsLink: col(row, 'Google Maps Link', 'maps_url') || undefined,
    rating: Number(col(row, 'Google Rating', 'rating')) || undefined,
    reviews: Number(col(row, 'Reviews', 'review_count')) || undefined,
    theme,
    demo: true,
    sampleContent: true,
    packages: SAMPLE_PACKAGES,
    testimonials: SAMPLE_TESTIMONIALS(city),
    gallery: [],
  };

  fs.writeFileSync(file, JSON.stringify(client, null, 2) + '\n');
  created++;
  const warn = phones.length ? '' : '  ⚠ no phone number, so no WhatsApp button';
  console.log(`✓ ${slug}  (${theme})${warn}`);
}

console.log(`\n${created} created, ${skipped} skipped (already exist${force ? '' : '; use --force to overwrite'}).`);
