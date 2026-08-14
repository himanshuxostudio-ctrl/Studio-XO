"use client";

import { useRef, useState } from "react";
import type { MediaCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 15 * 1024 * 1024;

interface ImageUploadFieldProps {
  label: string;
  /** Hidden input name carrying the final uploaded URL — read by the parent form's Server Action. */
  srcFieldName: string;
  defaultSrc?: string;
  /** When provided, renders an editable alt-text input alongside the image (hidden input name). */
  altFieldName?: string;
  defaultAlt?: string;
  category: MediaCategory;
  recommended: { width: number; height: number };
  hint?: string;
  className?: string;
}

function isRealSrc(src?: string): src is string {
  return !!src && !src.startsWith("/placeholder");
}

export function ImageUploadField({
  label,
  srcFieldName,
  defaultSrc,
  altFieldName,
  defaultAlt,
  category,
  recommended,
  hint,
  className,
}: ImageUploadFieldProps) {
  const initialSrc = isRealSrc(defaultSrc) ? defaultSrc : "";
  const [src, setSrc] = useState(initialSrc);
  const [preview, setPreview] = useState(initialSrc);
  const [alt, setAlt] = useState(defaultAlt || "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const [lastFile, setLastFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported file type. Please upload a JPG, PNG or WEBP image.";
    }
    if (file.size > MAX_BYTES) {
      return "File is too large. Maximum size is 15 MB.";
    }
    return null;
  }

  async function upload(file: File) {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      setStatus("error");
      return;
    }

    setLastFile(file);
    setError("");
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setStatus("uploading");

    try {
      const body = new FormData();
      body.set("file", file);
      body.set("category", category);
      body.set("alt", alt);

      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed. Please try again.");

      setSrc(json.item.url);
      setPreview(json.item.url);
      setStatus("idle");
    } catch (err) {
      // Never overwrite a previously working image with a failed upload —
      // fall back to whatever was last successfully saved.
      setPreview(src);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function handleRemove() {
    setSrc("");
    setPreview("");
    setError("");
    setStatus("idle");
    setLastFile(null);
  }

  function handleRetry() {
    if (lastFile) upload(lastFile);
    else inputRef.current?.click();
  }

  return (
    <div className={className}>
      <input type="hidden" name={srcFieldName} value={src} />
      {altFieldName && <input type="hidden" name={altFieldName} value={alt} />}

      <label className="mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400">{label}</label>

      <div className="flex items-start gap-4">
        <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden border border-bone-300/20 bg-ink-900">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-only thumbnail, may be a local blob: preview URL that next/image can't optimize.
            <img src={preview} alt={alt || label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[9px] uppercase tracking-wider text-bone-500">
              No image
            </div>
          )}
          {status === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/70 text-[9px] uppercase tracking-wider text-bone-100">
              Uploading…
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={handleChange}
            className="hidden"
            aria-label={label}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={status === "uploading"}
              className="border border-bone-300/20 px-3 py-1.5 text-[11px] uppercase tracking-wider text-bone-200 hover:border-gold-bright hover:text-gold-bright disabled:opacity-50"
            >
              {status === "uploading" ? "Uploading…" : src ? "Replace Image" : "Upload Image"}
            </button>
            {status === "error" && (
              <button type="button" onClick={handleRetry} className="text-[11px] uppercase tracking-wider text-gold-bright underline">
                Retry
              </button>
            )}
            {src && status !== "uploading" && (
              <button type="button" onClick={handleRemove} className="text-[11px] uppercase tracking-wider text-signal-red underline">
                Remove
              </button>
            )}
          </div>

          {altFieldName && (
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image for accessibility & SEO"
              className="w-full border border-bone-300/20 bg-ink-900 px-3 py-2 text-xs text-bone-100 focus:border-gold-bright"
            />
          )}

          <p className="text-[11px] leading-relaxed text-bone-500">
            Recommended: {recommended.width} × {recommended.height}px (4:5 ratio) · Max 15 MB · JPG, PNG or WEBP
          </p>
          {hint && <p className="text-[11px] leading-relaxed text-bone-500">{hint}</p>}
          {status === "error" && <p className={cn("text-[11px]", "text-signal-red")}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
