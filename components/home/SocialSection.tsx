import { getOutlets } from "@/lib/db";
import { InstagramCTA } from "@/components/shared/InstagramCTA";

export async function SocialSection() {
  const outlets = await getOutlets();

  return (
    <section className="container-xo py-20 sm:py-28">
      <div className="text-center">
        <p className="eyebrow">Follow XO</p>
        <h2 className="text-display-3 mt-2">Every city, one feed of nights.</h2>
        <p className="mx-auto mt-4 max-w-lg text-bone-300/70">
          Follow your city&rsquo;s outlet for lineup drops, reels from the floor and reopening updates.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {outlets.map((outlet) => (
          <InstagramCTA
            key={outlet.slug}
            url={outlet.instagramUrl}
            handle={outlet.city}
            outlet={outlet.name}
            brand={outlet.brand}
            className="w-full justify-center"
            variant="ghost"
          />
        ))}
      </div>
    </section>
  );
}
