import { Frame } from "@/components/shared/Frame";

const IMAGES = [
  { src: "/placeholder/atmosphere-1", alt: "Close-up of a live artist performing under stage light" },
  { src: "/placeholder/atmosphere-2", alt: "A table of guests celebrating at Studio XO" },
  { src: "/placeholder/atmosphere-3", alt: "Bartender preparing a cocktail" },
  { src: "/placeholder/atmosphere-4", alt: "Crowd energy on a weekend night" },
  { src: "/placeholder/atmosphere-5", alt: "Dining setup ahead of service" },
];

export function GallerySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-xo mb-10">
        <p className="eyebrow">Atmosphere</p>
        <h2 className="text-display-3 mt-2">The room, in motion.</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto px-5 pb-2 sm:px-8 lg:px-12">
        {IMAGES.map((image) => (
          <Frame key={image.src} image={image} className="h-[60vw] w-[80vw] shrink-0 sm:h-[420px] sm:w-[320px]" sizes="320px" fill />
        ))}
      </div>
    </section>
  );
}
