import { getReservations, getOutlets } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { EmptyState } from "@/components/shared/EmptyState";
import { PhoneCTA } from "@/components/shared/PhoneCTA";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { formatEventDate, formatTime12h, toIndianDialNumber, cn } from "@/lib/utils";
import { adminReservationFollowUp } from "@/lib/whatsapp";
import { updateReservationStatusAction } from "./actions";
import type { ReservationStatus } from "@/lib/types";

const STATUSES: ReservationStatus[] = ["new", "contacted", "confirmed", "cancelled", "completed"];

const STATUS_STYLES: Record<ReservationStatus, string> = {
  new: "bg-bone-100/15 text-bone-100",
  contacted: "bg-signal-amber/20 text-signal-amber",
  confirmed: "bg-gold/20 text-gold-bright",
  cancelled: "bg-signal-red/20 text-signal-red",
  completed: "bg-bone-300/10 text-bone-400",
};

interface ReservationsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReservationsPage({ searchParams }: ReservationsPageProps) {
  await requireSection("reservations");
  const [reservations, outlets, params] = await Promise.all([getReservations(), getOutlets(), searchParams]);
  const outletMap = new Map(outlets.map((o) => [o.slug, o]));
  const filter = params.status as ReservationStatus | undefined;
  const filtered = filter ? reservations.filter((r) => r.status === filter) : reservations;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-display-3">Reservations</h1>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/reservations" className={cn("px-3 py-1.5 text-xs uppercase tracking-wider", !filter ? "bg-gold-bright text-ink-950" : "border border-bone-300/20 text-bone-400")}>
            All ({reservations.length})
          </a>
          {STATUSES.map((status) => (
            <a
              key={status}
              href={`/admin/reservations?status=${status}`}
              className={cn("px-3 py-1.5 text-xs uppercase tracking-wider", filter === status ? "bg-gold-bright text-ink-950" : "border border-bone-300/20 text-bone-400")}
            >
              {status} ({reservations.filter((r) => r.status === status).length})
            </a>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState className="mt-8" title="No reservations here" description="Table reservation requests from the website will appear here." />
      ) : (
        <div className="mt-8 space-y-3">
          {filtered.map((reservation) => {
            const outlet = outletMap.get(reservation.outletSlug);
            return (
              <div key={reservation.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-bone-100">{reservation.name}</p>
                    <p className="text-xs text-bone-400">{new Date(reservation.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <span className={cn("px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", STATUS_STYLES[reservation.status])}>
                    {reservation.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-bone-300/80 sm:grid-cols-3">
                  <div><span className="text-bone-500">Outlet:</span> {outlet?.name || reservation.outletSlug}</div>
                  <div><span className="text-bone-500">Date:</span> {formatEventDate(reservation.date)}</div>
                  <div><span className="text-bone-500">Time:</span> {formatTime12h(reservation.time)}</div>
                  <div><span className="text-bone-500">Guests:</span> {reservation.guests}</div>
                  <div><span className="text-bone-500">Phone:</span> {reservation.phone}</div>
                  {reservation.email && <div><span className="text-bone-500">Email:</span> {reservation.email}</div>}
                  {reservation.occasion && <div><span className="text-bone-500">Occasion:</span> {reservation.occasion}</div>}
                </dl>
                {reservation.additionalRequest && <p className="mt-2 text-sm text-bone-300/70">{reservation.additionalRequest}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <PhoneCTA number={toIndianDialNumber(reservation.phone)} variant="ghost" />
                  <WhatsAppCTA
                    number={toIndianDialNumber(reservation.phone)}
                    message={adminReservationFollowUp({ name: reservation.name, outletName: outlet?.name || "Studio XO", date: reservation.date, time: reservation.time, guests: reservation.guests })}
                    context="admin-reservations"
                    variant="ghost"
                  />
                  {reservation.email && (
                    <a href={`mailto:${reservation.email}`} className="btn-ghost">
                      Email
                    </a>
                  )}

                  <div className="ml-auto flex flex-wrap gap-1.5">
                    {STATUSES.filter((s) => s !== reservation.status).map((status) => (
                      <form key={status} action={updateReservationStatusAction}>
                        <input type="hidden" name="id" value={reservation.id} />
                        <input type="hidden" name="status" value={status} />
                        <button type="submit" className="border border-bone-300/20 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-bone-400 hover:border-gold-bright hover:text-gold-bright">
                          Mark {status}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
