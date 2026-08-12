import Link from "next/link";
import { getOutletsByBrand } from "@/lib/db";
import { OutletCard } from "@/components/outlets/OutletCard";

export async function LocationChooser() {
  const outlets = await getOutletsByBrand("studio-xo");

  return (
    <section className="border-t border-bone-300/10 bg-ink-900/40">
      <div className="container-xo py-20 sm:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Choose Your XO</p>
            <h2 className="text-display-3 mt-2">Nine cities, one calendar.</h2>
          </div>
          <Link href="/outlets" className="text-xs font-semibold uppercase tracking-widest2 text-gold-bright hover:underline">
            View all outlets →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {outlets.map((outlet) => (
            <OutletCard key={outlet.slug} outlet={outlet} />
          ))}
        </div>
      </div>
    </section>
  );
}
