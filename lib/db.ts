import "server-only";
import type {
  AdminUser,
  AnyEnquiry,
  Artist,
  Brand,
  Event,
  EventWithRelations,
  FAQItem,
  GalleryImage,
  LeadStatus,
  MediaItem,
  Outlet,
  PrivatePartyEnquiry,
  ReservationEnquiry,
  ReservationStatus,
  GeneralEnquiry,
  SiteSettings,
} from "./types";
import { GENERAL_WHATSAPP_NUMBER, GENERAL_EMAIL } from "./constants";
import { isPastDate } from "./utils";
import { getSupabase } from "./supabase";

/**
 * Data access layer.
 *
 * Everything reads from / writes to Supabase Postgres. All calls go
 * through this module only, so callers (Server Actions, pages, API
 * routes) never touch the database client directly — every exported
 * function here keeps the same name and shape it had when this file was
 * JSON-file-backed.
 */

function must<T>(result: { data: T | null; error: { message: string } | null }, context: string): T {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  if (result.data === null) throw new Error(`${context}: no data returned`);
  return result.data;
}

/**
 * JSONB columns (images, tickets, description, faqs) are trusted verbatim
 * by every public page — `image.src.startsWith(...)`, `description.map(...)`,
 * `ticket.platform`, etc., all assume a specific shape with no null checks.
 * That's fine for rows written through the CMS's own Server Actions (which
 * always build a well-formed object), but a row inserted or edited any other
 * way (direct SQL, a manual test insert, a partial JSONB patch) can leave a
 * column null, `{}`, or otherwise shaped differently — and an unguarded
 * `.src`/`.map()` on that turns into an uncaught exception, i.e. a 500 on an
 * otherwise perfectly valid, existing row. Normalizing at this one
 * boundary — the only place Supabase rows become app data — means every
 * page, card, and JSON-LD builder downstream can keep trusting the shape
 * without each of them re-implementing the same defensive checks.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeImage(value: unknown, fallbackAlt: string, fallbackSrc: string): GalleryImage {
  if (isPlainObject(value) && typeof value.src === "string" && value.src) {
    return {
      src: value.src,
      alt: typeof value.alt === "string" && value.alt ? value.alt : fallbackAlt,
      mobileSrc: typeof value.mobileSrc === "string" && value.mobileSrc ? value.mobileSrc : undefined,
      width: typeof value.width === "number" ? value.width : undefined,
      height: typeof value.height === "number" ? value.height : undefined,
      focalY: typeof value.focalY === "number" ? value.focalY : undefined,
    };
  }
  return { src: fallbackSrc, alt: fallbackAlt };
}

function normalizeImageArray(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => isPlainObject(item) && typeof item.src === "string" && !!item.src)
    .map((item) => normalizeImage(item, typeof item.alt === "string" ? item.alt : "", item.src as string));
}

function normalizeTicket(value: unknown): Event["ticket"] {
  if (isPlainObject(value)) {
    return {
      platform: (typeof value.platform === "string" ? value.platform : "none") as Event["ticket"]["platform"],
      url: typeof value.url === "string" && value.url ? value.url : undefined,
      ctaLabel: typeof value.ctaLabel === "string" && value.ctaLabel ? value.ctaLabel : "Get Tickets",
    };
  }
  return { platform: "none", ctaLabel: "Get Tickets" };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeFaqs(value: unknown): FAQItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter(
    (item): item is FAQItem => isPlainObject(item) && typeof item.question === "string" && typeof item.answer === "string"
  );
  return items.length ? items : undefined;
}

// ---------- Outlets ----------

interface OutletRow {
  slug: string;
  name: string;
  brand: Brand;
  city: string;
  state: string;
  status: Outlet["status"];
  status_message: string | null;
  tagline: string;
  description: string[];
  hero_image: Outlet["heroImage"];
  gallery: Outlet["gallery"];
  address: string | null;
  address_verified: boolean;
  address_note: string | null;
  google_maps_url: string;
  coordinates: Outlet["coordinates"] | null;
  phones: string[];
  emails: string[];
  instagram_url: string;
  instagram_handle: string;
  whatsapp_number: string;
  opening_hours: Outlet["openingHours"] | null;
  amenities: string[] | null;
  faqs: Outlet["faqs"] | null;
  seo_title: string;
  seo_description: string;
  local_seo_intro: string;
  featured: boolean;
}

function rowToOutlet(row: OutletRow): Outlet {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    city: row.city,
    state: row.state,
    status: row.status,
    statusMessage: row.status_message ?? undefined,
    tagline: row.tagline,
    description: normalizeStringArray(row.description),
    heroImage: normalizeImage(row.hero_image, row.name, "/placeholder/outlet-hero"),
    gallery: normalizeImageArray(row.gallery),
    address: row.address ?? undefined,
    addressVerified: row.address_verified,
    addressNote: row.address_note ?? undefined,
    googleMapsUrl: row.google_maps_url,
    coordinates: row.coordinates ?? undefined,
    phones: normalizeStringArray(row.phones),
    emails: normalizeStringArray(row.emails),
    instagramUrl: row.instagram_url,
    instagramHandle: row.instagram_handle,
    whatsappNumber: row.whatsapp_number,
    openingHours: row.opening_hours ?? undefined,
    amenities: row.amenities ?? undefined,
    faqs: normalizeFaqs(row.faqs),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    localSeoIntro: row.local_seo_intro,
    featured: row.featured,
  };
}

function outletToRow(outlet: Outlet): OutletRow {
  return {
    slug: outlet.slug,
    name: outlet.name,
    brand: outlet.brand,
    city: outlet.city,
    state: outlet.state,
    status: outlet.status,
    status_message: outlet.statusMessage ?? null,
    tagline: outlet.tagline,
    description: outlet.description,
    hero_image: outlet.heroImage,
    gallery: outlet.gallery,
    address: outlet.address ?? null,
    address_verified: outlet.addressVerified,
    address_note: outlet.addressNote ?? null,
    google_maps_url: outlet.googleMapsUrl,
    coordinates: outlet.coordinates ?? null,
    phones: outlet.phones,
    emails: outlet.emails,
    instagram_url: outlet.instagramUrl,
    instagram_handle: outlet.instagramHandle,
    whatsapp_number: outlet.whatsappNumber,
    opening_hours: outlet.openingHours ?? null,
    amenities: outlet.amenities ?? null,
    faqs: outlet.faqs ?? null,
    seo_title: outlet.seoTitle,
    seo_description: outlet.seoDescription,
    local_seo_intro: outlet.localSeoIntro,
    featured: outlet.featured,
  };
}

export async function getOutlets(): Promise<Outlet[]> {
  const result = await getSupabase().from("outlets").select("*").order("name");
  return must(result, "getOutlets").map(rowToOutlet);
}

export async function getOutletsByBrand(brand: Brand): Promise<Outlet[]> {
  const outlets = await getOutlets();
  return outlets.filter((o) => o.brand === brand);
}

export async function getOutletBySlug(slug: string): Promise<Outlet | null> {
  const result = await getSupabase().from("outlets").select("*").eq("slug", slug).maybeSingle();
  if (result.error) throw new Error(`getOutletBySlug: ${result.error.message}`);
  return result.data ? rowToOutlet(result.data) : null;
}

export async function saveOutlet(outlet: Outlet): Promise<void> {
  const row = { ...outletToRow(outlet), updated_at: new Date().toISOString() };
  const result = await getSupabase().from("outlets").upsert(row, { onConflict: "slug" });
  if (result.error) throw new Error(`saveOutlet: ${result.error.message}`);
}

export async function deleteOutlet(slug: string): Promise<void> {
  const result = await getSupabase().from("outlets").delete().eq("slug", slug);
  if (result.error) throw new Error(`deleteOutlet: ${result.error.message}`);
}

// ---------- Artists ----------

interface ArtistRow {
  id: string;
  slug: string;
  name: string;
  bio: string;
  image: Artist["image"] | null;
  instagram_url: string | null;
  genres: string[] | null;
}

function rowToArtist(row: ArtistRow): Artist {
  return {
    slug: row.slug,
    name: row.name,
    bio: row.bio,
    image: row.image ? normalizeImage(row.image, row.name, "/placeholder/artist") : undefined,
    instagramUrl: row.instagram_url ?? undefined,
    genres: row.genres ? normalizeStringArray(row.genres) : undefined,
  };
}

export async function getArtists(): Promise<Artist[]> {
  const result = await getSupabase().from("artists").select("*").order("name");
  return must(result, "getArtists").map(rowToArtist);
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const result = await getSupabase().from("artists").select("*").eq("slug", slug).maybeSingle();
  if (result.error) throw new Error(`getArtistBySlug: ${result.error.message}`);
  return result.data ? rowToArtist(result.data) : null;
}

export async function saveArtist(artist: Artist): Promise<void> {
  const row = {
    slug: artist.slug,
    name: artist.name,
    bio: artist.bio,
    image: artist.image ?? null,
    instagram_url: artist.instagramUrl ?? null,
    genres: artist.genres ?? null,
    updated_at: new Date().toISOString(),
  };
  const result = await getSupabase().from("artists").upsert(row, { onConflict: "slug" });
  if (result.error) throw new Error(`saveArtist: ${result.error.message}`);
}

export async function deleteArtist(slug: string): Promise<void> {
  const result = await getSupabase().from("artists").delete().eq("slug", slug);
  if (result.error) throw new Error(`deleteArtist: ${result.error.message}`);
}

async function resolveArtistIds(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  const result = await getSupabase().from("artists").select("id, slug").in("slug", slugs);
  if (result.error) throw new Error(`resolveArtistIds: ${result.error.message}`);
  return (result.data as Array<{ id: string; slug: string }>).map((r) => r.id);
}

// ---------- Events ----------

interface EventRow {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  outlet_slug: string;
  category: Event["category"];
  date: string;
  start_time: string;
  end_time: string | null;
  artwork: Event["artwork"];
  gallery: Event["gallery"] | null;
  description: string[];
  ticket: Event["ticket"];
  table_booking_enabled: boolean;
  whatsapp_override: string | null;
  featured: boolean;
  sold_out: boolean;
  cancelled: boolean;
  published: boolean;
  faqs: Event["faqs"] | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  source: Event["source"];
  source_url: string | null;
  event_artists?: Array<{ artists: { slug: string } | null }>;
}

const EVENT_SELECT = "*, event_artists(artists(slug))";

function rowToEvent(row: EventRow): Event {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    artistSlugs: (row.event_artists ?? []).map((ea) => ea.artists?.slug).filter((s): s is string => !!s),
    outletSlug: row.outlet_slug,
    category: row.category,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time ?? undefined,
    artwork: normalizeImage(row.artwork, row.name, "/placeholder/event-artwork"),
    gallery: row.gallery ? normalizeImageArray(row.gallery) : undefined,
    description: normalizeStringArray(row.description),
    ticket: normalizeTicket(row.ticket),
    tableBookingEnabled: row.table_booking_enabled,
    whatsappOverride: row.whatsapp_override ?? undefined,
    featured: row.featured,
    soldOut: row.sold_out,
    cancelled: row.cancelled,
    published: row.published,
    faqs: normalizeFaqs(row.faqs),
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    ogImage: row.og_image ?? undefined,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
  };
}

export async function getAllEvents(): Promise<Event[]> {
  const result = await getSupabase().from("events").select(EVENT_SELECT).order("date");
  return must(result, "getAllEvents").map((row) => rowToEvent(row as EventRow));
}

export async function getPublishedEvents(): Promise<Event[]> {
  const events = await getAllEvents();
  return events.filter((e) => e.published);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const result = await getSupabase().from("events").select(EVENT_SELECT).eq("slug", slug).maybeSingle();
  if (result.error) throw new Error(`getEventBySlug: ${result.error.message}`);
  return result.data ? rowToEvent(result.data as EventRow) : null;
}

export async function saveEvent(event: Event): Promise<void> {
  const supabase = getSupabase();
  const row = {
    slug: event.slug,
    name: event.name,
    brand: event.brand,
    outlet_slug: event.outletSlug,
    category: event.category,
    date: event.date,
    start_time: event.startTime,
    end_time: event.endTime ?? null,
    artwork: event.artwork,
    gallery: event.gallery ?? null,
    description: event.description,
    ticket: event.ticket,
    table_booking_enabled: event.tableBookingEnabled,
    whatsapp_override: event.whatsappOverride ?? null,
    featured: event.featured,
    sold_out: event.soldOut,
    cancelled: event.cancelled,
    published: event.published,
    faqs: event.faqs ?? null,
    seo_title: event.seoTitle ?? null,
    seo_description: event.seoDescription ?? null,
    og_image: event.ogImage ?? null,
    source: event.source,
    source_url: event.sourceUrl ?? null,
    updated_at: new Date().toISOString(),
  };

  const upserted = must(
    await supabase.from("events").upsert(row, { onConflict: "slug" }).select("id").single(),
    "saveEvent"
  ) as { id: string };

  const artistIds = await resolveArtistIds(event.artistSlugs);
  const deleteResult = await supabase.from("event_artists").delete().eq("event_id", upserted.id);
  if (deleteResult.error) throw new Error(`saveEvent (clear artists): ${deleteResult.error.message}`);

  if (artistIds.length > 0) {
    const insertResult = await supabase
      .from("event_artists")
      .insert(artistIds.map((artistId) => ({ event_id: upserted.id, artist_id: artistId })));
    if (insertResult.error) throw new Error(`saveEvent (link artists): ${insertResult.error.message}`);
  }
}

export async function deleteEvent(slug: string): Promise<void> {
  const result = await getSupabase().from("events").delete().eq("slug", slug);
  if (result.error) throw new Error(`deleteEvent: ${result.error.message}`);
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

export async function saveEnquiry(enquiry: AnyEnquiry): Promise<void> {
  const supabase = getSupabase();

  if (enquiry.type === "reservation") {
    const result = await supabase.from("reservations").insert({
      id: enquiry.id,
      outlet_slug: enquiry.outletSlug,
      event_slug: enquiry.eventSlug ?? null,
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email ?? null,
      date: enquiry.date,
      time: enquiry.time,
      guests: enquiry.guests,
      occasion: enquiry.occasion ?? null,
      additional_request: enquiry.additionalRequest ?? null,
      source: enquiry.source,
      status: enquiry.status,
      created_at: enquiry.createdAt,
    });
    if (result.error) throw new Error(`saveEnquiry (reservation): ${result.error.message}`);
    return;
  }

  if (enquiry.type === "private-party") {
    const result = await supabase.from("private_party_leads").insert({
      id: enquiry.id,
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email,
      city: enquiry.city,
      outlet_slug: enquiry.outletSlug ?? null,
      event_date: enquiry.eventDate,
      guests: enquiry.guests,
      event_type: enquiry.eventType,
      budget: enquiry.budget ?? null,
      message: enquiry.message ?? null,
      source: enquiry.source,
      status: enquiry.status,
      created_at: enquiry.createdAt,
    });
    if (result.error) throw new Error(`saveEnquiry (private-party): ${result.error.message}`);
    return;
  }

  const result = await supabase.from("general_enquiries").insert({
    id: enquiry.id,
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email,
    outlet_slug: enquiry.outletSlug ?? null,
    message: enquiry.message,
    created_at: enquiry.createdAt,
  });
  if (result.error) throw new Error(`saveEnquiry (general): ${result.error.message}`);
}

interface ReservationRow {
  id: string;
  outlet_slug: string;
  event_slug: string | null;
  name: string;
  phone: string;
  email: string | null;
  date: string;
  time: string;
  guests: number;
  occasion: string | null;
  additional_request: string | null;
  source: "website";
  status: ReservationStatus;
  created_at: string;
}

function rowToReservation(row: ReservationRow): ReservationEnquiry {
  return {
    id: row.id,
    type: "reservation",
    createdAt: row.created_at,
    outletSlug: row.outlet_slug,
    eventSlug: row.event_slug ?? undefined,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    date: row.date,
    time: row.time,
    guests: row.guests,
    occasion: row.occasion ?? undefined,
    additionalRequest: row.additional_request ?? undefined,
    source: row.source,
    status: row.status,
  };
}

export async function getReservations(): Promise<ReservationEnquiry[]> {
  const result = await getSupabase().from("reservations").select("*").order("created_at", { ascending: false });
  return must(result, "getReservations").map(rowToReservation);
}

interface PrivatePartyLeadRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  outlet_slug: string | null;
  event_date: string;
  guests: number;
  event_type: string;
  budget: string | null;
  message: string | null;
  source: "website";
  status: LeadStatus;
  created_at: string;
}

function rowToLead(row: PrivatePartyLeadRow): PrivatePartyEnquiry {
  return {
    id: row.id,
    type: "private-party",
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    outletSlug: row.outlet_slug ?? undefined,
    eventDate: row.event_date,
    guests: row.guests,
    eventType: row.event_type,
    budget: row.budget ?? undefined,
    message: row.message ?? undefined,
    source: row.source,
    status: row.status,
  };
}

export async function getPrivatePartyLeads(): Promise<PrivatePartyEnquiry[]> {
  const result = await getSupabase().from("private_party_leads").select("*").order("created_at", { ascending: false });
  return must(result, "getPrivatePartyLeads").map(rowToLead);
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  const result = await getSupabase().from("reservations").update({ status }).eq("id", id);
  if (result.error) throw new Error(`updateReservationStatus: ${result.error.message}`);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const result = await getSupabase().from("private_party_leads").update({ status }).eq("id", id);
  if (result.error) throw new Error(`updateLeadStatus: ${result.error.message}`);
}

// ---------- Users ----------

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: AdminUser["role"];
  is_active: boolean;
  created_at: string;
}

function rowToUser(row: UserRow): AdminUser {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    active: row.is_active,
    createdAt: row.created_at,
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  const result = await getSupabase().from("users").select("*").order("created_at");
  return must(result, "getUsers").map(rowToUser);
}

export async function getUserByEmail(email: string): Promise<AdminUser | null> {
  const result = await getSupabase().from("users").select("*").ilike("email", email).maybeSingle();
  if (result.error) throw new Error(`getUserByEmail: ${result.error.message}`);
  return result.data ? rowToUser(result.data) : null;
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  const result = await getSupabase().from("users").select("*").eq("id", id).maybeSingle();
  if (result.error) throw new Error(`getUserById: ${result.error.message}`);
  return result.data ? rowToUser(result.data) : null;
}

export async function saveUser(user: AdminUser): Promise<void> {
  const row = {
    id: user.id,
    full_name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    role: user.role,
    is_active: user.active,
    created_at: user.createdAt,
    updated_at: new Date().toISOString(),
  };
  const result = await getSupabase().from("users").upsert(row, { onConflict: "id" });
  if (result.error) throw new Error(`saveUser: ${result.error.message}`);
}

export async function deleteUser(id: string): Promise<void> {
  const result = await getSupabase().from("users").delete().eq("id", id);
  if (result.error) throw new Error(`deleteUser: ${result.error.message}`);
}

export async function touchUserLastLogin(id: string): Promise<void> {
  const result = await getSupabase().from("users").update({ last_login_at: new Date().toISOString() }).eq("id", id);
  if (result.error) throw new Error(`touchUserLastLogin: ${result.error.message}`);
}

// ---------- Media ----------

interface MediaRow {
  id: string;
  url: string;
  filename: string;
  alt: string;
  category: MediaItem["category"];
  mime_type: string;
  size: number;
  uploaded_at: string;
  uploaded_by: string | null;
}

function rowToMedia(row: MediaRow): MediaItem {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    alt: row.alt,
    category: row.category,
    mimeType: row.mime_type,
    size: row.size,
    uploadedAt: row.uploaded_at,
    uploadedBy: row.uploaded_by ?? undefined,
  };
}

export async function getMedia(): Promise<MediaItem[]> {
  const result = await getSupabase().from("media").select("*").order("uploaded_at", { ascending: false });
  return must(result, "getMedia").map(rowToMedia);
}

export async function saveMediaItem(item: MediaItem): Promise<void> {
  const result = await getSupabase().from("media").insert({
    id: item.id,
    url: item.url,
    filename: item.filename,
    alt: item.alt,
    category: item.category,
    mime_type: item.mimeType,
    size: item.size,
    uploaded_at: item.uploadedAt,
    uploaded_by: item.uploadedBy ?? null,
  });
  if (result.error) throw new Error(`saveMediaItem: ${result.error.message}`);
}

export async function deleteMediaItem(id: string): Promise<MediaItem | null> {
  const supabase = getSupabase();
  const existing = await supabase.from("media").select("*").eq("id", id).maybeSingle();
  if (existing.error) throw new Error(`deleteMediaItem: ${existing.error.message}`);
  if (!existing.data) return null;

  const result = await supabase.from("media").delete().eq("id", id);
  if (result.error) throw new Error(`deleteMediaItem: ${result.error.message}`);
  return rowToMedia(existing.data);
}

// ---------- Settings ----------

const DEFAULT_SETTINGS: SiteSettings = {
  generalWhatsappNumber: GENERAL_WHATSAPP_NUMBER,
  generalEmail: GENERAL_EMAIL,
};

export async function getSettings(): Promise<SiteSettings> {
  const result = await getSupabase().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (result.error) throw new Error(`getSettings: ${result.error.message}`);
  if (!result.data) return DEFAULT_SETTINGS;
  return {
    generalWhatsappNumber: result.data.general_whatsapp_number,
    generalEmail: result.data.general_email,
  };
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const result = await getSupabase()
    .from("site_settings")
    .upsert(
      { id: 1, general_whatsapp_number: settings.generalWhatsappNumber, general_email: settings.generalEmail },
      { onConflict: "id" }
    );
  if (result.error) throw new Error(`saveSettings: ${result.error.message}`);
}

export type { ReservationEnquiry, PrivatePartyEnquiry, GeneralEnquiry };
