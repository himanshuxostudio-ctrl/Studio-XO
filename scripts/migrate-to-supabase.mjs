// One-time data migration: imports the local JSON fixtures in /data into
// Supabase. Safe to re-run — every table is upserted on its natural key
// (slug for outlets/artists/events), so running this twice never creates
// duplicates.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-supabase.mjs
// or, with Node 20.6+:
//   node --env-file=.env.local scripts/migrate-to-supabase.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running this script.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
const DATA_DIR = path.join(process.cwd(), "data");

async function readJsonSafe(file) {
  try {
    const raw = await readFile(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

function outletToRow(o) {
  return {
    slug: o.slug,
    name: o.name,
    brand: o.brand,
    city: o.city,
    state: o.state,
    status: o.status,
    status_message: o.statusMessage ?? null,
    tagline: o.tagline,
    description: o.description,
    hero_image: o.heroImage,
    gallery: o.gallery,
    address: o.address ?? null,
    address_verified: o.addressVerified,
    address_note: o.addressNote ?? null,
    google_maps_url: o.googleMapsUrl,
    coordinates: o.coordinates ?? null,
    phones: o.phones,
    emails: o.emails,
    instagram_url: o.instagramUrl,
    instagram_handle: o.instagramHandle,
    whatsapp_number: o.whatsappNumber,
    opening_hours: o.openingHours ?? null,
    amenities: o.amenities ?? null,
    faqs: o.faqs ?? null,
    seo_title: o.seoTitle,
    seo_description: o.seoDescription,
    local_seo_intro: o.localSeoIntro,
    featured: o.featured,
  };
}

function artistToRow(a) {
  return {
    slug: a.slug,
    name: a.name,
    bio: a.bio,
    image: a.image ?? null,
    instagram_url: a.instagramUrl ?? null,
    genres: a.genres ?? null,
  };
}

function eventToRow(e) {
  return {
    slug: e.slug,
    name: e.name,
    brand: e.brand,
    outlet_slug: e.outletSlug,
    category: e.category,
    date: e.date,
    start_time: e.startTime,
    end_time: e.endTime ?? null,
    artwork: e.artwork,
    gallery: e.gallery ?? null,
    description: e.description,
    ticket: e.ticket,
    table_booking_enabled: e.tableBookingEnabled,
    whatsapp_override: e.whatsappOverride ?? null,
    featured: e.featured,
    sold_out: e.soldOut,
    cancelled: e.cancelled,
    published: e.published,
    faqs: e.faqs ?? null,
    seo_title: e.seoTitle ?? null,
    seo_description: e.seoDescription ?? null,
    og_image: e.ogImage ?? null,
    source: e.source ?? "manual",
    source_url: e.sourceUrl ?? null,
  };
}

async function migrateOutlets() {
  const outlets = await readJsonSafe("outlets.json");
  if (outlets.length === 0) return console.log("outlets.json: nothing to migrate");
  const { error } = await supabase.from("outlets").upsert(outlets.map(outletToRow), { onConflict: "slug" });
  if (error) throw new Error(`outlets: ${error.message}`);
  console.log(`outlets: upserted ${outlets.length}`);
}

async function migrateArtists() {
  const artists = await readJsonSafe("artists.json");
  if (artists.length === 0) return console.log("artists.json: nothing to migrate");
  const { error } = await supabase.from("artists").upsert(artists.map(artistToRow), { onConflict: "slug" });
  if (error) throw new Error(`artists: ${error.message}`);
  console.log(`artists: upserted ${artists.length}`);
}

async function migrateEvents() {
  const events = await readJsonSafe("events.json");
  if (events.length === 0) return console.log("events.json: nothing to migrate");

  const { data: eventRows, error: eventsError } = await supabase
    .from("events")
    .upsert(events.map(eventToRow), { onConflict: "slug" })
    .select("id, slug");
  if (eventsError) throw new Error(`events: ${eventsError.message}`);

  const slugToId = new Map(eventRows.map((r) => [r.slug, r.id]));
  const allArtistSlugs = [...new Set(events.flatMap((e) => e.artistSlugs ?? []))];
  let slugToArtistId = new Map();
  if (allArtistSlugs.length > 0) {
    const { data: artistRows, error: artistsError } = await supabase
      .from("artists")
      .select("id, slug")
      .in("slug", allArtistSlugs);
    if (artistsError) throw new Error(`events (artist lookup): ${artistsError.message}`);
    slugToArtistId = new Map(artistRows.map((r) => [r.slug, r.id]));
  }

  for (const event of events) {
    const eventId = slugToId.get(event.slug);
    const artistIds = (event.artistSlugs ?? []).map((s) => slugToArtistId.get(s)).filter(Boolean);
    await supabase.from("event_artists").delete().eq("event_id", eventId);
    if (artistIds.length > 0) {
      const { error } = await supabase
        .from("event_artists")
        .insert(artistIds.map((artistId) => ({ event_id: eventId, artist_id: artistId })));
      if (error) throw new Error(`event_artists (${event.slug}): ${error.message}`);
    }
  }
  console.log(`events: upserted ${events.length}`);
}

async function main() {
  await migrateOutlets();
  await migrateArtists();
  await migrateEvents();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
