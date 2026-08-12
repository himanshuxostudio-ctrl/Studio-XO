import Link from "next/link";
import type { Outlet } from "@/lib/types";
import { Frame } from "@/components/shared/Frame";
import { LocationSelector } from "./LocationSelector";

export function Hero({ outlets }: { outlets: Outlet[] }) {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden">
      <div className="absolute inset-0">
        <Frame
          image={{ src: "/placeholder/hero", alt: "Studio XO — a live stage mid-performance, crowd in silhouette" }}
          className="h-full w-full"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-grain-fade" />
      </div>

      <div className="container-xo relative z-10 pb-16 pt-40 sm:pb-24">
        <p className="eyebrow fade-up">Live Entertainment · Dining · Nightlife</p>
        <h1 className="text-display-1 fade-up mt-4 max-w-4xl text-balance [animation-delay:120ms]">
          Where nights become memories.
        </h1>
        <p className="fade-up mt-6 max-w-xl text-balance text-base text-bone-200/85 sm:text-lg [animation-delay:220ms]">
          Live music, comedy, Sufi nights and weekend takeovers — across Studio XO&rsquo;s rooms and Room XO&rsquo;s
          floor. Pick a city, find your night.
        </p>

        <div className="fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center [animation-delay:320ms]">
          <Link href="/events" className="btn-primary">
            Explore Events
          </Link>
          <Link href="/reserve" className="btn-outline">
            Book a Table
          </Link>
        </div>

        <div className="fade-up mt-10 max-w-md [animation-delay:420ms]">
          <LocationSelector outlets={outlets} />
        </div>
      </div>
    </section>
  );
}
