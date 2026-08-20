import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Frame } from "@/components/shared/Frame";
import { Reveal } from "@/components/shared/Reveal";

export const metadata = buildMetadata({
  title: "About XO",
  description: "Studio XO is built around music, food, artists and the people who show up for them. Here's the story of the XO ecosystem, and Room XO.",
  path: "/about",
});

const PILLARS = [
  { title: "Music", copy: "The reason the room exists. Live artists, DJs, and a calendar that never repeats the same week twice." },
  { title: "People", copy: "Regulars, first-timers, birthday tables, and everyone in between — the room only works because they show up." },
  { title: "Food & Drink", copy: "A kitchen and bar that keep pace with the night instead of just filling time before it." },
  { title: "Artists", copy: "From breakout names to touring acts, the stage is never an afterthought." },
];

export default function AboutPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "About XO", url: "/about" }]} />

      <section className="container-xo pb-16">
        <p className="eyebrow">About XO</p>
        <h1 className="text-display-2 mt-2 max-w-3xl text-balance">Built around the night, not around a formula.</h1>
        <p className="mt-6 max-w-2xl text-lg text-bone-200/85">
          Studio XO started as a simple idea — put live music, real food and a proper bar in the same room, and let
          the night take care of itself. Nine cities later, that&rsquo;s still the whole plan.
        </p>
      </section>

      <Frame image={{ src: "/images/about/about-hero-wide.jpg", alt: "A grand Studio XO dining hall beneath a statement chandelier" }} className="aspect-[16/9] w-full" sizes="100vw" />

      <section className="container-xo py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 80} className="border-t border-bone-300/15 pt-4">
              <p className="font-display text-xl text-bone-100">{pillar.title}</p>
              <p className="mt-2 text-sm text-bone-300/70">{pillar.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-bone-300/10 bg-ink-900/40">
        <div className="container-xo grid grid-cols-1 gap-10 py-20 sm:py-28 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Two Rooms, One Ecosystem</p>
            <h2 className="text-display-3 mt-3 text-balance">Studio XO and Room XO aren&rsquo;t the same thing.</h2>
          </div>
          <div className="space-y-4 text-bone-200/85">
            <p>
              Studio XO is live entertainment first — artists, comedy, Sufi nights, dining and celebrations.
              It&rsquo;s built for people who want dinner, a show, and a night out without switching venues.
            </p>
            <p>
              Room XO is the techno floor — electronic music, DJs, and a later, darker energy. Same family, different
              night entirely.
            </p>
          </div>
        </div>
      </section>

      <section className="container-xo py-20 text-center sm:py-28">
        <h2 className="text-display-3 text-balance">Nine cities. One calendar that never stops moving.</h2>
        <p className="mx-auto mt-4 max-w-md text-bone-300/70">Gurgaon, Noida, Hyderabad, Meerut, Mohali, Panipat, Dehradun, Kanpur and Indore.</p>
        <Link href="/outlets" className="btn-primary mt-8 inline-flex">
          Find Your City
        </Link>
      </section>
    </div>
  );
}
