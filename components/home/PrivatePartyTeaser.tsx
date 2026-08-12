import Link from "next/link";
import { Frame } from "@/components/shared/Frame";

export function PrivatePartyTeaser() {
  return (
    <section className="relative overflow-hidden border-t border-bone-300/10">
      <Frame
        image={{ src: "/placeholder/private-party", alt: "A private celebration set up at a Studio XO table" }}
        className="absolute inset-0 h-full w-full"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-ink-950/70" />
      <div className="container-xo relative z-10 py-24 sm:py-32">
        <div className="max-w-xl">
          <p className="eyebrow">Private Parties</p>
          <h2 className="text-display-2 mt-3 text-balance">Make it your night.</h2>
          <p className="mt-5 text-bone-200/85">
            Birthdays, corporate nights, bachelor parties, brand launches — our private events team builds the room
            around your guest list, not the other way around.
          </p>
          <Link href="/private-parties" className="btn-primary mt-8">
            Plan Your Party
          </Link>
        </div>
      </div>
    </section>
  );
}
