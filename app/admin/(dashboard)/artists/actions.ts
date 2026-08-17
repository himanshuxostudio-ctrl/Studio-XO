"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveArtist, deleteArtist as deleteArtistFromDb, getAllEvents } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { Artist } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return (formData.get(key)?.toString() || "").trim();
}

// An artist has no public page of its own — the only place a name/bio/image
// change is visible is the artist card on each event detail page that
// references it (see app/events/[slug]/page.tsx). Revalidating only "/events"
// (the list, which doesn't show artist details at all) missed those, so a
// bio/photo fix wouldn't show up on an already-cached event page.
async function revalidateEventsReferencingArtist(...slugs: string[]) {
  revalidatePath("/events");
  const relevant = new Set(slugs.filter(Boolean));
  if (relevant.size === 0) return;
  const events = await getAllEvents();
  for (const event of events) {
    if (event.artistSlugs.some((s) => relevant.has(s))) {
      revalidatePath(`/events/${event.slug}`);
    }
  }
}

export async function saveArtistAction(formData: FormData) {
  await requireSection("artists");

  const originalSlug = str(formData, "originalSlug");
  const name = str(formData, "name");
  const slug = str(formData, "slug") || slugify(name);

  const artist: Artist = {
    slug,
    name,
    bio: str(formData, "bio"),
    image: str(formData, "imageSrc") ? { src: str(formData, "imageSrc"), alt: str(formData, "imageAlt") || name } : undefined,
    instagramUrl: str(formData, "instagramUrl") || undefined,
    genres: str(formData, "genres")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean),
  };

  if (originalSlug && originalSlug !== slug) {
    await deleteArtistFromDb(originalSlug);
  }

  await saveArtist(artist);
  await revalidateEventsReferencingArtist(slug, originalSlug);
  redirect("/admin/artists");
}

export async function deleteArtistAction(formData: FormData) {
  await requireSection("artists");
  const slug = str(formData, "slug");
  await deleteArtistFromDb(slug);
  await revalidateEventsReferencingArtist(slug);
  redirect("/admin/artists");
}
