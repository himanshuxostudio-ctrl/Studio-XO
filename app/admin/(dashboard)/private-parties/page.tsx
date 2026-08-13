import { getPrivatePartyLeads, getOutlets } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { EmptyState } from "@/components/shared/EmptyState";
import { PhoneCTA } from "@/components/shared/PhoneCTA";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { formatEventDate, toIndianDialNumber, cn } from "@/lib/utils";
import { adminLeadFollowUp } from "@/lib/whatsapp";
import { updateLeadStatusAction } from "./actions";
import type { LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "converted", "lost"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-bone-100/15 text-bone-100",
  contacted: "bg-signal-amber/20 text-signal-amber",
  qualified: "bg-gold/20 text-gold-bright",
  converted: "bg-[#4ade80]/20 text-[#4ade80]",
  lost: "bg-signal-red/20 text-signal-red",
};

interface LeadsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPrivatePartiesPage({ searchParams }: LeadsPageProps) {
  await requireSection("private-parties");
  const [leads, outlets, params] = await Promise.all([getPrivatePartyLeads(), getOutlets(), searchParams]);
  const outletMap = new Map(outlets.map((o) => [o.slug, o]));
  const filter = params.status as LeadStatus | undefined;
  const filtered = filter ? leads.filter((l) => l.status === filter) : leads;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-display-3">Private Party Leads</h1>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/private-parties" className={cn("px-3 py-1.5 text-xs uppercase tracking-wider", !filter ? "bg-gold-bright text-ink-950" : "border border-bone-300/20 text-bone-400")}>
            All ({leads.length})
          </a>
          {STATUSES.map((status) => (
            <a
              key={status}
              href={`/admin/private-parties?status=${status}`}
              className={cn("px-3 py-1.5 text-xs uppercase tracking-wider", filter === status ? "bg-gold-bright text-ink-950" : "border border-bone-300/20 text-bone-400")}
            >
              {status} ({leads.filter((l) => l.status === status).length})
            </a>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState className="mt-8" title="No leads here" description="Private party enquiries from the website will appear here." />
      ) : (
        <div className="mt-8 space-y-3">
          {filtered.map((lead) => {
            const outlet = lead.outletSlug ? outletMap.get(lead.outletSlug) : undefined;
            return (
              <div key={lead.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-bone-100">{lead.name}</p>
                    <p className="text-xs text-bone-400">{new Date(lead.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <span className={cn("px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", STATUS_STYLES[lead.status])}>
                    {lead.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-bone-300/80 sm:grid-cols-3">
                  <div><span className="text-bone-500">City:</span> {lead.city}</div>
                  {outlet && <div><span className="text-bone-500">Outlet:</span> {outlet.name}</div>}
                  <div><span className="text-bone-500">Event Date:</span> {formatEventDate(lead.eventDate)}</div>
                  <div><span className="text-bone-500">Guests:</span> {lead.guests}</div>
                  <div><span className="text-bone-500">Type:</span> {lead.eventType}</div>
                  {lead.budget && <div><span className="text-bone-500">Budget:</span> {lead.budget}</div>}
                  <div><span className="text-bone-500">Phone:</span> {lead.phone}</div>
                  <div><span className="text-bone-500">Email:</span> {lead.email}</div>
                </dl>
                {lead.message && <p className="mt-2 text-sm text-bone-300/70">{lead.message}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <PhoneCTA number={toIndianDialNumber(lead.phone)} variant="ghost" />
                  <WhatsAppCTA
                    number={toIndianDialNumber(lead.phone)}
                    message={adminLeadFollowUp({ name: lead.name, eventType: lead.eventType })}
                    context="admin-private-parties"
                    variant="ghost"
                  />
                  <a href={`mailto:${lead.email}`} className="btn-ghost">
                    Email
                  </a>

                  <div className="ml-auto flex flex-wrap gap-1.5">
                    {STATUSES.filter((s) => s !== lead.status).map((status) => (
                      <form key={status} action={updateLeadStatusAction}>
                        <input type="hidden" name="id" value={lead.id} />
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
