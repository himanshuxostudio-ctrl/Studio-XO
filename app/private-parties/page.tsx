import Link from "next/link";
import { getOutletsByBrand } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Frame } from "@/components/shared/Frame";
import { Gallery } from "@/components/shared/Gallery";
import { PrivatePartyForm } from "@/components/forms/PrivatePartyForm";

export const metadata = buildMetadata({
  title: "Private Parties — Birthdays, Corporate Events & Celebrations",
  description: "Plan your private party at Studio XO — birthdays, corporate events, bachelor parties, brand launches and group celebrations across 9 cities.",
  path: "/private-parties",
});

const REASONS = [
  { title: "Live Entertainment", copy: "Bring in a live act, a DJ, or keep it acoustic — the room adapts to your night." },
  { title: "Full Dining & Bar", copy: "Custom menus, curated cocktails, and a kitchen that scales from 20 guests to 200." },
  { title: "Dedicated Team", copy: "One point of contact from enquiry to the last song, across every outlet." },
  { title: "Space That Flexes", copy: "Semi-private sections to full buyouts, depending on the outlet and your guest count." },
];

const OCCASIONS = [
  "Birthdays",
  "Corporate Events",
  "Bachelor/Bachelorette",
  "College Events",
  "Brand Launches",
  "Reunions & Send-offs",
];

export default async function PrivatePartiesPage() {
  const outlets = await getOutletsByBrand("studio-xo");

  return (
    <div>
      <section className="relative flex min-h-[70vh] items-end overflow-hidden pt-16 sm:pt-20">
        <Frame image={{ src: "/placeholder/private-parties-hero", alt: "A private celebration in progress at Studio XO" }} className="absolute inset-0 h-full w-full" priority sizes="100vw" />
        <div className="absolute inset-0 bg-grain-fade" />
        <div className="container-xo relative z-10 pb-16">
          <p className="eyebrow">Private Parties</p>
          <h1 className="text-display-1 mt-4 max-w-3xl text-balance">Make it your night.</h1>
          <p className="mt-5 max-w-lg text-bone-200/85">
            From an intimate birthday table to a full venue buyout — our private events team builds the night around
            your guest list.
          </p>
          <a href="#enquiry" className="btn-primary mt-8 inline-flex">
            Start Planning
          </a>
        </div>
      </section>

      <section className="container-xo py-20 sm:py-28">
        <p className="eyebrow">Why XO</p>
        <h2 className="text-display-3 mt-2 max-w-2xl text-balance">Everything a great night needs, under one roof.</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div key={reason.title} className="border-t border-bone-300/15 pt-4">
              <p className="font-display text-lg text-bone-100">{reason.title}</p>
              <p className="mt-2 text-sm text-bone-300/70">{reason.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-bone-300/10 bg-ink-900/40">
        <div className="container-xo py-20 sm:py-28">
          <p className="eyebrow">What We Host</p>
          <h2 className="text-display-3 mt-2 mb-10 max-w-2xl text-balance">Built for every kind of celebration.</h2>
          <div className="flex flex-wrap gap-3">
            {OCCASIONS.map((occasion) => (
              <span key={occasion} className="border border-bone-300/20 px-4 py-2 text-sm text-bone-200">
                {occasion}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Gallery
        title="From Past Nights"
        images={[
          { src: "/placeholder/pp-gallery-1", alt: "Guests celebrating a birthday at a Studio XO table" },
          { src: "/placeholder/pp-gallery-2", alt: "A private group enjoying a live set" },
          { src: "/placeholder/pp-gallery-3", alt: "Cocktails being served at a private event" },
        ]}
      />

      <section id="enquiry" className="container-xo py-20 sm:py-28 scroll-mt-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-center">Plan Your Party</p>
          <h2 className="text-display-3 mt-2 mb-10 text-center text-balance">Tell us about your night.</h2>
          <PrivatePartyForm outlets={outlets} />
        </div>
      </section>

      <section className="border-t border-bone-300/10">
        <div className="container-xo py-20 text-center sm:py-24">
          <h2 className="text-display-3 text-balance">Prefer to talk it through?</h2>
          <p className="mt-4 text-bone-300/70">Reach out to your city&rsquo;s outlet directly — see all contact details on the Outlets page.</p>
          <Link href="/outlets" className="btn-outline mt-8 inline-flex">
            Find Your Outlet
          </Link>
        </div>
      </section>
    </div>
  );
}
