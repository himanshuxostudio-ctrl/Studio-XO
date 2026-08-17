"use client";

import { analytics } from "@/lib/analytics";

interface TicketCTAProps {
  url: string;
  label: string;
  eventName: string;
  eventSlug: string;
  outletName: string;
  city: string;
  ticketPlatform: string;
  className?: string;
}

export function TicketCTA({ url, label, eventName, eventSlug, outletName, city, ticketPlatform, className }: TicketCTAProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        analytics.ticketClick({
          event_name: eventName,
          event_id: eventSlug,
          outlet: outletName,
          city,
          ticket_platform: ticketPlatform,
        })
      }
    >
      {label}
    </a>
  );
}
