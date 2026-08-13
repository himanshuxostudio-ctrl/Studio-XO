import Image from "next/image";
import type { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-[#1c1710] via-[#0d0d10] to-[#08080a]",
  "from-[#1a1420] via-[#0d0d10] to-[#08080a]",
  "from-[#12181c] via-[#0d0d10] to-[#08080a]",
  "from-[#1d1512] via-[#0d0d10] to-[#08080a]",
];

// Room XO gets its own cooler, violet-leaning treatment so it never reads as
// a re-skinned Studio XO placeholder — matches the accent used on /room-xo.
const ROOM_XO_GRADIENTS = [
  "from-[#181a2c] via-[#0e0e14] to-[#08080a]",
  "from-[#141726] via-[#0d0d13] to-[#08080a]",
];

function hashToIndex(input: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

function isPlaceholder(src: string): boolean {
  return src.startsWith("/placeholder");
}

function isRoomXo(src: string): boolean {
  return src.includes("room-xo");
}

interface FrameProps {
  image: GalleryImage;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}

/**
 * Renders real photography via next/image when available, otherwise a
 * deliberate editorial placeholder (gradient + monogram + label) instead of
 * stock nightclub imagery. Swap `image.src` for a real asset path under
 * /public to replace any placeholder with actual photography.
 */
export function Frame({ image, className, sizes, priority, fill = true }: FrameProps) {
  if (isPlaceholder(image.src)) {
    const roomXo = isRoomXo(image.src);
    const palette = roomXo ? ROOM_XO_GRADIENTS : GRADIENTS;
    const gradient = palette[hashToIndex(image.src, palette.length)];
    const monogramTint = roomXo ? "text-[#9aa3ff]/[0.09]" : "text-bone-100/10";

    return (
      <div
        className={cn(
          "group/frame relative overflow-hidden bg-gradient-to-br bg-noise",
          gradient,
          className
        )}
        role="img"
        aria-label={image.alt}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-display text-4xl tracking-[0.2em] transition-transform duration-700 ease-editorial group-hover/frame:scale-105 sm:text-6xl", monogramTint)}>
            XO
          </span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-bone-100/[0.04] to-transparent transition-transform duration-1000 ease-editorial group-hover/frame:translate-x-full motion-reduce:hidden"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-bone-100/[0.06]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-4">
          <p className="text-[11px] uppercase tracking-widest2 text-bone-300/50">{image.alt}</p>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes || "100vw"}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width || 1200}
      height={image.height || 800}
      priority={priority}
      className={className}
    />
  );
}
