import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { generateId } from "./utils";
import { saveMediaItem, deleteMediaItem } from "./db";
import type { MediaCategory, MediaItem } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
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
 * Stores an uploaded file locally under /public/uploads (gitignored, served
 * directly by Next.js) and records its metadata. This is the one place that
 * would change to move storage to S3/Supabase Storage/Cloudinary — swap the
 * write + returned `url` here, keep the MediaItem shape and every caller.
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

  const categoryDir = path.join(UPLOAD_ROOT, category);
  await fs.mkdir(categoryDir, { recursive: true });

  const id = generateId();
  const baseName = safeSlug(file.name.replace(/\.[^.]+$/, "")) || "file";
  const filename = `${baseName}-${id.slice(0, 8)}.${extension}`;
  const diskPath = path.join(categoryDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(diskPath, buffer);

  const item: MediaItem = {
    id,
    url: `/uploads/${category}/${filename}`,
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
  const diskPath = path.join(process.cwd(), "public", item.url);
  await fs.unlink(diskPath).catch(() => {
    // Already gone — fine, the metadata record is what matters for the UI.
  });
}
