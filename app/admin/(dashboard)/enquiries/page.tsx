import { listEnquiries } from "@/lib/db";
import { EmptyState } from "@/components/shared/EmptyState";

const TYPE_LABELS: Record<string, string> = {
  reservation: "Table Reservation",
  "private-party": "Private Party",
  general: "General Enquiry",
};

export default async function AdminEnquiriesPage() {
  const enquiries = await listEnquiries();

  return (
    <div>
      <h1 className="text-display-3 mb-8">Enquiries</h1>

      {!enquiries.length ? (
        <EmptyState title="No enquiries yet" description="Reservation, private party and contact form submissions will appear here." />
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="card-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg text-bone-100">{enquiry.name}</p>
                <span className="text-[10px] uppercase tracking-wider text-gold-bright">{TYPE_LABELS[enquiry.type]}</span>
              </div>
              <p className="mt-1 text-xs text-bone-400">{new Date(enquiry.createdAt).toLocaleString("en-IN")}</p>
              <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-bone-300/80 sm:grid-cols-2">
                <div>
                  <span className="text-bone-500">Phone:</span> {enquiry.phone}
                </div>
                {"email" in enquiry && enquiry.email && (
                  <div>
                    <span className="text-bone-500">Email:</span> {enquiry.email}
                  </div>
                )}
                {enquiry.type === "reservation" && (
                  <>
                    <div><span className="text-bone-500">Outlet:</span> {enquiry.outletSlug}</div>
                    <div><span className="text-bone-500">Date/Time:</span> {enquiry.date} at {enquiry.time}</div>
                    <div><span className="text-bone-500">Guests:</span> {enquiry.guests}</div>
                    {enquiry.occasion && <div><span className="text-bone-500">Occasion:</span> {enquiry.occasion}</div>}
                  </>
                )}
                {enquiry.type === "private-party" && (
                  <>
                    <div><span className="text-bone-500">City:</span> {enquiry.city}</div>
                    <div><span className="text-bone-500">Event Date:</span> {enquiry.eventDate}</div>
                    <div><span className="text-bone-500">Guests:</span> {enquiry.guests}</div>
                    <div><span className="text-bone-500">Type:</span> {enquiry.eventType}</div>
                    {enquiry.budget && <div><span className="text-bone-500">Budget:</span> {enquiry.budget}</div>}
                  </>
                )}
                {enquiry.type === "general" && enquiry.outletSlug && (
                  <div><span className="text-bone-500">Outlet:</span> {enquiry.outletSlug}</div>
                )}
              </dl>
              {"message" in enquiry && enquiry.message && <p className="mt-3 text-sm text-bone-300/70">{enquiry.message}</p>}
              {"additionalRequest" in enquiry && enquiry.additionalRequest && (
                <p className="mt-3 text-sm text-bone-300/70">{enquiry.additionalRequest}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
