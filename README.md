# Studio XO / Room XO — Website

Production website for the Studio XO live-entertainment/hospitality brand and its
Room XO (techno/electronic) sub-brand, covering 9 Studio XO outlets and Room XO
across India.

Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**.

## What's here

- Marketing site: home, events (list + detail), outlets (list + detail), Room XO,
  private parties, about, contact, table reservations, legal pages, 404/error states.
- A JSON-file data layer (`/data`) behind a single repository module (`lib/db.ts`)
  so outlets/events/artists can be swapped for a real database later without
  touching page code.
- A password-gated `/admin` CMS: create/edit/delete/publish events, toggle
  featured/sold-out/cancelled, edit outlet status & contact info, and view
  reservation/private-party/contact enquiries.
- Local SEO: per-outlet metadata, `LocalBusiness`/`MusicEvent`/`BreadcrumbList`/
  `FAQPage` JSON-LD, dynamic `sitemap.xml` and `robots.txt`, generated OG images.
- WhatsApp-first conversion: every table/private-party/event enquiry can route to
  WhatsApp with a pre-filled, contextual message, using the outlet's own number.
- Analytics scaffolding for GA4 / GTM / Meta Pixel, gated entirely behind env vars
  (nothing loads, and no ID is hardcoded, until you set one).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional except for admin access
npm run dev
```

Visit `http://localhost:3000`. The homepage, events and outlets are live from the
JSON data in `/data`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | For `/admin` access | Single shared password for the admin CMS. Unset = admin is fully locked. |
| `NEXT_PUBLIC_SITE_URL` | For correct canonical/OG URLs | Defaults to `https://www.studioxo.in`. |
| `NEXT_PUBLIC_GA4_ID` | No | Enables Google Analytics 4 if set. |
| `NEXT_PUBLIC_GTM_ID` | No | Enables Google Tag Manager if set (takes priority over GA4 direct). |
| `NEXT_PUBLIC_META_PIXEL_ID` | No | Enables the Meta Pixel if set. |

None of these ship with real values — see `.env.example`.

## Content model & where content lives

Everything content-editorial lives in `/data` as JSON, typed in `lib/types.ts`:

- `data/outlets.json` — the 9 Studio XO outlets + Room XO. Each outlet carries its
  own status (`operational` / `renovation` / `reopening-soon`), contact info,
  WhatsApp number, Google Maps link, and SEO fields. **Outlet status drives which
  CTAs render** (booking vs. "follow for updates") — this logic lives in
  `OutletHero.tsx` and is never duplicated by hand across pages.
- `data/events.json` — starts empty on purpose. No event names, dates, artists,
  prices or ticket links were supplied by the client and none have been invented;
  the events system is fully built (filtering, detail pages, schema, ticket CTAs
  for BookMyShow/District/Skillboxes/custom links, sold-out/cancelled states) and
  ready for real events to be added via `/admin/events/new` or by editing the JSON
  directly.
- `data/artists.json` — same story, empty by default, typed and ready.

### Why some outlet fields are marked "unverified"

Per the brief, addresses were only supplied as Google Maps share links
(`share.google/...`), which this environment's network policy blocks from
resolving directly. Where a consistent address could be cross-referenced from
public business listings (Zomato/District), it's included with an
`addressNote` flagging the source and `addressVerified: false`. Where sources
conflicted (e.g. Gurgaon has two different listed addresses; Mohali and Panipat
similarly), no address was invented — the page falls back to the supplied Google
Maps link for directions. Update `data/outlets.json` (or use `/admin/outlets`)
once addresses are confirmed with the outlets directly.

No opening hours, dress codes, age restrictions, ticket prices or table prices
are shown anywhere, because none were supplied or could be verified against an
official source — per the brief, these are omitted rather than guessed.

## Admin CMS

Visit `/admin`, sign in with `ADMIN_PASSWORD`. From there:

- **Events** — create, edit, delete; one-click toggle for published / featured /
  sold out / cancelled.
- **Outlets** — edit status, status message, description, contact details,
  Google Maps link, SEO title/description.
- **Enquiries** — read-only feed of every table reservation, private-party and
  contact-form submission.

The CMS writes directly to the JSON files in `/data` via Server Actions, and to
`/data/enquiries/*.json` for submissions (gitignored). This requires a
persistent Node process — see **Deployment** below for what that means for your
hosting choice.

### Swapping in a real database

Everything reads and writes through `lib/db.ts`. To move to Postgres/Supabase/
Sanity/etc., reimplement the functions in that one file with the same
signatures — no page or component needs to change.

## SEO & structured data

- `lib/seo.ts` builds consistent `Metadata` (title, description, canonical,
  Open Graph, Twitter card) for every page.
- `lib/schema.ts` builds `Organization`, `LocalBusiness`/`NightClub`,
  `MusicEvent`, `BreadcrumbList` and `FAQPage` JSON-LD — only ever from real,
  supplied data (no fabricated hours, ratings, or reviews).
- `app/sitemap.ts` and `app/robots.ts` are generated from live data (outlets +
  published events), not hand-maintained.
- `app/icon.tsx` and `app/opengraph-image.tsx` generate the favicon and default
  share image at build/request time — no binary assets to manage.

## Analytics

`lib/analytics.ts` exposes typed helpers (`analytics.ticketClick(...)`,
`analytics.whatsappClick(...)`, etc.) that push to `dataLayer` (GTM/GA4) and
`fbq` (Meta Pixel) when those are configured. Every primary CTA in the codebase
(ticket links, table booking, WhatsApp, phone, directions, Instagram, event
filters, location picker, reservation/private-party submits) already calls the
relevant helper — wiring up your GA4/GTM/Pixel IDs is enough to start seeing
these events; no code changes required.

## Tech stack

- Next.js 15 (App Router, Server Actions, Server Components)
- TypeScript (strict mode)
- Tailwind CSS
- Zod (form validation, client + server)
- No ORM/DB client — see "Content model" above

## Security notes

- Forms are validated server-side with Zod, include a honeypot field, and are
  rate-limited per IP (in-memory; move to a shared store like Redis if you scale
  to multiple server instances).
- `/admin` is cookie-session gated (`httpOnly`, `Secure` in production,
  `SameSite=Lax`) and the whole `/admin/*` tree is force-dynamic so it's never
  accidentally cached or served stale across a deploy.
- `npm audit` currently reports advisories in Next's own bundled `sharp`/`postcss`
  dependencies that are only fully resolved on Next 16 (a larger upgrade with
  breaking changes — async `params`/`cookies()`, React 19). Given this app never
  runs untrusted image uploads through `next/image` (only fixed Instagram/Unsplash
  remote patterns), the practical exposure is low; revisit on the next major
  upgrade window.

## Production build

```bash
npm run type-check   # tsc --noEmit
npm run lint
npm run build
npm run start         # persistent Node server — required for the admin CMS
```

## Deployment

The public marketing pages are statically/ISR-friendly and deploy anywhere Next.js
runs. **The admin CMS specifically needs a persistent filesystem and a long-running
Node process** (it reads/writes `/data/*.json` on disk), so:

- **Good fit:** a VM/container running `next start` (Docker, Railway, Render,
  Fly.io, a plain Linux box) with a persistent volume for `/data`.
- **Needs adaptation:** serverless/edge platforms (e.g. Vercel's default
  functions) — the filesystem there is ephemeral/read-only per invocation, so
  admin writes won't persist. Either deploy this app to a persistent-server
  target, or do the database swap described above (Supabase/Postgres) first,
  which works everywhere.

## Project structure

```
app/                       Routes (App Router)
  admin/                   Password-gated CMS (login + dashboard route group)
  api/                     Form submission endpoints (reservations, private
                            parties, contact)
  events/, outlets/, ...   Public pages
components/
  layout/                  Header, mobile nav, footer, sticky mobile CTA
  home/                    Homepage sections
  events/, outlets/        Cards, grids, filters, hero, related
  forms/                   Reservation / private party / contact forms
  shared/                  CTAs (WhatsApp/phone/directions/booking), Frame
                            (image or placeholder), FAQ, Gallery, Breadcrumbs,
                            JSON-LD, empty/loading states
  admin/                   Admin event form
lib/
  types.ts                 All content types
  db.ts                    Data repository (swap point for a real DB)
  schema.ts, seo.ts         Structured data + metadata builders
  whatsapp.ts, analytics.ts Conversion helpers
  validation.ts             Zod schemas shared by client forms and API routes
data/                      JSON content (outlets, events, artists) + enquiries
```
