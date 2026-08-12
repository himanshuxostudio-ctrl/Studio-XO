import Link from "next/link";
import type { Event, Outlet } from "@/lib/types";
import { Frame } from "@/components/shared/Frame";
import { formatEventDateShort, formatTime12h } from "@/lib/utils";
import { EVENT_CATEGORY_LABELS } from "@/lib/constants";

interface EventCardProps {
  event: Event;
  outlet: Outlet;
}

export function EventCard({ event, outlet }: EventCardProps) {
  const { day, month, weekday } = formatEventDateShort(event.date);

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="relative">
        <Frame image={event.artwork} className="aspect-[4/5] transition-transform duration-500 ease-editorial group-hover:scale-[1.02]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />

        <div className="absolute left-3 top-3 flex flex-col items-center border border-bone-100/20 bg-ink-950/80 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-bright">{weekday}</span>
          <span className="font-display text-lg leading-none text-bone-100">{day}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-bone-300">{month}</span>
        </div>

        {event.soldOut && (
          <span className="absolute right-3 top-3 bg-signal-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-bone-100">
            Sold Out
          </span>
        )}
        {event.cancelled && (
          <span className="absolute right-3 top-3 bg-ink-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-bone-100">
            Cancelled
          </span>
        )}
      </div>

      <div className="pt-3">
        <p className="eyebrow">{EVENT_CATEGORY_LABELS[event.category] || event.category}</p>
        <h3 className="mt-1 font-display text-xl text-bone-100 group-hover:text-gold-bright transition-colors">{event.name}</h3>
        <p className="mt-1 text-sm text-bone-300/70">
          {outlet.name} · {formatTime12h(event.startTime)}
        </p>
      </div>
    </Link>
  );
}
