import { getOutletsByBrand } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { OutletGrid } from "@/components/outlets/OutletGrid";
import type { OutletStatus } from "@/lib/types";

export const metadata = buildMetadata({
  title: "Outlets — Studio XO Across India",
  description: "Find your nearest Studio XO — live music, dining and nightlife across Gurgaon, Noida, Hyderabad, Meerut, Mohali, Panipat, Dehradun, Kanpur and Indore.",
  path: "/outlets",
});

const STATUS_ORDER: OutletStatus[] = ["operational", "reopening-soon", "renovation", "temporarily-closed"];

export default async function OutletsPage() {
  const outlets = await getOutletsByBrand("studio-xo");
  const sorted = [...outlets].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "Outlets", url: "/outlets" }]} />

      <div className="container-xo pb-12">
        <p className="eyebrow">Find Your City</p>
        <h1 className="text-display-2 mt-2">Outlets</h1>
        <p className="mt-4 max-w-xl text-bone-300/70">
          Nine cities, each with its own Studio XO — live music, dining and nightlife. Pick yours to see what&rsquo;s
          on, book a table, or get directions.
        </p>
      </div>

      <div className="container-xo pb-24">
        <OutletGrid outlets={sorted} />
      </div>
    </div>
  );
}
