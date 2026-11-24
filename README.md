# Hajj & Umrah Sites

One website template for Hajj & Umrah travel agencies. Each agency is a JSON file in
`clients/`, and every build produces a standalone static site for one agency.

## Quick start

```bash
npm install
npm run import                 # tracker xlsx → clients/*.json (skips files that already exist)
npm run list                   # show client slugs
npm run dev -- al-barkat-travels   # live preview at http://localhost:4321
npm run build -- al-barkat-travels # static site → dist/al-barkat-travels/
npm run build:all              # build every client
```

By default, `npm run import` reads `../Hajj & Umrah Leads Tracker.xlsx`. You can pass another path with
`npm run import -- path/to/file.xlsx`. Add `-- --force` to regenerate configs, but **that overwrites your edits**.

The import also reads Google Maps lead exports (columns `name`, `phone`, `intl_phone`, `website`, `address`,
`rating`, `review_count`, `maps_url`), e.g. `npm run import -- "../Leads-2026-11-17.xlsx"`. The city comes from the
address, and long keyword-stuffed names are shortened ("Al Madina Tours - Hajj & Umrah Packages / …" → "Al Madina Tours").

## Editing a client

Open `clients/<slug>.json`. The fields are typed in `src/lib/types.ts`.

| Field | Notes |
|---|---|
| `theme` | `navy`, `emerald` or `maroon` (same layout, different colours) |
| `heroTitle` | hero heading; wrap words in `*asterisks*` for the gold italic accent, e.g. `"Aapka Umrah, *Hamari Zimmedari*"` |
| `intro`, `slogan` | hero paragraph; short slogan for the top bar and footer |
| `brand` | logo text `{ "main": "Sidra", "sub": "International" }`, worked out from `name` if left out |
| `whatsapp` | `91` + 10-digit number. It powers every enquiry button and the form |
| `phones`, `contacts`, `saudiPhone`, `email`, `hours` | contact details; `contacts` lets you name each phone in the footer |
| `since`, `certification`, `rating`, `reviews` | trust signals in the hero stats, trust strip and reviews |
| `packages` | name, type, badge (`badgeTone: "accent"` for the red chip), date, description, days, nights, flight, hotelDistance, priceLabel, price |
| `services`, `highlights` | optional `{ icon, title, text }` lists; defaults are in `src/lib/client.ts` |
| `heroImage`, `hospitalityImages`, `gallery`, `logo` | put images in `public/clients/<slug>/`; `gallery` items can be `{ "src", "caption" }`. Without their own photos, shared stock photos from `public/images/` are used (see `src/lib/images.ts`) and the gallery is hidden. Packages can set `image` for their card |
| `demo` | `true` shows the demo banner and adds `noindex` |
| `sampleContent` | `true` adds "sample" notes under packages and reviews |

**When a client signs up:** replace the packages, reviews and photos with their real ones, then set
`"demo": false` and `"sampleContent": false`.

## Deploying (one hosting project per client)

On **Vercel** or **Netlify**, create a project from this repo for each client:

- Build command: `npm run build`
- Environment variable: `CLIENT=<slug>`
- Output directory: `dist/<slug>`

Then attach the subdomain (`<slug>.yourdomain.com`) or, once they're live, the client's own domain.

## Structure

```
clients/            one JSON config per agency
public/clients/     per-client images
scripts/
  import-leads.mjs  tracker → configs
  client.mjs        runs astro dev/build/preview with CLIENT=<slug>
src/
  lib/              types, config loader, helpers, your studio details (brand.ts)
  sections/         TopBar, Header, Hero, TrustStrip, Packages, Hospitality, Services,
                    Gallery, Testimonials, CtaBand, Contact, Footer
  components/       Logo, ArchArt, Pattern, Accent, Icon, SectionHeading, DemoBanner, WhatsAppButton
  styles/global.css colour themes, fonts, buttons
```

Set your studio's name and link for the footer credit in `src/lib/brand.ts`.
