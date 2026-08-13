import { getOutlets, getArtists, getMedia } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { EventForm } from "@/components/admin/EventForm";
import type { Event } from "@/lib/types";

interface NewEventPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  await requireSection("events");
  const [outlets, artists, media, params] = await Promise.all([getOutlets(), getArtists(), getMedia(), searchParams]);

  const draft: Partial<Event> | undefined = params.draft
    ? {
        name: params.name,
        outletSlug: params.outletSlug,
        date: params.date,
        startTime: params.startTime,
        endTime: params.endTime,
        artwork: params.artworkSrc ? { src: params.artworkSrc, alt: params.name || "" } : undefined,
        description: params.description ? [params.description] : undefined,
        ticket: { platform: (params.ticketPlatform as Event["ticket"]["platform"]) || "custom", url: params.ticketUrl, ctaLabel: "Get Tickets" },
        source: "bookmyshow-import",
        sourceUrl: params.sourceUrl,
      }
    : undefined;

  return (
    <div>
      <h1 className="text-display-3 mb-8">{draft ? "Review Imported Event" : "New Event"}</h1>
      {draft && (
        <p className="mb-6 max-w-2xl border border-gold-bright/30 bg-gold/10 px-4 py-3 text-sm text-bone-200">
          Imported from BookMyShow. Review every field below — nothing is published automatically.
        </p>
      )}
      <EventForm outlets={outlets} artists={artists} media={media} draft={draft} />
    </div>
  );
}
