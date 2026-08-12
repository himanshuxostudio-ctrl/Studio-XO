"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAllEvents, saveEvent, deleteEvent as deleteEventFromDb } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { Event, EventCategory, TicketPlatform } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return (formData.get(key)?.toString() || "").trim();
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

export async function saveEventAction(formData: FormData) {
  const originalSlug = str(formData, "originalSlug");
  const name = str(formData, "name");
  const slug = str(formData, "slug") || slugify(name);

  const event: Event = {
    slug,
    name,
    brand: (str(formData, "brand") || "studio-xo") as Event["brand"],
    artistSlugs: str(formData, "artistSlugs")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    outletSlug: str(formData, "outletSlug"),
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
  };

  if (originalSlug && originalSlug !== slug) {
    await deleteEventFromDb(originalSlug);
  }

  await saveEvent(event);

  // Only revalidate public, cacheable routes here — /admin/* is force-dynamic
  // (never cached), and revalidating the very path we're about to redirect()
  // to inside the same action causes Next to render that redirect target in
  // a revalidation context that has no access to the request's cookies,
  // which breaks the auth check on the destination page.
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  redirect("/admin/events");
}

export async function deleteEventAction(formData: FormData) {
  const slug = str(formData, "slug");
  await deleteEventFromDb(slug);
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function toggleEventFlagAction(formData: FormData) {
  const slug = str(formData, "slug");
  const flag = str(formData, "flag") as keyof Pick<Event, "published" | "featured" | "soldOut" | "cancelled">;
  const events = await getAllEvents();
  const event = events.find((e) => e.slug === slug);
  if (!event) return;
  event[flag] = !event[flag];
  await saveEvent(event);
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
}
