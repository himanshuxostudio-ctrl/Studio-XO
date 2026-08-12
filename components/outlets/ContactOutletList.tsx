import type { Outlet } from "@/lib/types";
import { PhoneCTA } from "@/components/shared/PhoneCTA";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { DirectionsCTA } from "@/components/shared/DirectionsCTA";
import { InstagramCTA } from "@/components/shared/InstagramCTA";
import { OUTLET_STATUS_LABELS } from "@/lib/constants";
import { generalEnquiryMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function ContactOutletList({ outlets }: { outlets: Outlet[] }) {
  return (
    <div className="divide-y divide-bone-300/10 border-y border-bone-300/10">
      {outlets.map((outlet) => (
        <div key={outlet.slug} className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-display text-xl text-bone-100">{outlet.name}</p>
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  outlet.status === "operational" && "bg-gold/20 text-gold-bright",
                  outlet.status === "renovation" && "bg-signal-amber/20 text-signal-amber",
                  outlet.status === "reopening-soon" && "bg-bone-100/15 text-bone-100"
                )}
              >
                {OUTLET_STATUS_LABELS[outlet.status]}
              </span>
            </div>
            <p className="mt-1 text-sm text-bone-300/70">{outlet.city}, {outlet.state}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {outlet.phones[0] && <PhoneCTA number={`91${outlet.phones[0]}`} label="Call" outlet={outlet.name} city={outlet.city} variant="ghost" />}
            <WhatsAppCTA
              number={outlet.whatsappNumber}
              message={generalEnquiryMessage(outlet.name)}
              context="contact-outlet-list"
              outlet={outlet.name}
              city={outlet.city}
              variant="ghost"
              label="WhatsApp"
            />
            <DirectionsCTA mapsUrl={outlet.googleMapsUrl} outlet={outlet.name} city={outlet.city} variant="ghost" label="Directions" />
            <InstagramCTA url={outlet.instagramUrl} outlet={outlet.name} brand={outlet.brand} variant="ghost" handle="Instagram" />
          </div>
        </div>
      ))}
    </div>
  );
}
