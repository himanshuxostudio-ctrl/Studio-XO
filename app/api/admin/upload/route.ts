import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { saveUploadedFile, MediaUploadError } from "@/lib/media";
import type { MediaCategory } from "@/lib/types";

/**
 * Direct-upload endpoint backing the admin panel's ImageUploadField
 * (outlet hero image, event banner). Fetch-based rather than a redirecting
 * Server Action so the client can show an immediate preview and an
 * uploading/error state without navigating away from the edit form.
 * Reuses the same Supabase Storage + media table plumbing as the existing
 * media library upload (lib/media.ts) — same bucket, same table, just a
 * stricter image-only + aspect-ratio check via `imageOnly`.
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canAccess(user.role, "media")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = (formData.get("category")?.toString() || "outlet") as MediaCategory;
  const alt = formData.get("alt")?.toString().trim() || "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  try {
    const item = await saveUploadedFile({
      file,
      category,
      alt: alt || file.name,
      uploadedBy: user.name,
      imageOnly: true,
    });
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof MediaUploadError ? err.message : "Upload failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
