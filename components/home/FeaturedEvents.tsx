import Link from "next/link";
import { getFeaturedEvents, getUpcomingEvents, getOutlets } from "@/lib/db";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/shared/EmptyState";

export async function FeaturedEvents() {
  const [featured, upcoming, outlets] = await Promise.all([getFeaturedEvents(), getUpcomingEvents(), getOutlets()]);
  const events = (featured.length ? featured : upcoming).slice(0, 6);
  const outletMap = new Map(outlets.map((o) => [o.slug, o]));

  return (
    <section className="container-xo py-20 sm:py-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">What&rsquo;s On</p>
          <h2 className="text-display-3 mt-2">Upcoming at Studio XO</h2>
        </div>
        <Link href="/events" className="text-xs font-semibold uppercase tracking-widest2 text-gold-bright hover:underline">
          View all events →
        </Link>
      </div>

      {events.length ? (
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const outlet = outletMap.get(event.outletSlug);
            if (!outlet) return null;
            return <EventCard key={event.slug} event={event} outlet={outlet} />;
          })}
        </div>
      ) : (
        <EmptyState
          className="mt-10"
          title="Nothing on the calendar just yet"
          description="New events are added every week. Follow us on Instagram or check back soon."
          actionLabel="See all outlets"
          actionHref="/outlets"
        />
      )}
    </section>
  );
}
