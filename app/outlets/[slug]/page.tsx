import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOutlets, getOutletBySlug, getEventsForOutlet } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { localBusinessSchema } from "@/lib/schema";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { OutletHero } from "@/components/outlets/OutletHero";
import { EventGrid } from "@/components/events/EventGrid";
import { Gallery } from "@/components/shared/Gallery";
import { FAQ } from "@/components/shared/FAQ";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { DirectionsCTA } from "@/components/shared/DirectionsCTA";
import { InstagramCTA } from "@/components/shared/InstagramCTA";
import { generalEnquiryMessage } from "@/lib/whatsapp";

interface OutletPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const outlets = await getOutlets();
  return outlets.filter((o) => o.brand === "studio-xo").map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params: paramsPromise }: OutletPageProps): Promise<Metadata> {
  const params = await paramsPromise;
  const outlet = await getOutletBySlug(params.slug);
  if (!outlet) return buildMetadata({ title: "Outlet Not Found", description: "This outlet could not be found.", path: `/outlets/${params.slug}`, noIndex: true });

  return buildMetadata({
    title: outlet.seoTitle,
    description: outlet.seoDescription,
    path: `/outlets/${outlet.slug}`,
    image: outlet.heroImage.src.startsWith("/placeholder") ? undefined : outlet.heroImage.src,
  });
}

export default async function OutletPage({ params: paramsPromise }: OutletPageProps) {
  const params = await paramsPromise;
  const outlet = await getOutletBySlug(params.slug);
  if (!outlet) notFound();
  if (outlet.brand === "room-xo") redirect("/room-xo");

  const events = await getEventsForOutlet(outlet.slug);

  return (
    <div>
      <JsonLd data={localBusinessSchema(outlet)} />
      <Breadcrumbs items={[{ name: "Outlets", url: "/outlets" }, { name: outlet.name, url: `/outlets/${outlet.slug}` }]} />
      <OutletHero outlet={outlet} />

      <section className="container-xo py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 text-bone-200/85">
            {outlet.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            <p className="pt-4 text-sm leading-relaxed text-bone-300/70">{outlet.localSeoIntro}</p>
          </div>

          <aside className="card-surface space-y-4 p-6">
            <p className="eyebrow">Contact & Location</p>
            {outlet.address && (
              <div>
                <p className="text-sm text-bone-200">{outlet.address}</p>
                {outlet.addressNote && <p className="mt-1 text-xs text-bone-400">{outlet.addressNote}</p>}
              </div>
            )}
            <div className="flex flex-col gap-2 text-sm">
              {outlet.phones.map((phone) => (
                <a key={phone} href={`tel:+91${phone}`} className="text-bone-200 hover:text-gold-bright">
                  +91 {phone}
                </a>
              ))}
              {outlet.emails.map((email) => (
                <a key={email} href={`mailto:${email}`} className="text-bone-200 hover:text-gold-bright break-all">
                  {email}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <DirectionsCTA mapsUrl={outlet.googleMapsUrl} outlet={outlet.name} city={outlet.city} className="w-full" />
              <InstagramCTA url={outlet.instagramUrl} handle={outlet.instagramHandle} outlet={outlet.name} brand={outlet.brand} className="w-full" />
              <WhatsAppCTA
                number={outlet.whatsappNumber}
                message={generalEnquiryMessage(outlet.name)}
                context="outlet-sidebar"
                outlet={outlet.name}
                city={outlet.city}
                className="w-full"
              />
            </div>
          </aside>
        </div>
      </section>

      {outlet.status === "operational" && (
        <section id="events" className="container-xo py-16 sm:py-20 scroll-mt-24">
          <h2 className="text-display-3 mb-8">Upcoming at {outlet.name}</h2>
          <EventGrid
            events={events}
            outlets={[outlet]}
            emptyTitle="No upcoming events right now"
            emptyDescription="Follow us on Instagram for the next announcement, or reach out to plan a private night."
          />
        </section>
      )}

      {outlet.gallery.length > 0 && <Gallery images={outlet.gallery} title="Inside the Room" />}

      {outlet.faqs && outlet.faqs.length > 0 && <FAQ items={outlet.faqs} />}

      <section className="container-xo pb-20 pt-4">
        <div className="card-surface flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl text-bone-100">Planning something bigger?</p>
            <p className="mt-1 text-sm text-bone-300/70">Private parties and buyouts at {outlet.name}.</p>
          </div>
          <a href="/private-parties" className="btn-outline shrink-0">
            Private Parties
          </a>
        </div>
      </section>
    </div>
  );
}
