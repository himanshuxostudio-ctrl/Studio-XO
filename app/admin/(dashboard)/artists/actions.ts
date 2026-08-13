"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveArtist, deleteArtist as deleteArtistFromDb } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { Artist } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return (formData.get(key)?.toString() || "").trim();
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
  revalidatePath("/events");
  redirect("/admin/artists");
}

export async function deleteArtistAction(formData: FormData) {
  await requireSection("artists");
  const slug = str(formData, "slug");
  await deleteArtistFromDb(slug);
  revalidatePath("/events");
  redirect("/admin/artists");
}
