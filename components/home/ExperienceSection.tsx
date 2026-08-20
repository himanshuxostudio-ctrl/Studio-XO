import { Frame } from "@/components/shared/Frame";

const PILLARS = [
  { title: "Live Music", copy: "Artists on stage most weekends — from breakout acts to names you already know." },
  { title: "Food & Cocktails", copy: "A full kitchen and bar built to keep pace with the night, not just open it." },
  { title: "Comedy & Sufi Nights", copy: "Rooms that shift tone through the week — stand-up one night, Sufi the next." },
  { title: "Celebrations", copy: "Birthdays, reunions, send-offs — tables built for groups who came to make a night of it." },
];

export function ExperienceSection() {
  return (
    <section className="container-xo py-20 sm:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow">The Studio XO Experience</p>
          <h2 className="text-display-3 mt-2 text-balance">Live entertainment first. Everything else follows.</h2>
          <p className="mt-6 max-w-lg text-bone-300/80">
            Studio XO isn&rsquo;t a club with a stage bolted on — it&rsquo;s built around the stage. Music, food and drinks share
            the room, and the calendar changes constantly: artists one night, comedy the next, a Sufi set after that.
          </p>

          <dl className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="border-t border-bone-300/15 pt-4">
                <dt className="font-display text-lg text-bone-100">{pillar.title}</dt>
                <dd className="mt-2 text-sm text-bone-300/70">{pillar.copy}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Frame
          image={{ src: "/images/outlets/noida/hero.jpg", alt: "Live performance at Studio XO Noida with the crowd close to the stage" }}
          className="aspect-[4/5] lg:aspect-auto"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </section>
  );
}
