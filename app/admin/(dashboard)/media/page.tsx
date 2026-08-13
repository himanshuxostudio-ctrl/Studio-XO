import Image from "next/image";
import { getMedia } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { EmptyState } from "@/components/shared/EmptyState";
import { uploadMediaAction, deleteMediaAction } from "./actions";
import type { MediaCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  "event-artwork": "Event Artwork",
  artist: "Artist",
  outlet: "Outlet",
  food: "Food",
  cocktails: "Cocktails",
  crowd: "Crowd",
  interior: "Interior",
  video: "Video",
};

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400";

interface MediaPageProps {
  searchParams: Promise<{ error?: string; category?: string }>;
}

export default async function AdminMediaPage({ searchParams }: MediaPageProps) {
  await requireSection("media");
  const [media, params] = await Promise.all([getMedia(), searchParams]);
  const filter = params.category as MediaCategory | undefined;
  const filtered = filter ? media.filter((m) => m.category === filter) : media;

  return (
    <div>
      <h1 className="text-display-3 mb-8">Media</h1>

      <form action={uploadMediaAction} encType="multipart/form-data" className="card-surface grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1fr_1fr_2fr_auto]">
        <div>
          <label className={labelClass} htmlFor="file">File</label>
          <input id="file" name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm" className={`${fieldClass} py-2`} />
        </div>
        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <select id="category" name="category" className={fieldClass} defaultValue="outlet">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="alt">Alt Text / Description</label>
          <input id="alt" name="alt" className={fieldClass} placeholder="Describe the image for accessibility & SEO" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Upload
          </button>
        </div>
      </form>
      {params.error && <p className="mt-3 text-sm text-signal-red">{params.error}</p>}
      <p className="mt-2 text-xs text-bone-500">Images and video up to 15 MB. Files are stored on this server under /public/uploads — swap lib/media.ts to move to cloud storage.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <a href="/admin/media" className={`px-3 py-1.5 text-xs uppercase tracking-wider ${!filter ? "bg-gold-bright text-ink-950" : "border border-bone-300/20 text-bone-400"}`}>
          All ({media.length})
        </a>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <a
            key={value}
            href={`/admin/media?category=${value}`}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider ${filter === value ? "bg-gold-bright text-ink-950" : "border border-bone-300/20 text-bone-400"}`}
          >
            {label} ({media.filter((m) => m.category === value).length})
          </a>
        ))}
      </div>

      {!filtered.length ? (
        <EmptyState className="mt-8" title="No media yet" description="Upload event artwork, outlet photos and more here, then reference the path when editing events or outlets." />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <div key={item.id} className="card-surface p-3">
              <div className="relative aspect-square overflow-hidden bg-ink-800">
                {item.category === "video" ? (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-wider text-bone-500">Video</div>
                ) : (
                  <Image src={item.url} alt={item.alt} fill sizes="200px" className="object-cover" />
                )}
              </div>
              <p className="mt-2 truncate text-xs text-bone-300">{item.filename}</p>
              <p className="select-all break-all text-[11px] text-bone-500">{item.url}</p>
              <form action={deleteMediaAction} className="mt-2">
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="text-[11px] uppercase tracking-wider text-signal-red hover:underline">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
