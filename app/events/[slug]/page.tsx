import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllEvents, getEventBySlug, hydrateEvent, getRelatedEvents, getOutlets } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { eventSchema } from "@/lib/schema";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EventHero } from "@/components/events/EventHero";
import { RelatedEvents } from "@/components/events/RelatedEvents";
import { FAQ } from "@/components/shared/FAQ";
import { Gallery } from "@/components/shared/Gallery";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.filter((e) => e.published).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params: paramsPromise }: EventPageProps): Promise<Metadata> {
  const params = await paramsPromise;
  const event = await getEventBySlug(params.slug);
  if (!event || !event.published) return buildMetadata({ title: "Event Not Found", description: "This event could not be found.", path: `/events/${params.slug}`, noIndex: true });

  const hydrated = await hydrateEvent(event);
  const title = event.seoTitle || `${event.name} — ${hydrated?.outlet.name}`;
  const description = event.seoDescription || event.description.join(" ").slice(0, 155);

  return buildMetadata({
    title,
    description,
    path: `/events/${event.slug}`,
    image: event.ogImage || (event.artwork.src.startsWith("/placeholder") ? undefined : event.artwork.src),
  });
}

export default async function EventPage({ params: paramsPromise }: EventPageProps) {
  const params = await paramsPromise;
  const event = await getEventBySlug(params.slug);
  if (!event || !event.published) notFound();

  const hydrated = await hydrateEvent(event);
  if (!hydrated) notFound();

  const [related, outlets] = await Promise.all([getRelatedEvents(event), getOutlets()]);

  return (
    <div>
      <JsonLd data={eventSchema(event, hydrated.outlet)} />
      <Breadcrumbs items={[{ name: "Events", url: "/events" }, { name: event.name, url: `/events/${event.slug}` }]} />
      <EventHero event={hydrated} />

      <section className="container-xo py-16 sm:py-20">
        <div className="max-w-2xl space-y-4 text-bone-200/85">
          {event.description.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {hydrated.artists.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {hydrated.artists.map((artist) => (
              <div key={artist.slug} className="card-surface p-6">
                <p className="font-display text-lg text-bone-100">{artist.name}</p>
                <p className="mt-2 text-sm text-bone-300/70">{artist.bio}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {event.gallery && event.gallery.length > 0 && <Gallery images={event.gallery} title="From the Floor" />}

      {event.faqs && event.faqs.length > 0 && <FAQ items={event.faqs} />}

      <RelatedEvents events={related} outlets={outlets} />
    </div>
  );
}
