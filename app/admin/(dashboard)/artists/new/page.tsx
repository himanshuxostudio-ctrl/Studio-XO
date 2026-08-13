import { requireSection } from "@/lib/auth";
import { ArtistForm } from "@/components/admin/ArtistForm";

export default async function NewArtistPage() {
  await requireSection("artists");
  return (
    <div>
      <h1 className="text-display-3 mb-8">New Artist</h1>
      <ArtistForm />
    </div>
  );
}
