import { notFound } from "next/navigation";
import { getOutletBySlug } from "@/lib/db";
import { saveOutletAction } from "../actions";

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400";

export default async function EditOutletPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const outlet = await getOutletBySlug(slug);
  if (!outlet) notFound();

  return (
    <div>
      <h1 className="text-display-3 mb-8">{outlet.name}</h1>
      <form action={saveOutletAction} className="max-w-2xl space-y-6">
        <input type="hidden" name="slug" value={outlet.slug} />

        <div>
          <label className={labelClass} htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={outlet.status} className={fieldClass}>
            <option value="operational">Operational</option>
            <option value="renovation">Under Renovation</option>
            <option value="reopening-soon">Reopening Soon</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="statusMessage">Status Message (shown when not operational)</label>
          <input id="statusMessage" name="statusMessage" defaultValue={outlet.statusMessage} className={fieldClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="tagline">Tagline</label>
          <input id="tagline" name="tagline" defaultValue={outlet.tagline} className={fieldClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="description">Description (one paragraph per line)</label>
          <textarea id="description" name="description" rows={4} defaultValue={outlet.description.join("\n")} className={fieldClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="address">Address</label>
          <input id="address" name="address" defaultValue={outlet.address} className={fieldClass} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="phones">Phone Numbers (comma-separated)</label>
            <input id="phones" name="phones" defaultValue={outlet.phones.join(", ")} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="emails">Emails (comma-separated)</label>
            <input id="emails" name="emails" defaultValue={outlet.emails.join(", ")} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="instagramUrl">Instagram URL</label>
            <input id="instagramUrl" name="instagramUrl" defaultValue={outlet.instagramUrl} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="whatsappNumber">WhatsApp Number (digits, country code)</label>
            <input id="whatsappNumber" name="whatsappNumber" defaultValue={outlet.whatsappNumber} className={fieldClass} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="googleMapsUrl">Google Maps URL</label>
          <input id="googleMapsUrl" name="googleMapsUrl" defaultValue={outlet.googleMapsUrl} className={fieldClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="seoTitle">SEO Title</label>
          <input id="seoTitle" name="seoTitle" defaultValue={outlet.seoTitle} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="seoDescription">SEO Description</label>
          <input id="seoDescription" name="seoDescription" defaultValue={outlet.seoDescription} className={fieldClass} />
        </div>

        <label className="flex w-fit items-center gap-2 border border-bone-300/15 px-3 py-2.5 text-sm text-bone-200">
          <input type="checkbox" name="featured" defaultChecked={outlet.featured} className="accent-gold-bright" />
          Featured
        </label>

        <button type="submit" className="btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}
