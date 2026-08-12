import Image from "next/image";
import type { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-[#1c1710] via-[#0d0d10] to-[#08080a]",
  "from-[#1a1420] via-[#0d0d10] to-[#08080a]",
  "from-[#12181c] via-[#0d0d10] to-[#08080a]",
  "from-[#1d1512] via-[#0d0d10] to-[#08080a]",
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
    const gradient = GRADIENTS[hashToIndex(image.src, GRADIENTS.length)];
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br bg-noise",
          gradient,
          className
        )}
        role="img"
        aria-label={image.alt}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-4xl tracking-[0.2em] text-bone-100/10 sm:text-6xl">XO</span>
        </div>
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
