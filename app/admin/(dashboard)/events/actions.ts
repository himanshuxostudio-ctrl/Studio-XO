"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAllEvents, saveEvent, deleteEvent as deleteEventFromDb } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { requireSection } from "@/lib/auth";
import type { Event, EventCategory, EventSource, TicketPlatform } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return (formData.get(key)?.toString() || "").trim();
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

// /admin/* is force-dynamic (never cached), so it never needs revalidation —
// and revalidating the exact admin path we redirect() to inside the same
// action would render that destination in a cookie-less revalidation
// context and break the auth check on the destination page. Only the
// public, cacheable routes below need revalidating.
function revalidatePublicEventRoutes(slug: string, outletSlug: string, previousOutletSlug?: string) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath(`/outlets/${outletSlug}`);
  if (previousOutletSlug && previousOutletSlug !== outletSlug) {
    revalidatePath(`/outlets/${previousOutletSlug}`);
  }
  revalidatePath("/room-xo");
}

export async function saveEventAction(formData: FormData) {
  await requireSection("events");

  const originalSlug = str(formData, "originalSlug");
  const name = str(formData, "name");
  const slug = str(formData, "slug") || slugify(name);
  const outletSlug = str(formData, "outletSlug");

  const events = await getAllEvents();
  const existing = originalSlug ? events.find((e) => e.slug === originalSlug) : undefined;

  const event: Event = {
    slug,
    name,
    brand: (str(formData, "brand") || "studio-xo") as Event["brand"],
    artistSlugs: formData
      .getAll("artistSlugs")
      .map((s) => s.toString().trim())
      .filter(Boolean),
    outletSlug,
    category: (str(formData, "category") || "live-music") as EventCategory,
    date: str(formData, "date"),
    startTime: str(formData, "startTime") || "20:00",
    endTime: str(formData, "endTime") || undefined,
    artwork: { src: str(formData, "artworkSrc") || "/placeholder/event-artwork", alt: str(formData, "artworkAlt") || name },
    gallery: [],
    description: str(formData, "description")
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean),
    ticket: {
      platform: (str(formData, "ticketPlatform") || "none") as TicketPlatform,
      url: str(formData, "ticketUrl") || undefined,
      ctaLabel: str(formData, "ticketCtaLabel") || "Get Tickets",
    },
    tableBookingEnabled: bool(formData, "tableBookingEnabled"),
    whatsappOverride: str(formData, "whatsappOverride") || undefined,
    featured: bool(formData, "featured"),
    soldOut: bool(formData, "soldOut"),
    cancelled: bool(formData, "cancelled"),
    published: bool(formData, "published"),
    seoTitle: str(formData, "seoTitle") || undefined,
    seoDescription: str(formData, "seoDescription") || undefined,
    ogImage: str(formData, "ogImage") || undefined,
    source: (str(formData, "source") || existing?.source || "manual") as EventSource,
    sourceUrl: str(formData, "sourceUrl") || existing?.sourceUrl || undefined,
  };

  if (originalSlug && originalSlug !== slug) {
    await deleteEventFromDb(originalSlug);
  }

  await saveEvent(event);
  revalidatePublicEventRoutes(slug, outletSlug, existing?.outletSlug);
  redirect("/admin/events");
}

export async function deleteEventAction(formData: FormData) {
  await requireSection("events");

  const slug = str(formData, "slug");
  const events = await getAllEvents();
  const event = events.find((e) => e.slug === slug);
  await deleteEventFromDb(slug);
  if (event) revalidatePublicEventRoutes(slug, event.outletSlug);
  redirect("/admin/events");
}

export async function toggleEventFlagAction(formData: FormData) {
  await requireSection("events");

  const slug = str(formData, "slug");
  const flag = str(formData, "flag") as keyof Pick<Event, "published" | "featured" | "soldOut" | "cancelled">;
  const events = await getAllEvents();
  const event = events.find((e) => e.slug === slug);
  if (!event) return;
  event[flag] = !event[flag];
  await saveEvent(event);
  revalidatePublicEventRoutes(slug, event.outletSlug);
}
