import Link from "next/link";
import { getArtists, getAllEvents } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { EmptyState } from "@/components/shared/EmptyState";
import { deleteArtistAction } from "./actions";

export default async function AdminArtistsPage() {
  await requireSection("artists");
  const [artists, events] = await Promise.all([getArtists(), getAllEvents()]);
  const eventCountBySlug = new Map<string, number>();
  for (const event of events) {
    for (const slug of event.artistSlugs) {
      eventCountBySlug.set(slug, (eventCountBySlug.get(slug) || 0) + 1);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-display-3">Artists</h1>
        <Link href="/admin/artists/new" className="btn-primary">
          + New Artist
        </Link>
      </div>

      {!artists.length ? (
        <EmptyState className="mt-8" title="No artists yet" description="Add artists to reference them from events instead of retyping bios." actionLabel="+ New Artist" actionHref="/admin/artists/new" />
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-bone-300/15 text-left text-xs uppercase tracking-wider text-bone-400">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Genres</th>
                <th className="py-3 pr-4">Events</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.slug} className="border-b border-bone-300/10">
                  <td className="py-3 pr-4 font-medium text-bone-100">{artist.name}</td>
                  <td className="py-3 pr-4 text-bone-300/70">{artist.genres?.join(", ") || "—"}</td>
                  <td className="py-3 pr-4 text-bone-300/70">{eventCountBySlug.get(artist.slug) || 0}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/artists/${artist.slug}`} className="text-gold-bright hover:underline">
                        Edit
                      </Link>
                      <form action={deleteArtistAction}>
                        <input type="hidden" name="slug" value={artist.slug} />
                        <button type="submit" className="text-signal-red hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
