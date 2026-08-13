import { notFound } from "next/navigation";
import { getArtistBySlug, getAllEvents } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { ArtistForm } from "@/components/admin/ArtistForm";

export default async function EditArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSection("artists");
  const { slug } = await params;
  const [artist, events] = await Promise.all([getArtistBySlug(slug), getAllEvents()]);
  if (!artist) notFound();

  const eventCount = events.filter((e) => e.artistSlugs.includes(slug)).length;

  return (
    <div>
      <h1 className="text-display-3 mb-8">Edit Artist</h1>
      <ArtistForm artist={artist} eventCount={eventCount} />
    </div>
  );
}
