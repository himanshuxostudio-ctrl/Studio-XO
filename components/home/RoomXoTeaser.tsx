import Link from "next/link";
import { getOutletBySlug } from "@/lib/db";
import { Frame } from "@/components/shared/Frame";

export async function RoomXoTeaser() {
  const roomXo = await getOutletBySlug("room-xo");

  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0 opacity-60">
        <Frame image={{ src: "/placeholder/room-xo-teaser", alt: "Room XO — dark, minimal techno floor" }} className="h-full w-full" sizes="100vw" />
      </div>
      <div className="container-xo relative z-10 py-24 sm:py-32">
        <p className="text-xs font-semibold uppercase tracking-widest2 text-bone-400">A Different Room</p>
        <h2 className="mt-3 font-display text-display-2 text-bone-100">
          ROOM <span className="italic text-[#9aa3ff]">XO</span>
        </h2>
        <p className="mt-5 max-w-lg text-bone-300/80">
          Techno. Electronic. Underground-leaning. Room XO is the late-night floor of the XO ecosystem — a separate
          sound, a separate crowd, {roomXo ? `in ${roomXo.city}` : "coming to more cities"}.
        </p>
        <Link href="/room-xo" className="btn-outline mt-8 border-bone-100/30 hover:border-[#9aa3ff] hover:text-[#9aa3ff]">
          Enter Room XO
        </Link>
      </div>
    </section>
  );
}
