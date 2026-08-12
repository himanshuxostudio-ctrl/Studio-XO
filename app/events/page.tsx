import { Suspense } from "react";
import { getUpcomingEvents, getFeaturedEvents, getSoldOutEvents, getCancelledEvents, getPastEvents, getOutlets } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EventFilters } from "@/components/events/EventFilters";
import { EventGrid } from "@/components/events/EventGrid";

export const metadata = buildMetadata({
  title: "Events — Live Music, Comedy & Nightlife",
  description: "Browse upcoming Studio XO and Room XO events across 9 cities — live music, comedy, Sufi nights, DJ sets and more. Filter by city, outlet, date or type.",
  path: "/events",
});

interface EventsPageProps {
  searchParams: Promise<{ city?: string; outlet?: string; category?: string; month?: string }>;
}

export default async function EventsPage({ searchParams: searchParamsPromise }: EventsPageProps) {
  const searchParams = await searchParamsPromise;
  const filters = {
    city: searchParams.city,
    outletSlug: searchParams.outlet,
    category: searchParams.category,
    month: searchParams.month,
  };

  const [upcoming, featured, soldOut, cancelled, past, outlets] = await Promise.all([
    getUpcomingEvents(filters),
    getFeaturedEvents(filters),
    getSoldOutEvents(filters),
    getCancelledEvents(filters),
    getPastEvents(filters),
    getOutlets(),
  ]);

  const hasFilters = Boolean(searchParams.city || searchParams.outlet || searchParams.category || searchParams.month);

  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "Events", url: "/events" }]} />

      <div className="container-xo pb-8">
        <p className="eyebrow">What&rsquo;s On</p>
        <h1 className="text-display-2 mt-2">Events</h1>
        <p className="mt-4 max-w-xl text-bone-300/70">
          Every live show, DJ night and special event across Studio XO and Room XO — filter by city, outlet, type or
          month.
        </p>
      </div>

      <div className="container-xo pb-10">
        <Suspense fallback={null}>
          <EventFilters outlets={outlets} />
        </Suspense>
      </div>

      {featured.length > 0 && !hasFilters && (
        <section className="container-xo pb-16">
          <h2 className="text-display-3 mb-8">Featured</h2>
          <EventGrid events={featured} outlets={outlets} emptyTitle="No featured events right now" />
        </section>
      )}

      <section className="container-xo pb-16">
        <h2 className="text-display-3 mb-8">Upcoming</h2>
        <EventGrid
          events={upcoming}
          outlets={outlets}
          emptyTitle={hasFilters ? "No events match these filters" : "No upcoming events right now"}
          emptyDescription={
            hasFilters
              ? "Try a different city, outlet or month — or clear your filters to see everything on."
              : "New events are added every week. Follow us on Instagram to be first to know, or check a specific outlet's page."
          }
        />
      </section>

      {soldOut.length > 0 && (
        <section className="container-xo pb-16">
          <h2 className="text-display-3 mb-8">Sold Out</h2>
          <EventGrid events={soldOut} outlets={outlets} emptyTitle="" />
        </section>
      )}

      {cancelled.length > 0 && (
        <section className="container-xo pb-16">
          <h2 className="text-display-3 mb-8">Cancelled</h2>
          <EventGrid events={cancelled} outlets={outlets} emptyTitle="" />
        </section>
      )}

      {past.length > 0 && (
        <section className="container-xo pb-24">
          <h2 className="text-display-3 mb-8">Past Events</h2>
          <EventGrid events={past.slice(0, 6)} outlets={outlets} emptyTitle="" />
        </section>
      )}
    </div>
  );
}
