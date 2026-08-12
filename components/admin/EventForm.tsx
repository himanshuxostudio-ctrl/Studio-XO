import type { Event, Outlet } from "@/lib/types";
import { EVENT_CATEGORY_LABELS, TICKET_PLATFORM_LABELS } from "@/lib/constants";
import { saveEventAction } from "@/app/admin/(dashboard)/events/actions";

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400";

export function EventForm({ event, outlets }: { event?: Event; outlets: Outlet[] }) {
  return (
    <form action={saveEventAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="originalSlug" value={event?.slug || ""} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">Event Name</label>
          <input id="name" name="name" required defaultValue={event?.name} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="slug">URL Slug (auto if blank)</label>
          <input id="slug" name="slug" defaultValue={event?.slug} placeholder="e.g. friday-live-noida" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="outletSlug">Outlet</label>
          <select id="outletSlug" name="outletSlug" required defaultValue={event?.outletSlug} className={fieldClass}>
            <option value="">Select outlet</option>
            {outlets.map((o) => (
              <option key={o.slug} value={o.slug}>{o.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="brand">Brand</label>
          <select id="brand" name="brand" defaultValue={event?.brand || "studio-xo"} className={fieldClass}>
            <option value="studio-xo">Studio XO</option>
            <option value="room-xo">Room XO</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={event?.category || "live-music"} className={fieldClass}>
            {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="artistSlugs">Artist Slugs (comma-separated)</label>
          <input id="artistSlugs" name="artistSlugs" defaultValue={event?.artistSlugs.join(", ")} className={fieldClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="date">Date</label>
          <input id="date" name="date" type="date" required defaultValue={event?.date} className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="startTime">Start Time</label>
            <input id="startTime" name="startTime" type="time" required defaultValue={event?.startTime} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="endTime">End Time</label>
            <input id="endTime" name="endTime" type="time" defaultValue={event?.endTime} className={fieldClass} />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">Description (one paragraph per line)</label>
        <textarea id="description" name="description" rows={4} defaultValue={event?.description.join("\n")} className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="artworkSrc">Artwork Image Path</label>
          <input id="artworkSrc" name="artworkSrc" defaultValue={event?.artwork.src} placeholder="/images/events/... or leave blank" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="artworkAlt">Artwork Alt Text</label>
          <input id="artworkAlt" name="artworkAlt" defaultValue={event?.artwork.alt} className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="ticketPlatform">Ticket Platform</label>
          <select id="ticketPlatform" name="ticketPlatform" defaultValue={event?.ticket.platform || "none"} className={fieldClass}>
            {Object.entries(TICKET_PLATFORM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ticketUrl">Ticket URL</label>
          <input id="ticketUrl" name="ticketUrl" type="url" defaultValue={event?.ticket.url} placeholder="https://" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ticketCtaLabel">Ticket CTA Label</label>
          <input id="ticketCtaLabel" name="ticketCtaLabel" defaultValue={event?.ticket.ctaLabel || "Get Tickets"} className={fieldClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="whatsappOverride">WhatsApp Override (optional, digits with country code)</label>
        <input id="whatsappOverride" name="whatsappOverride" defaultValue={event?.whatsappOverride} className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { key: "tableBookingEnabled", label: "Table Booking", default: event?.tableBookingEnabled ?? true },
          { key: "published", label: "Published", default: event?.published ?? false },
          { key: "featured", label: "Featured", default: event?.featured ?? false },
          { key: "soldOut", label: "Sold Out", default: event?.soldOut ?? false },
          { key: "cancelled", label: "Cancelled", default: event?.cancelled ?? false },
        ].map((flag) => (
          <label key={flag.key} className="flex items-center gap-2 border border-bone-300/15 px-3 py-2.5 text-sm text-bone-200">
            <input type="checkbox" name={flag.key} defaultChecked={flag.default} className="accent-gold-bright" />
            {flag.label}
          </label>
        ))}
      </div>

      <details className="border border-bone-300/15 p-4">
        <summary className="cursor-pointer text-xs uppercase tracking-widest2 text-bone-400">SEO (optional overrides)</summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass} htmlFor="seoTitle">SEO Title</label>
            <input id="seoTitle" name="seoTitle" defaultValue={event?.seoTitle} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="seoDescription">SEO Description</label>
            <input id="seoDescription" name="seoDescription" defaultValue={event?.seoDescription} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ogImage">OG Image Path</label>
            <input id="ogImage" name="ogImage" defaultValue={event?.ogImage} className={fieldClass} />
          </div>
        </div>
      </details>

      <button type="submit" className="btn-primary">
        {event ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
}
