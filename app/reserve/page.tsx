import { getOutletsByBrand } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ReservationForm } from "@/components/forms/ReservationForm";

export const metadata = buildMetadata({
  title: "Book a Table",
  description: "Reserve a table at Studio XO — pick your outlet, date and party size, and we'll confirm over WhatsApp or a call.",
  path: "/reserve",
});

interface ReservePageProps {
  searchParams: Promise<{ outlet?: string; event?: string }>;
}

export default async function ReservePage({ searchParams: searchParamsPromise }: ReservePageProps) {
  const [outlets, searchParams] = await Promise.all([getOutletsByBrand("studio-xo"), searchParamsPromise]);

  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "Book a Table", url: "/reserve" }]} />

      <section className="container-xo pb-24">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow text-center">Reservations</p>
          <h1 className="text-display-2 mt-2 text-center">Book a Table</h1>
          <p className="mt-4 text-center text-bone-300/70">
            Tell us your city, date and party size — we&rsquo;ll confirm availability over WhatsApp or a call.
          </p>

          <div className="mt-12">
            <ReservationForm outlets={outlets} defaultOutletSlug={searchParams.outlet} defaultEventSlug={searchParams.event} />
          </div>
        </div>
      </section>
    </div>
  );
}
