import type { Event, Outlet } from "@/lib/types";
import { EventCard } from "./EventCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface EventGridProps {
  events: Event[];
  outlets: Outlet[];
  emptyTitle: string;
  emptyDescription?: string;
}

export function EventGrid({ events, outlets, emptyTitle, emptyDescription }: EventGridProps) {
  const outletMap = new Map(outlets.map((o) => [o.slug, o]));

  if (!events.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} actionLabel="See all outlets" actionHref="/outlets" />;
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const outlet = outletMap.get(event.outletSlug);
        if (!outlet) return null;
        return <EventCard key={event.slug} event={event} outlet={outlet} />;
      })}
    </div>
  );
}
