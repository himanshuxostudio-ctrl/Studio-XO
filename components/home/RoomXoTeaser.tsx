import Link from "next/link";
import Image from "next/image";
import { getOutletBySlug } from "@/lib/db";
import { Frame } from "@/components/shared/Frame";

export async function RoomXoTeaser() {
  const roomXo = await getOutletBySlug("room-xo");

  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0 opacity-70">
        <Frame image={{ src: "/images/room-xo/teaser-wide.jpg", alt: "Room XO's dramatic red runway dance floor" }} className="h-full w-full" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      </div>
      <div className="container-xo relative z-10 py-24 sm:py-32">
        <p className="text-xs font-semibold uppercase tracking-widest2 text-bone-400">A Different Room</p>
        <h2 className="relative mt-4 h-14 w-[220px] sm:h-16 sm:w-[280px]">
          <Image src="/images/brand/room-xo-logo.png" alt="Room XO" fill sizes="(min-width: 640px) 280px, 220px" className="object-contain object-left" />
        </h2>
        <p className="mt-5 max-w-lg text-bone-300/80">
          Techno. Electronic. Underground-leaning. Room XO is the late-night floor of the XO ecosystem — a separate
          sound, a separate crowd, {roomXo ? `in ${roomXo.city}` : "coming to more cities"}.
        </p>
        <Link href="/room-xo" className="btn-outline mt-8 border-bone-100/30 hover:border-crimson-bright hover:text-crimson-bright">
          Enter Room XO
        </Link>
      </div>
    </section>
  );
}
