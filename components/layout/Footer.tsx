import Link from "next/link";
import { getOutlets } from "@/lib/db";
import { NAV_LINKS, LEGAL_LINKS, INSTAGRAM_HANDLES } from "@/lib/constants";

export async function Footer() {
  const outlets = await getOutlets();
  const studioOutlets = outlets.filter((o) => o.brand === "studio-xo");

  return (
    <footer className="border-t border-bone-300/10 bg-ink-950">
      <div className="container-xo grid grid-cols-2 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="col-span-2 lg:col-span-1">
          <p className="font-display text-2xl tracking-[0.15em] text-bone-100">
            STUDIO <span className="text-gold-bright">XO</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone-300/70">
            Live entertainment, dining and nightlife across India. Music, food, artists and celebrations — all in one room.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href={INSTAGRAM_HANDLES["studio-xo"]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold uppercase tracking-widest2 text-bone-200 hover:text-gold-bright"
            >
              Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-bone-300/80 hover:text-gold-bright">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Outlets</p>
          <ul className="flex flex-col gap-3">
            {studioOutlets.map((outlet) => (
              <li key={outlet.slug}>
                <Link href={`/outlets/${outlet.slug}`} className="text-sm text-bone-300/80 hover:text-gold-bright">
                  {outlet.city}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Legal</p>
          <ul className="flex flex-col gap-3">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-bone-300/80 hover:text-gold-bright">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="text-sm text-bone-300/80 hover:text-gold-bright">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-xo flex flex-col gap-2 border-t border-bone-300/10 py-6 text-xs text-bone-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Studio XO. All rights reserved.</p>
        <p>Room XO is part of the Studio XO ecosystem.</p>
      </div>
    </footer>
  );
}
