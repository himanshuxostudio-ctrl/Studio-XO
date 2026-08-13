"use server";

import { redirect } from "next/navigation";
import { requireSection } from "@/lib/auth";
import { saveUploadedFile, removeMediaFile, MediaUploadError } from "@/lib/media";
import type { MediaCategory } from "@/lib/types";

export async function uploadMediaAction(formData: FormData) {
  const user = await requireSection("media");

  const file = formData.get("file");
  const category = (formData.get("category")?.toString() || "outlet") as MediaCategory;
  const alt = formData.get("alt")?.toString().trim() || "";

  if (!(file instanceof File)) {
    redirect("/admin/media?error=" + encodeURIComponent("Choose a file to upload."));
  }

  try {
    await saveUploadedFile({ file, category, alt: alt || file.name, uploadedBy: user.name });
  } catch (err) {
    const message = err instanceof MediaUploadError ? err.message : "Upload failed. Please try again.";
    redirect("/admin/media?error=" + encodeURIComponent(message));
  }

  redirect("/admin/media");
}

export async function deleteMediaAction(formData: FormData) {
  await requireSection("media");
  const id = formData.get("id")?.toString();
  if (!id) return;
  await removeMediaFile(id);
  redirect("/admin/media");
}
