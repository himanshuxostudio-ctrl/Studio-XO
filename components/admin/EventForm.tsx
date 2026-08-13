import type { Artist, Event, MediaItem, Outlet } from "@/lib/types";
import { EVENT_CATEGORY_LABELS, TICKET_PLATFORM_LABELS } from "@/lib/constants";
import { saveEventAction } from "@/app/admin/(dashboard)/events/actions";

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400";

interface EventFormProps {
  event?: Event;
  draft?: Partial<Event>;
  outlets: Outlet[];
  artists: Artist[];
  media?: MediaItem[];
}

export function EventForm({ event, draft, outlets, artists, media = [] }: EventFormProps) {
  const v = event || draft || {};
  const artworkOptions = media.filter((m) => m.category === "event-artwork");

  return (
    <form action={saveEventAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="originalSlug" value={event?.slug || ""} />
      <input type="hidden" name="source" value={v.source || "manual"} />
      {v.sourceUrl && <input type="hidden" name="sourceUrl" value={v.sourceUrl} />}

      {v.source === "bookmyshow-import" && (
        <p className="border border-gold-bright/20 bg-gold/5 px-4 py-2 text-xs text-bone-300">
          Imported from{" "}
          <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gold-bright underline">
            BookMyShow
          </a>
          .
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">Event Name</label>
          <input id="name" name="name" required defaultValue={v.name} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="slug">URL Slug (auto if blank)</label>
          <input id="slug" name="slug" defaultValue={event?.slug} placeholder="e.g. friday-live-noida" className={fieldClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="outletSlug">Outlet</label>
          <select id="outletSlug" name="outletSlug" required defaultValue={v.outletSlug} className={fieldClass}>
            <option value="">Select outlet</option>
            {outlets.map((o) => (
              <option key={o.slug} value={o.slug}>{o.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="brand">Brand</label>
          <select id="brand" name="brand" defaultValue={v.brand || "studio-xo"} className={fieldClass}>
            <option value="studio-xo">Studio XO</option>
            <option value="room-xo">Room XO</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={v.category || "live-music"} className={fieldClass}>
            {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="artistSlugs">Artists</label>
          {artists.length ? (
            <select id="artistSlugs" name="artistSlugs" multiple defaultValue={v.artistSlugs} className={`${fieldClass} h-[104px]`}>
              {artists.map((artist) => (
                <option key={artist.slug} value={artist.slug}>{artist.name}</option>
              ))}
            </select>
          ) : (
            <p className="border border-bone-300/15 px-4 py-2.5 text-sm text-bone-400">
              No artists yet — add one under Artists first.
            </p>
          )}
          <p className="mt-1 text-xs text-bone-500">Cmd/Ctrl-click to select more than one.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="date">Date</label>
          <input id="date" name="date" type="date" required defaultValue={v.date} className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="startTime">Start Time</label>
            <input id="startTime" name="startTime" type="time" required defaultValue={v.startTime} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="endTime">End Time</label>
            <input id="endTime" name="endTime" type="time" defaultValue={v.endTime} className={fieldClass} />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">Description (one paragraph per line)</label>
        <textarea id="description" name="description" rows={4} defaultValue={v.description?.join("\n")} className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="artworkSrc">Artwork Image Path</label>
          <input id="artworkSrc" name="artworkSrc" list="event-artwork-media" defaultValue={v.artwork?.src} placeholder="/images/events/... or leave blank" className={fieldClass} />
          <datalist id="event-artwork-media">
            {artworkOptions.map((item) => (
              <option key={item.id} value={item.url}>{item.filename}</option>
            ))}
          </datalist>
          <p className="mt-1 text-xs text-bone-500">
            Start typing to pick an uploaded image from <a href="/admin/media" className="text-gold-bright underline">Media</a>, or leave blank for a placeholder.
          </p>
        </div>
        <div>
          <label className={labelClass} htmlFor="artworkAlt">Artwork Alt Text</label>
          <input id="artworkAlt" name="artworkAlt" defaultValue={v.artwork?.alt} className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="ticketPlatform">Ticket Platform</label>
          <select id="ticketPlatform" name="ticketPlatform" defaultValue={v.ticket?.platform || "none"} className={fieldClass}>
            {Object.entries(TICKET_PLATFORM_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ticketUrl">Ticket URL</label>
          <input id="ticketUrl" name="ticketUrl" type="url" defaultValue={v.ticket?.url} placeholder="https://" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ticketCtaLabel">Ticket CTA Label</label>
          <input id="ticketCtaLabel" name="ticketCtaLabel" defaultValue={v.ticket?.ctaLabel || "Get Tickets"} className={fieldClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="whatsappOverride">WhatsApp Override (optional, digits with country code)</label>
        <input id="whatsappOverride" name="whatsappOverride" defaultValue={v.whatsappOverride} className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { key: "tableBookingEnabled", label: "Table Booking", default: v.tableBookingEnabled ?? true },
          { key: "published", label: "Published", default: v.published ?? false },
          { key: "featured", label: "Featured", default: v.featured ?? false },
          { key: "soldOut", label: "Sold Out", default: v.soldOut ?? false },
          { key: "cancelled", label: "Cancelled", default: v.cancelled ?? false },
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
            <input id="seoTitle" name="seoTitle" defaultValue={v.seoTitle} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="seoDescription">SEO Description</label>
            <input id="seoDescription" name="seoDescription" defaultValue={v.seoDescription} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ogImage">OG Image Path</label>
            <input id="ogImage" name="ogImage" defaultValue={v.ogImage} className={fieldClass} />
          </div>
        </div>
      </details>

      <button type="submit" className="btn-primary">
        {event ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
}
