import Link from "next/link";
import type { EventWithRelations } from "@/lib/types";
import { Frame } from "@/components/shared/Frame";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { BookingCTA } from "@/components/shared/BookingCTA";
import { analytics } from "@/lib/analytics";
import { eventEnquiryMessage } from "@/lib/whatsapp";
import { formatEventDate, formatTime12h } from "@/lib/utils";
import { EVENT_CATEGORY_LABELS, TICKET_PLATFORM_LABELS } from "@/lib/constants";

export function EventHero({ event }: { event: EventWithRelations }) {
  const { outlet } = event;
  const whatsappNumber = event.whatsappOverride || outlet.whatsappNumber;

  return (
    <section className="grid grid-cols-1 gap-8 pt-16 sm:pt-20 lg:grid-cols-2 lg:gap-0">
      <Frame image={event.artwork} className="aspect-[4/5] lg:aspect-auto lg:h-full" priority sizes="(min-width: 1024px) 50vw, 100vw" />

      <div className="container-xo flex flex-col justify-center py-10 lg:px-16">
        <p className="eyebrow">{EVENT_CATEGORY_LABELS[event.category] || event.category}</p>
        <h1 className="text-display-2 mt-3 text-balance">{event.name}</h1>

        <dl className="mt-6 space-y-2 text-sm text-bone-200/85">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-bone-400">Date</dt>
            <dd>{formatEventDate(event.date)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-bone-400">Time</dt>
            <dd>
              {formatTime12h(event.startTime)}
              {event.endTime ? ` – ${formatTime12h(event.endTime)}` : " onwards"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-bone-400">Venue</dt>
            <dd>
              <Link href={`/outlets/${outlet.slug}`} className="hover:text-gold-bright underline underline-offset-2">
                {outlet.name}
              </Link>
              , {outlet.city}
            </dd>
          </div>
        </dl>

        {event.cancelled && (
          <p className="mt-6 border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">
            This event has been cancelled.
          </p>
        )}

        {!event.cancelled && event.soldOut && (
          <p className="mt-6 border border-bone-100/20 bg-bone-100/5 px-4 py-3 text-sm text-bone-100">
            This event is sold out.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {!event.cancelled && event.soldOut && (
            <span className="btn-primary pointer-events-none opacity-50">Sold Out</span>
          )}

          {!event.cancelled && !event.soldOut && event.ticket.url && (
            <a
              href={event.ticket.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              onClick={() =>
                analytics.ticketClick({
                  event_name: event.name,
                  event_id: event.slug,
                  outlet: outlet.name,
                  city: outlet.city,
                  ticket_platform: event.ticket.platform,
                })
              }
            >
              {event.ticket.ctaLabel || TICKET_PLATFORM_LABELS[event.ticket.platform]}
            </a>
          )}

          {!event.cancelled && !event.soldOut && !event.ticket.url && (
            <span className="btn-outline pointer-events-none opacity-70">Tickets available at the door</span>
          )}

          {!event.cancelled && event.tableBookingEnabled && outlet.status === "operational" && (
            <BookingCTA outletSlug={outlet.slug} outletName={outlet.name} city={outlet.city} eventSlug={event.slug} variant="outline" />
          )}

          <WhatsAppCTA
            number={whatsappNumber}
            message={eventEnquiryMessage(event, outlet)}
            context="event-detail"
            outlet={outlet.name}
            city={outlet.city}
            variant="outline"
          />
        </div>
      </div>
    </section>
  );
}
