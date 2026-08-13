# Studio XO / Room XO — Website

Production website for the Studio XO live-entertainment/hospitality brand and its
Room XO (techno/electronic) sub-brand, covering 9 Studio XO outlets and Room XO
across India, with a full role-based admin CMS.

Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**.

## What's here

- Marketing site: home, events (list + detail), outlets (list + detail), Room XO,
  private parties, about, contact, table reservations, legal pages, 404/error states.
- A JSON-file data layer (`/data`) behind a single repository module (`lib/db.ts`),
  organized as separate tables (outlets, events, artists, users, media, settings,
  enquiries) with ID/slug-based relationships rather than one blob — so it can be
  swapped for a real database later without touching page code. See
  **Data layer & the Supabase question** below for why it's built this way instead
  of on Supabase directly.
- A full **role-based admin CMS** at `/admin` — see below.
- Local SEO: per-outlet metadata, `LocalBusiness`/`MusicEvent`/`BreadcrumbList`/
  `FAQPage` JSON-LD, dynamic `sitemap.xml` and `robots.txt`, generated OG images.
- WhatsApp-first conversion: every table/private-party/event enquiry can route to
  WhatsApp with a pre-filled, contextual message, using the outlet's own number.
- Analytics scaffolding for GA4 / GTM / Meta Pixel, gated behind both env vars
  (nothing loads, and no ID is hardcoded, until you set one) **and** a cookie
  consent banner (nothing loads until a visitor accepts).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in SESSION_SECRET + ADMIN_SETUP_TOKEN at minimum
npm run dev
```

Visit `http://localhost:3000`. The homepage, events and outlets are live from the
JSON data in `/data`. Visit `/admin` to set up your first Super Admin account.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | For any `/admin` sign-in | Signs admin session cookies. Generate with `openssl rand -hex 32`. |
| `ADMIN_SETUP_TOKEN` | For first-time setup | One-time token required at `/admin/setup` to create the first Super Admin. Rotate/unset after setup if you like — setup disables itself once an account exists, independent of this var. |
| `NEXT_PUBLIC_SITE_URL` | For correct canonical/OG URLs | Defaults to `https://www.studioxo.in`. |
| `NEXT_PUBLIC_GA4_ID` | No | Enables Google Analytics 4 if set (and cookies accepted). |
| `NEXT_PUBLIC_GTM_ID` | No | Enables Google Tag Manager if set (takes priority over GA4 direct). |
| `NEXT_PUBLIC_META_PIXEL_ID` | No | Enables the Meta Pixel if set (and cookies accepted). |

None of these ship with real values — see `.env.example`. No password is ever
hardcoded anywhere in the codebase.

## Content model & where content lives

Everything content-editorial lives in `/data` as JSON, typed in `lib/types.ts`:

- `data/outlets.json` — the 9 Studio XO outlets + Room XO. Each outlet carries its
  own status (`operational` / `renovation` / `reopening-soon` / `temporarily-closed`),
  contact info, WhatsApp number, Google Maps link, and SEO fields. **Outlet status
  drives which CTAs render** (booking vs. "follow for updates") — this logic lives in
  `OutletHero.tsx` and is never duplicated by hand across pages.
- `data/events.json` — starts empty on purpose. No event names, dates, artists,
  prices or ticket links were supplied by the client and none have been invented;
  the events system is fully built (filtering, detail pages, schema, ticket CTAs
  for BookMyShow/District/Skillboxes/custom links, sold-out/cancelled states,
  artist references) and ready for real events via `/admin/events/new`, the
  BookMyShow importer, or by editing the JSON directly.
- `data/artists.json` — same story, empty by default. Events reference artists by
  slug rather than duplicating bios.
- `data/users.json`, `data/media.json`, `data/settings.json` — admin-only runtime
  state, created on first write, **gitignored** (`users.json` holds bcrypt hashes
  and must never be committed).

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

### First-time setup

1. Set `SESSION_SECRET` and `ADMIN_SETUP_TOKEN` in your environment.
2. Visit `/admin` — with no accounts yet, it redirects to `/admin/setup`.
3. Enter the setup token plus a name/email/password to create the first
   **Super Admin**. The setup page permanently disables itself the moment any
   account exists (checked server-side on every load, never cached).
4. From then on, sign in at `/admin/login` with email + password.

### Roles

| Role | Sections |
| --- | --- |
| Super Admin | Everything, including Settings and Users & Roles |
| Marketing Lead | Overview, Events, Outlets, Media, Reservations, Private Party Leads, Artists |
| Marketing | Overview, Events, Media, Private Party Leads, Artists |
| Social Media | Overview, Events, Media |
| Reservations / Sales | Overview, Reservations, Private Party Leads |

Permissions are enforced server-side (`lib/permissions.ts` + `requireSection()` in
`lib/auth.ts`) on every admin page **and** every Server Action that mutates data —
not just hidden in the nav. A logged-in Marketing user hitting `/admin/outlets`
directly is redirected, not just kept from seeing the link.

Super Admins manage accounts at `/admin/users`: create users (temporary password,
they should change it — there's no self-service password reset yet, a Super Admin
resets by deleting and recreating the account), change roles, deactivate, delete.
The system always keeps at least one active Super Admin.

### Sections

- **Overview** — upcoming events, events this week, operational/reopening outlet
  counts, new reservations/leads, quick actions — scoped to what the signed-in
  role can see.
- **Events** — full CRUD, one-click toggle for published / featured / sold out /
  cancelled, artist multi-select, ticket platform + URL, SEO overrides, and an
  **Import from BookMyShow** flow (see below).
- **Outlets** — status, status message, description, contact details, hero image,
  Google Maps link, SEO fields. Status changes take effect on the live site
  immediately (see revalidation note below).
- **Reservations** — every table request from `/reserve`, with a status workflow
  (New → Contacted → Confirmed / Cancelled / Completed) and one-tap Call/WhatsApp/
  Email to the guest.
- **Private Party Leads** — same idea for `/private-parties` submissions, with a
  sales-shaped workflow (New → Contacted → Qualified → Converted / Lost).
- **Artists** — name, bio, image, Instagram, genres. Events reference artists by
  slug; the artist edit page shows how many events currently reference it.
- **Media** — upload images/video (≤15 MB), organized by category (event artwork,
  artist, outlet, food, cocktails, crowd, interior, video). Event and outlet edit
  forms offer an autocomplete of uploaded media for their image fields.
- **Settings** (Super Admin only) — the general WhatsApp number and email used in
  the header, footer, sticky mobile CTA, contact page and legal pages.
- **Users & Roles** (Super Admin only) — described above.

### Importing an event from BookMyShow

`/admin/events/import` accepts a public BookMyShow event URL, fetches it
server-side with a normal HTTP request (no login, no CAPTCHA solving, no bypassing
any access control — if BookMyShow blocks the request, the importer says so and
offers manual entry instead), and reads the same public `schema.org/Event`
JSON-LD and Open Graph metadata the page already publishes for search engines and
social sharing. The result pre-fills the New Event form — **nothing is saved or
published until you review it and hit Create Event**. The parser
(`lib/bookmyshow.ts`) is a pure function exercised against fixture HTML, since
this environment's network policy doesn't allow live requests to arbitrary
third-party domains during development.

### How publishing reaches the live site

Server Actions (`saveEventAction`, `saveOutletAction`, etc.) call
`revalidatePath()` for every public route the change affects — the homepage, the
events list, the event's own detail page, and the relevant outlet page — so a
publish/edit/status change is live immediately, with no rebuild or redeploy. The
`/admin/*` tree itself is `force-dynamic` (see the note in `admin/(dashboard)/layout.tsx`)
so admin pages and the login/setup gate are never accidentally statically cached
across a deploy.

### Data layer & the Supabase question

The brief asked for Supabase/PostgreSQL "if available." This session has no
Supabase project or credentials and can't provision one, so per that same
instruction the CMS is built on the JSON-file data layer instead — structured as
separate tables with slug/ID relationships (events → outlets, events → artists),
not one giant object. Every read/write goes through `lib/db.ts`, and auth/session
logic is isolated in `lib/auth.ts` on top of it. To move to Supabase or another
Postgres instance: reimplement the functions in `lib/db.ts` with the same
signatures, swap `lib/auth.ts`'s session cookie for Supabase Auth (or keep the
current bcrypt + signed-cookie approach against a `users` table), and point
`lib/media.ts` at Supabase Storage/S3 instead of `/public/uploads`. No page or
component needs to change.

### Media storage

Uploads go to `/public/uploads/<category>/...` (gitignored) with metadata in
`data/media.json`, chosen specifically so images never bloat the git repo. This
needs a persistent filesystem (see **Deployment**). `lib/media.ts` is the one
module to change to move storage to S3/Supabase Storage/Cloudinary — the
`MediaItem` shape and every caller stay the same.

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

## Analytics & consent

`lib/analytics.ts` exposes typed helpers (`analytics.ticketClick(...)`,
`analytics.whatsappClick(...)`, etc.) that push to `dataLayer` (GTM/GA4) and
`fbq` (Meta Pixel). Every primary CTA in the codebase (ticket links, table
booking, WhatsApp, phone, directions, Instagram, event filters, location picker,
reservation/private-party submits) already calls the relevant helper. Scripts
only load once **both** the corresponding env var is set **and** the visitor has
accepted the cookie banner (`components/shared/CookieConsent.tsx`,
`lib/consent.ts`) — declining or ignoring the banner keeps them off entirely.

## Tech stack

- Next.js 15 (App Router, Server Actions, Server Components)
- TypeScript (strict mode)
- Tailwind CSS
- Zod (form validation, client + server)
- bcryptjs (password hashing) + a small HMAC-signed session cookie (no external
  auth service wired in — see the Supabase note above)
- No ORM/DB client — see "Content model" above

## Security notes

- Forms are validated server-side with Zod, include a honeypot field, and are
  rate-limited per IP (in-memory; move to a shared store like Redis if you scale
  to multiple server instances) — this covers the public reservation/private-party/
  contact forms **and** admin login attempts.
- Passwords are hashed with bcrypt (cost 12); sessions are HMAC-signed cookies
  (`httpOnly`, `Secure` in production, `SameSite=Lax`, 8-hour expiry) keyed off
  `SESSION_SECRET` — no session is valid without it configured.
- Every admin page and every data-mutating Server Action re-checks both
  authentication and role permission server-side (`requireAuth()` /
  `requireSection()`), not just the nav. The `/admin/*` tree, plus `/admin/login`
  and `/admin/setup` specifically, are `force-dynamic` so a build-time snapshot of
  "no users yet" can never get baked in and served after real accounts exist.
- `data/users.json`, `data/media.json`, `data/settings.json`, `data/enquiries/*`
  and `public/uploads/` are all gitignored — none of that runtime/user data ever
  reaches the repo.
- `npm audit` currently reports advisories in Next's own bundled `sharp`/`postcss`
  dependencies that are only fully resolved on Next 16 (a larger upgrade with
  breaking changes — React 19, further API churn). Given this app never runs
  untrusted image uploads through `next/image`'s remote optimizer (only fixed
  Instagram/Unsplash/BookMyShow-CDN remote patterns; user uploads are served as
  local files), the practical exposure is low; revisit on the next major upgrade
  window.

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
Node process** (it reads/writes `/data/*.json` and `/public/uploads` on disk), so:

- **Good fit:** a VM/container running `next start` (Docker, Railway, Render,
  Fly.io, a plain Linux box) with a persistent volume for `/data` and
  `/public/uploads`.
- **Needs adaptation:** serverless/edge platforms (e.g. Vercel's default
  functions) — the filesystem there is ephemeral/read-only per invocation, so
  admin writes won't persist. Either deploy this app to a persistent-server
  target, or do the database + storage swap described above first, which works
  everywhere.

## Project structure

```
app/                       Routes (App Router)
  admin/
    login/, setup/         Auth entry points (force-dynamic)
    (dashboard)/            Role-gated CMS: events, outlets, reservations,
                            private-parties, artists, media, settings, users
  api/                     Public form submission endpoints (reservations,
                            private parties, contact)
  events/, outlets/, ...   Public pages
components/
  layout/                  Header, mobile nav, footer, sticky mobile CTA
  home/                    Homepage sections
  events/, outlets/        Cards, grids, filters, hero, related
  forms/                   Reservation / private party / contact forms
  admin/                   Event & artist admin forms
  shared/                  CTAs (WhatsApp/phone/directions/booking), Frame
                            (image or placeholder), FAQ, Gallery, Breadcrumbs,
                            JSON-LD, empty/loading states, cookie consent
lib/
  types.ts                 All content + admin types
  db.ts                    Data repository (swap point for a real DB)
  auth.ts, permissions.ts  Sessions, password hashing, role permission matrix
  media.ts                 Upload storage (swap point for cloud storage)
  bookmyshow.ts             BookMyShow public-page parser (pure function)
  schema.ts, seo.ts         Structured data + metadata builders
  whatsapp.ts, analytics.ts Conversion helpers
  validation.ts             Zod schemas shared by client forms and API routes
data/                      JSON content (outlets, events, artists) + gitignored
                           runtime state (users, media, settings, enquiries)
```
