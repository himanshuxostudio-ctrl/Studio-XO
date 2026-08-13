import type { Artist } from "@/lib/types";
import { saveArtistAction } from "@/app/admin/(dashboard)/artists/actions";

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400";

export function ArtistForm({ artist, eventCount }: { artist?: Artist; eventCount?: number }) {
  return (
    <form action={saveArtistAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="originalSlug" value={artist?.slug || ""} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">Name</label>
          <input id="name" name="name" required defaultValue={artist?.name} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="slug">URL Slug (auto if blank)</label>
          <input id="slug" name="slug" defaultValue={artist?.slug} className={fieldClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" rows={4} defaultValue={artist?.bio} className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="imageSrc">Image Path</label>
          <input id="imageSrc" name="imageSrc" defaultValue={artist?.image?.src} placeholder="/images/artists/... or leave blank" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="imageAlt">Image Alt Text</label>
          <input id="imageAlt" name="imageAlt" defaultValue={artist?.image?.alt} className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="instagramUrl">Instagram URL</label>
          <input id="instagramUrl" name="instagramUrl" type="url" defaultValue={artist?.instagramUrl} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="genres">Genres / Categories (comma-separated)</label>
          <input id="genres" name="genres" defaultValue={artist?.genres?.join(", ")} className={fieldClass} />
        </div>
      </div>

      {artist && typeof eventCount === "number" && (
        <p className="text-xs text-bone-500">
          Referenced by {eventCount} event{eventCount === 1 ? "" : "s"}.
        </p>
      )}

      <button type="submit" className="btn-primary">
        {artist ? "Save Changes" : "Create Artist"}
      </button>
    </form>
  );
}
