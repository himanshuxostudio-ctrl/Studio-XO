import type { Outlet } from "@/lib/types";
import { Frame } from "@/components/shared/Frame";
import { BookingCTA } from "@/components/shared/BookingCTA";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { PhoneCTA } from "@/components/shared/PhoneCTA";
import { DirectionsCTA } from "@/components/shared/DirectionsCTA";
import { InstagramCTA } from "@/components/shared/InstagramCTA";
import { OUTLET_STATUS_LABELS } from "@/lib/constants";
import { privatePartyMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function OutletHero({ outlet }: { outlet: Outlet }) {
  const isOperational = outlet.status === "operational";

  return (
    <section className="grid grid-cols-1 gap-8 pt-16 sm:pt-20 lg:grid-cols-2 lg:gap-0">
      <Frame image={outlet.heroImage} className="aspect-[4/5] lg:aspect-auto lg:h-full" priority sizes="(min-width: 1024px) 50vw, 100vw" />

      <div className="container-xo flex flex-col justify-center py-10 lg:px-16">
        <span
          className={cn(
            "w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
            isOperational && "bg-gold/20 text-gold-bright",
            outlet.status === "renovation" && "bg-signal-amber/20 text-signal-amber",
            outlet.status === "reopening-soon" && "bg-bone-100/15 text-bone-100"
          )}
        >
          {OUTLET_STATUS_LABELS[outlet.status]}
        </span>

        <p className="eyebrow mt-4">{outlet.city}</p>
        <h1 className="text-display-2 mt-2 text-balance">{outlet.name}</h1>
        <p className="mt-4 text-lg text-bone-200/85">{outlet.tagline}</p>

        {outlet.statusMessage && (
          <p className="mt-4 max-w-md border-l-2 border-gold-bright pl-4 text-sm text-bone-300/80">{outlet.statusMessage}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {isOperational ? (
            <>
              <BookingCTA outletSlug={outlet.slug} outletName={outlet.name} city={outlet.city} />
              <a href="#events" className="btn-outline">
                Events
              </a>
              <DirectionsCTA mapsUrl={outlet.googleMapsUrl} outlet={outlet.name} city={outlet.city} />
              {outlet.phones[0] && <PhoneCTA number={`91${outlet.phones[0]}`} outlet={outlet.name} city={outlet.city} />}
              <WhatsAppCTA
                number={outlet.whatsappNumber}
                message={privatePartyMessage(outlet.name)}
                context="outlet-hero"
                outlet={outlet.name}
                city={outlet.city}
              />
            </>
          ) : (
            <>
              <InstagramCTA url={outlet.instagramUrl} handle={`Follow ${outlet.instagramHandle}`} outlet={outlet.name} brand={outlet.brand} variant="primary" />
              <DirectionsCTA mapsUrl={outlet.googleMapsUrl} label="Location" outlet={outlet.name} city={outlet.city} />
              {outlet.phones[0] && <PhoneCTA number={`91${outlet.phones[0]}`} label="Contact" outlet={outlet.name} city={outlet.city} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
