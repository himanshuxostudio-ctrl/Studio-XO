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

// Direct hero/banner uploads (outlet hero image, event banner) are always
// photos, not video/gif/svg — the general media library keeps allowing the
// full set above.
const IMAGE_ONLY_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const TARGET_ASPECT_RATIO = 4 / 5; // matches the site's existing 4:5 image ratio
const ASPECT_RATIO_TOLERANCE = 0.12; // ±12%, generous enough for near-4:5 crops

export class MediaUploadError extends Error {}

function safeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

/**
 * Best-effort image dimension sniffing from raw bytes (no dependency on
 * sharp/image-size). Supports the three formats the direct-upload fields
 * accept. Returns null on anything it can't confidently parse — callers
 * must treat that as "skip the check", not "reject the file".
 */
function readImageDimensions(buffer: Buffer, mimeType: string): { width: number; height: number } | null {
  try {
    if (mimeType === "image/png") {
      if (buffer.length < 24) return null;
      if (buffer.readUInt32BE(0) !== 0x89504e47) return null;
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }

    if (mimeType === "image/jpeg") {
      if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) return null;
        const marker = buffer[offset + 1];
        // SOFn markers (frame headers), excluding DHT/JPG/DAC which share the range.
        const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSof) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
        }
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          offset += 2;
          continue;
        }
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      }
      return null;
    }

    if (mimeType === "image/webp") {
      if (buffer.length < 30) return null;
      if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
      const chunk = buffer.toString("ascii", 12, 16);

      if (chunk === "VP8 ") {
        return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
      }
      if (chunk === "VP8L") {
        const bits = buffer.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8X") {
        const width = buffer[24] | (buffer[25] << 8) | (buffer[26] << 16);
        const height = buffer[27] | (buffer[28] << 8) | (buffer[29] << 16);
        return { width: width + 1, height: height + 1 };
      }
      return null;
    }

    return null;
  } catch {
    return null;
  }
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
  /** Restricts to JPG/PNG/WEBP and validates the ~4:5 aspect ratio — used by
   * the outlet hero / event banner direct-upload fields. The general media
   * library upload keeps accepting the full ALLOWED_TYPES set. */
  imageOnly?: boolean;
}): Promise<MediaItem> {
  const { file, category, alt, uploadedBy, imageOnly } = params;

  if (file.size === 0) throw new MediaUploadError("The selected file is empty.");
  if (file.size > MAX_BYTES) throw new MediaUploadError("File is larger than the 15 MB limit.");

  const typeMap = imageOnly ? IMAGE_ONLY_TYPES : ALLOWED_TYPES;
  const extension = typeMap[file.type];
  if (!extension) {
    throw new MediaUploadError(
      imageOnly
        ? `Unsupported file type: ${file.type || "unknown"}. Upload a JPG, PNG or WEBP image.`
        : `Unsupported file type: ${file.type || "unknown"}.`
    );
  }

  const id = generateId();
  const baseName = safeSlug(file.name.replace(/\.[^.]+$/, "")) || "file";
  const filename = `${baseName}-${id.slice(0, 8)}.${extension}`;
  const storagePath = `${category}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  if (imageOnly) {
    const dimensions = readImageDimensions(buffer, file.type);
    if (dimensions) {
      const ratio = dimensions.width / dimensions.height;
      const deviation = Math.abs(ratio - TARGET_ASPECT_RATIO) / TARGET_ASPECT_RATIO;
      if (deviation > ASPECT_RATIO_TOLERANCE) {
        throw new MediaUploadError(
          `Image should be close to a 4:5 portrait ratio (e.g. 1200×1500px). This file is ${dimensions.width}×${dimensions.height}px.`
        );
      }
    }
    // Dimensions couldn't be read safely — don't block the upload on that alone.
  }

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
