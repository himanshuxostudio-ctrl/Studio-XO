"use client";

import Link from "next/link";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface BookingCTAProps {
  outletSlug: string;
  outletName: string;
  city: string;
  eventSlug?: string;
  label?: string;
  className?: string;
  variant?: "primary" | "outline";
}

export function BookingCTA({ outletSlug, outletName, city, eventSlug, label = "Book a Table", className, variant = "primary" }: BookingCTAProps) {
  const params = new URLSearchParams({ outlet: outletSlug });
  if (eventSlug) params.set("event", eventSlug);
  const style = variant === "primary" ? "btn-primary" : "btn-outline";

  return (
    <Link
      href={`/reserve?${params.toString()}`}
      className={cn(style, className)}
      onClick={() => analytics.tableBookingClick({ outlet: outletName, city, event_name: eventSlug })}
    >
      {label}
    </Link>
  );
}
