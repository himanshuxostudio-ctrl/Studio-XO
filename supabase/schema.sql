-- Studio XO / Room XO — Supabase Postgres schema
--
-- Run this once against a fresh Supabase project (SQL Editor → New query →
-- paste → Run). It creates every table the app needs and nothing else.
--
-- All access from the app goes through the service-role key on the server
-- (see lib/supabase.ts / lib/db.ts) — RLS is enabled with no permissive
-- policies so anon/public API keys cannot read or write these tables even
-- if one leaked. The service-role key bypasses RLS by design.

create extension if not exists "pgcrypto";

-- ---------- users ----------

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('super-admin', 'marketing-lead', 'marketing', 'social-media', 'reservations-sales')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ---------- outlets ----------

create table if not exists outlets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null check (brand in ('studio-xo', 'room-xo')),
  city text not null,
  state text not null,
  status text not null check (status in ('operational', 'renovation', 'reopening-soon', 'temporarily-closed')),
  status_message text,
  tagline text not null,
  description jsonb not null default '[]'::jsonb,
  hero_image jsonb not null,
  gallery jsonb not null default '[]'::jsonb,
  address text,
  address_verified boolean not null default false,
  address_note text,
  google_maps_url text not null,
  coordinates jsonb,
  phones jsonb not null default '[]'::jsonb,
  emails jsonb not null default '[]'::jsonb,
  instagram_url text not null,
  instagram_handle text not null,
  whatsapp_number text not null,
  opening_hours jsonb,
  amenities jsonb,
  faqs jsonb,
  seo_title text not null,
  seo_description text not null,
  local_seo_intro text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- artists ----------

create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  bio text not null,
  image jsonb,
  instagram_url text,
  genres jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- events ----------

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null check (brand in ('studio-xo', 'room-xo')),
  outlet_slug text not null references outlets(slug) on update cascade,
  category text not null,
  date date not null,
  start_time text not null,
  end_time text,
  artwork jsonb not null,
  gallery jsonb,
  description jsonb not null default '[]'::jsonb,
  ticket jsonb not null,
  table_booking_enabled boolean not null default true,
  whatsapp_override text,
  featured boolean not null default false,
  sold_out boolean not null default false,
  cancelled boolean not null default false,
  published boolean not null default false,
  faqs jsonb,
  seo_title text,
  seo_description text,
  og_image text,
  source text not null default 'manual' check (source in ('manual', 'bookmyshow-import')),
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_outlet_slug_idx on events(outlet_slug);
create index if not exists events_date_idx on events(date);

-- ---------- event_artists (join table) ----------

create table if not exists event_artists (
  event_id uuid not null references events(id) on delete cascade,
  artist_id uuid not null references artists(id) on delete cascade,
  primary key (event_id, artist_id)
);

-- ---------- reservations ----------

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  outlet_slug text not null,
  event_slug text,
  name text not null,
  phone text not null,
  email text,
  date date not null,
  time text not null,
  guests integer not null,
  occasion text,
  additional_request text,
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists reservations_status_idx on reservations(status);

-- ---------- private_party_leads ----------

create table if not exists private_party_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  city text not null,
  outlet_slug text,
  event_date date not null,
  guests integer not null,
  event_type text not null,
  budget text,
  message text,
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at timestamptz not null default now()
);

create index if not exists private_party_leads_status_idx on private_party_leads(status);

-- ---------- general_enquiries (contact form) ----------

create table if not exists general_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  outlet_slug text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------- media ----------

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  alt text not null,
  category text not null,
  mime_type text not null,
  size bigint not null,
  uploaded_at timestamptz not null default now(),
  uploaded_by text
);

-- ---------- site_settings (singleton row) ----------

create table if not exists site_settings (
  id smallint primary key default 1 check (id = 1),
  general_whatsapp_number text not null,
  general_email text not null
);

-- Row Level Security: enabled everywhere, no policies. Only the
-- service-role key (used server-side only, see lib/supabase.ts) bypasses
-- this — the anon/public key cannot read or write anything.
alter table users enable row level security;
alter table outlets enable row level security;
alter table artists enable row level security;
alter table events enable row level security;
alter table event_artists enable row level security;
alter table reservations enable row level security;
alter table private_party_leads enable row level security;
alter table general_enquiries enable row level security;
alter table media enable row level security;
alter table site_settings enable row level security;

-- ---------- Storage bucket for uploaded media ----------
-- Public bucket so uploaded images/videos load directly via the public
-- Supabase Storage URL (no signed URLs needed on public pages). Only the
-- service-role key (server-side) can write to it.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
