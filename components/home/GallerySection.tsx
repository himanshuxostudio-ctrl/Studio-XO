import { Frame } from "@/components/shared/Frame";

const IMAGES = [
  { src: "/images/outlets/noida/gallery-08.jpg", alt: "The bartender at work at Studio XO Noida" },
  { src: "/images/outlets/noida/gallery-03.jpg", alt: "Guests at Studio XO Noida" },
  { src: "/images/outlets/mohali/gallery-07.jpg", alt: "A cocktail at Studio XO Mohali" },
  { src: "/images/outlets/gurgaon/gallery-04.jpg", alt: "A live band performing at Studio XO Gurgaon / Sector 29" },
  { src: "/images/outlets/indore/gallery-05.jpg", alt: "Guests sharing a meal at Studio XO Indore" },
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
