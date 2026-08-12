import type { Event, Outlet } from "@/lib/types";
import { EventCard } from "./EventCard";

export function RelatedEvents({ events, outlets }: { events: Event[]; outlets: Outlet[] }) {
  if (!events.length) return null;
  const outletMap = new Map(outlets.map((o) => [o.slug, o]));

  return (
    <section className="container-xo py-16 sm:py-20">
      <h2 className="text-display-3 mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const outlet = outletMap.get(event.outletSlug);
          if (!outlet) return null;
          return <EventCard key={event.slug} event={event} outlet={outlet} />;
        })}
      </div>
    </section>
  );
}
