import Image from "next/image";
import { getOutletBySlug, getUpcomingEvents } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { localBusinessSchema } from "@/lib/schema";
import { JsonLd } from "@/components/shared/JsonLd";
import { Frame } from "@/components/shared/Frame";
import { Gallery } from "@/components/shared/Gallery";
import { EventGrid } from "@/components/events/EventGrid";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { PhoneCTA } from "@/components/shared/PhoneCTA";
import { DirectionsCTA } from "@/components/shared/DirectionsCTA";
import { InstagramCTA } from "@/components/shared/InstagramCTA";
import { BookingCTA } from "@/components/shared/BookingCTA";
import { privatePartyMessage } from "@/lib/whatsapp";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = buildMetadata({
  title: "Room XO — Techno & Electronic Nightlife",
  description: "Room XO is the techno and electronic-music floor of the XO ecosystem — DJs, underground sound and late nights.",
  path: "/room-xo",
});

export default async function RoomXoPage() {
  const outlet = await getOutletBySlug("room-xo");
  const events = outlet ? await getUpcomingEvents({ outletSlug: outlet.slug }) : [];

  // Use the CMS-controlled outlet hero image whenever an admin has set a
  // real one; otherwise keep the editorial placeholder Frame renders for
  // any /placeholder/* src.
  const heroImage =
    outlet && outlet.heroImage.src && !outlet.heroImage.src.startsWith("/placeholder")
      ? outlet.heroImage
      : {
          src: "/images/room-xo/hero-wide.jpg",
          mobileSrc: "/images/room-xo/hero-mobile.jpg",
          alt: outlet?.heroImage.alt || "Room XO's dramatic red runway dance floor",
        };

  return (
    <div className="bg-[#050507]">
      {outlet && <JsonLd data={localBusinessSchema(outlet)} />}

      <section className="relative flex min-h-[85vh] items-end overflow-hidden pt-16 sm:pt-20">
        <Frame image={heroImage} className="absolute inset-0 h-full w-full" priority sizes="100vw" />
        <div className="absolute inset-0 bg-grain-fade" />
        <div className="container-xo relative z-10 pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-bone-400">Part of the XO Ecosystem</p>
          <h1 className="relative mt-6 h-16 w-[280px] sm:h-20 sm:w-[360px]">
            <Image src="/images/brand/room-xo-logo.png" alt="Room XO" fill sizes="(min-width: 640px) 360px, 280px" priority className="object-contain object-left" />
          </h1>
          <p className="mt-6 max-w-xl text-balance text-bone-300/80">
            Techno after dark. Room XO runs on a different clock — underground-leaning sets, a serious rig, and a
            floor built for people who came for the music.
          </p>
        </div>
      </section>

      <section className="container-xo grid grid-cols-1 gap-12 py-20 sm:py-28 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5 text-bone-200/85">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-crimson-bright">The Room</p>
          <h2 className="font-display text-display-3 text-bone-100">Not Studio XO. A room of its own.</h2>
          <p>
            Room XO is deliberately separate from Studio XO&rsquo;s live-music format — no live band, no dinner
            service. Just DJs, a proper sound system, and a crowd that shows up late and stays later.
          </p>
          <p>Expect techno and electronic sets, minimal production, and a sound policy that doesn&rsquo;t chase the mainstream.</p>
        </div>

        {outlet && (
          <aside className="card-surface space-y-4 p-6">
            <p className="eyebrow">Visit Room XO</p>
            <p className="text-sm text-bone-200">{outlet.city}, {outlet.state}</p>
            {outlet.address && <p className="text-xs text-bone-400">{outlet.address}</p>}
            <div className="flex flex-col gap-2 pt-2">
              <BookingCTA outletSlug={outlet.slug} outletName={outlet.name} city={outlet.city} className="w-full" />
              <DirectionsCTA mapsUrl={outlet.googleMapsUrl} outlet={outlet.name} city={outlet.city} className="w-full" />
              {outlet.phones[0] && <PhoneCTA number={`91${outlet.phones[0]}`} outlet={outlet.name} city={outlet.city} className="w-full" />}
              <InstagramCTA url={outlet.instagramUrl} handle={outlet.instagramHandle} outlet={outlet.name} brand="room-xo" className="w-full" />
              <WhatsAppCTA
                number={outlet.whatsappNumber}
                message={privatePartyMessage(outlet.name)}
                context="room-xo-page"
                outlet={outlet.name}
                city={outlet.city}
                className="w-full"
              />
            </div>
          </aside>
        )}
      </section>

      <section className="container-xo pb-20 sm:pb-28">
        <h2 className="font-display text-display-3 text-bone-100 mb-8">On the Floor</h2>
        {events.length ? (
          <EventGrid events={events} outlets={outlet ? [outlet] : []} emptyTitle="" />
        ) : (
          <EmptyState title="Nothing announced yet" description="Follow Room XO on Instagram — lineups drop there first." actionLabel="Follow on Instagram" actionHref={outlet?.instagramUrl || "https://www.instagram.com/roomxoofficial/"} />
        )}
      </section>

      {outlet && outlet.gallery.length > 0 && <Gallery images={outlet.gallery} title="Inside Room XO" />}
    </div>
  );
}
