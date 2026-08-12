import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  AnyEnquiry,
  Artist,
  Brand,
  Event,
  EventWithRelations,
  Outlet,
  PrivatePartyEnquiry,
  ReservationEnquiry,
  GeneralEnquiry,
} from "./types";
import { isPastDate } from "./utils";

/**
 * Data access layer.
 *
 * Everything reads from / writes to JSON files under /data today. All calls
 * are async and go through this module only, so the storage engine can be
 * swapped for Postgres/Supabase/Sanity later without touching page code —
 * replace the bodies of these functions, keep the signatures.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const ENQUIRIES_DIR = path.join(DATA_DIR, "enquiries");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

// ---------- Outlets ----------

export async function getOutlets(): Promise<Outlet[]> {
  return readJson<Outlet[]>("outlets.json");
}

export async function getOutletsByBrand(brand: Brand): Promise<Outlet[]> {
  const outlets = await getOutlets();
  return outlets.filter((o) => o.brand === brand);
}

export async function getOutletBySlug(slug: string): Promise<Outlet | null> {
  const outlets = await getOutlets();
  return outlets.find((o) => o.slug === slug) ?? null;
}

export async function saveOutlet(outlet: Outlet): Promise<void> {
  const outlets = await getOutlets();
  const index = outlets.findIndex((o) => o.slug === outlet.slug);
  if (index === -1) outlets.push(outlet);
  else outlets[index] = outlet;
  await writeJson("outlets.json", outlets);
}

export async function deleteOutlet(slug: string): Promise<void> {
  const outlets = await getOutlets();
  await writeJson(
    "outlets.json",
    outlets.filter((o) => o.slug !== slug)
  );
}

// ---------- Artists ----------

export async function getArtists(): Promise<Artist[]> {
  return readJson<Artist[]>("artists.json");
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const artists = await getArtists();
  return artists.find((a) => a.slug === slug) ?? null;
}

export async function saveArtist(artist: Artist): Promise<void> {
  const artists = await getArtists();
  const index = artists.findIndex((a) => a.slug === artist.slug);
  if (index === -1) artists.push(artist);
  else artists[index] = artist;
  await writeJson("artists.json", artists);
}

// ---------- Events ----------

export async function getAllEvents(): Promise<Event[]> {
  return readJson<Event[]>("events.json");
}

export async function getPublishedEvents(): Promise<Event[]> {
  const events = await getAllEvents();
  return events.filter((e) => e.published);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const events = await getAllEvents();
  return events.find((e) => e.slug === slug) ?? null;
}

export async function saveEvent(event: Event): Promise<void> {
  const events = await getAllEvents();
  const index = events.findIndex((e) => e.slug === event.slug);
  if (index === -1) events.push(event);
  else events[index] = event;
  await writeJson("events.json", events);
}

export async function deleteEvent(slug: string): Promise<void> {
  const events = await getAllEvents();
  await writeJson(
    "events.json",
    events.filter((e) => e.slug !== slug)
  );
}

export async function hydrateEvent(event: Event): Promise<EventWithRelations | null> {
  const outlet = await getOutletBySlug(event.outletSlug);
  if (!outlet) return null;
  const artists = await getArtists();
  return {
    ...event,
    outlet,
    artists: artists.filter((a) => event.artistSlugs.includes(a.slug)),
  };
}

export interface EventFilters {
  city?: string;
  outletSlug?: string;
  category?: string;
  artistSlug?: string;
  month?: string; // YYYY-MM
  brand?: Brand;
}

async function filterEvents(events: Event[], filters: EventFilters): Promise<Event[]> {
  let result = events;
  if (filters.brand) result = result.filter((e) => e.brand === filters.brand);
  if (filters.outletSlug) result = result.filter((e) => e.outletSlug === filters.outletSlug);
  if (filters.category) result = result.filter((e) => e.category === filters.category);
  if (filters.artistSlug) result = result.filter((e) => e.artistSlugs.includes(filters.artistSlug!));
  if (filters.month) result = result.filter((e) => e.date.startsWith(filters.month!));
  if (filters.city) {
    const outlets = await getOutlets();
    const citySlugs = new Set(
      outlets.filter((o) => o.city.toLowerCase() === filters.city!.toLowerCase()).map((o) => o.slug)
    );
    result = result.filter((e) => citySlugs.has(e.outletSlug));
  }
  return result;
}

export async function getUpcomingEvents(filters: EventFilters = {}): Promise<Event[]> {
  const events = await getPublishedEvents();
  const filtered = await filterEvents(events, filters);
  return filtered
    .filter((e) => !e.cancelled && !isPastDate(e.date))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getPastEvents(filters: EventFilters = {}): Promise<Event[]> {
  const events = await getPublishedEvents();
  const filtered = await filterEvents(events, filters);
  return filtered.filter((e) => isPastDate(e.date)).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getFeaturedEvents(filters: EventFilters = {}): Promise<Event[]> {
  const upcoming = await getUpcomingEvents(filters);
  return upcoming.filter((e) => e.featured);
}

export async function getSoldOutEvents(filters: EventFilters = {}): Promise<Event[]> {
  const upcoming = await getUpcomingEvents(filters);
  return upcoming.filter((e) => e.soldOut);
}

export async function getCancelledEvents(filters: EventFilters = {}): Promise<Event[]> {
  const events = await getPublishedEvents();
  const filtered = await filterEvents(events, filters);
  return filtered.filter((e) => e.cancelled).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getEventsForOutlet(outletSlug: string): Promise<Event[]> {
  return getUpcomingEvents({ outletSlug });
}

export async function getRelatedEvents(event: Event, limit = 3): Promise<Event[]> {
  const upcoming = await getUpcomingEvents();
  return upcoming
    .filter((e) => e.slug !== event.slug)
    .filter((e) => e.outletSlug === event.outletSlug || e.category === event.category)
    .slice(0, limit);
}

// ---------- Enquiries ----------

async function ensureEnquiriesDir(): Promise<void> {
  await fs.mkdir(ENQUIRIES_DIR, { recursive: true });
}

export async function saveEnquiry(enquiry: AnyEnquiry): Promise<void> {
  await ensureEnquiriesDir();
  const file = path.join(ENQUIRIES_DIR, `${enquiry.type}-${enquiry.id}.json`);
  await fs.writeFile(file, JSON.stringify(enquiry, null, 2), "utf-8");
}

export async function listEnquiries(): Promise<AnyEnquiry[]> {
  await ensureEnquiriesDir();
  const files = await fs.readdir(ENQUIRIES_DIR);
  const enquiries = await Promise.all(
    files
      .filter((f) => f.endsWith(".json") && f !== ".gitkeep")
      .map(async (f) => {
        const raw = await fs.readFile(path.join(ENQUIRIES_DIR, f), "utf-8");
        return JSON.parse(raw) as AnyEnquiry;
      })
  );
  return enquiries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type { ReservationEnquiry, PrivatePartyEnquiry, GeneralEnquiry };
