import { getOutlets, getSettings } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContactForm } from "@/components/forms/ContactForm";
import { ContactOutletList } from "@/components/outlets/ContactOutletList";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Contact Studio XO or Room XO — call, WhatsApp or email any of our 9 outlets directly, or send us a general enquiry.",
  path: "/contact",
});

interface ContactPageProps {
  searchParams: Promise<{ outlet?: string }>;
}

export default async function ContactPage({ searchParams: searchParamsPromise }: ContactPageProps) {
  const [outlets, settings, searchParams] = await Promise.all([getOutlets(), getSettings(), searchParamsPromise]);

  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "Contact", url: "/contact" }]} />

      <section className="container-xo pb-16">
        <p className="eyebrow">Get in Touch</p>
        <h1 className="text-display-2 mt-2">Contact</h1>
        <p className="mt-4 max-w-xl text-bone-300/70">
          Reach any outlet directly, or send a general enquiry below and we&rsquo;ll route it to the right city.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <WhatsAppCTA number={settings.generalWhatsappNumber} message={generalEnquiryMessage()} context="contact-page-header" />
          <a href={`mailto:${settings.generalEmail}`} className="btn-outline">
            {settings.generalEmail}
          </a>
        </div>
      </section>

      <section className="container-xo pb-20">
        <ContactOutletList outlets={outlets} />
      </section>

      <section className="border-t border-bone-300/10 bg-ink-900/40">
        <div className="container-xo py-20 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow text-center">General Enquiry</p>
            <h2 className="text-display-3 mt-2 mb-10 text-center">Send a Message</h2>
            <ContactForm outlets={outlets} defaultOutletSlug={searchParams.outlet} />
          </div>
        </div>
      </section>
    </div>
  );
}
