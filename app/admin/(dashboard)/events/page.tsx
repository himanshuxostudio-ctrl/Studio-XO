import Link from "next/link";
import { getAllEvents, getOutlets } from "@/lib/db";
import { formatEventDate } from "@/lib/utils";
import { toggleEventFlagAction, deleteEventAction } from "./actions";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminEventsPage() {
  const [events, outlets] = await Promise.all([getAllEvents(), getOutlets()]);
  const outletMap = new Map(outlets.map((o) => [o.slug, o]));
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-display-3">Events</h1>
        <Link href="/admin/events/new" className="btn-primary">
          + New Event
        </Link>
      </div>

      {!sorted.length ? (
        <EmptyState className="mt-8" title="No events yet" description="Create your first event to see it here." actionLabel="+ New Event" actionHref="/admin/events/new" />
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-bone-300/15 text-left text-xs uppercase tracking-wider text-bone-400">
                <th className="py-3 pr-4">Event</th>
                <th className="py-3 pr-4">Outlet</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Flags</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((event) => {
                const outlet = outletMap.get(event.outletSlug);
                return (
                  <tr key={event.slug} className="border-b border-bone-300/10">
                    <td className="py-3 pr-4 font-medium text-bone-100">{event.name}</td>
                    <td className="py-3 pr-4 text-bone-300/70">{outlet?.name || event.outletSlug}</td>
                    <td className="py-3 pr-4 text-bone-300/70">{formatEventDate(event.date)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(["published", "featured", "soldOut", "cancelled"] as const).map((flag) => (
                          <form key={flag} action={toggleEventFlagAction}>
                            <input type="hidden" name="slug" value={event.slug} />
                            <input type="hidden" name="flag" value={flag} />
                            <button
                              type="submit"
                              className={`px-2 py-1 text-[10px] uppercase tracking-wider ${
                                event[flag] ? "bg-gold-bright text-ink-950" : "border border-bone-300/20 text-bone-400"
                              }`}
                            >
                              {flag}
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-3">
                        <Link href={`/admin/events/${event.slug}`} className="text-gold-bright hover:underline">
                          Edit
                        </Link>
                        <form action={deleteEventAction}>
                          <input type="hidden" name="slug" value={event.slug} />
                          <button type="submit" className="text-signal-red hover:underline">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
