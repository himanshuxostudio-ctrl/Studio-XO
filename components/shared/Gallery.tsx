import type { GalleryImage } from "@/lib/types";
import { Frame } from "./Frame";

export function Gallery({ images, title }: { images: GalleryImage[]; title?: string }) {
  if (!images.length) return null;

  return (
    <section className="container-xo py-16 sm:py-20">
      {title && <h2 className="text-display-3 mb-8">{title}</h2>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {images.map((image, index) => (
          <Frame
            key={`${image.src}-${index}`}
            image={image}
            className={`aspect-[4/5] ${index === 0 ? "col-span-2 aspect-[16/10] sm:col-span-1 sm:aspect-[4/5]" : ""}`}
            sizes="(min-width: 640px) 33vw, 50vw"
          />
        ))}
      </div>
    </section>
  );
}
