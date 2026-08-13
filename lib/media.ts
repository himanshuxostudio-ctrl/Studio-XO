import "server-only";
import { generateId } from "./utils";
import { saveMediaItem, deleteMediaItem } from "./db";
import { getSupabase } from "./supabase";
import type { MediaCategory, MediaItem } from "./types";

const STORAGE_BUCKET = "media";
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export class MediaUploadError extends Error {}

function safeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

/**
 * Uploads a file to Supabase Storage (bucket: "media") and records its
 * metadata in the `media` table. Vercel's serverless filesystem is
 * read-only, so nothing here touches local disk — the file buffer goes
 * straight to Storage and only the resulting public URL is persisted.
 */
export async function saveUploadedFile(params: {
  file: File;
  category: MediaCategory;
  alt: string;
  uploadedBy?: string;
}): Promise<MediaItem> {
  const { file, category, alt, uploadedBy } = params;

  if (file.size === 0) throw new MediaUploadError("The selected file is empty.");
  if (file.size > MAX_BYTES) throw new MediaUploadError("File is larger than the 15 MB limit.");

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) throw new MediaUploadError(`Unsupported file type: ${file.type || "unknown"}.`);

  const id = generateId();
  const baseName = safeSlug(file.name.replace(/\.[^.]+$/, "")) || "file";
  const filename = `${baseName}-${id.slice(0, 8)}.${extension}`;
  const storagePath = `${category}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = getSupabase();

  const upload = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (upload.error) throw new MediaUploadError(`Upload failed: ${upload.error.message}`);

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  const item: MediaItem = {
    id,
    url: publicUrlData.publicUrl,
    filename,
    alt,
    category,
    mimeType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
  };

  await saveMediaItem(item);
  return item;
}

export async function removeMediaFile(id: string): Promise<void> {
  const item = await deleteMediaItem(id);
  if (!item) return;

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const markerIndex = item.url.indexOf(marker);
  if (markerIndex === -1) return;

  const storagePath = item.url.slice(markerIndex + marker.length);
  await getSupabase()
    .storage.from(STORAGE_BUCKET)
    .remove([storagePath])
    .catch(() => {
      // Metadata record is already gone — the underlying object being
      // orphaned isn't fatal for the admin UI.
    });
}
