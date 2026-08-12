import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { GENERAL_EMAIL } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for using the Studio XO website and services.",
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "Terms & Conditions", url: "/terms" }]} />
      <div className="container-xo max-w-3xl space-y-8 pb-24 text-bone-200/85">
        <div>
          <h1 className="text-display-2 mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm text-bone-400">Last updated: [DD Month YYYY — update on publish]</p>
        </div>

        <p>
          These Terms &amp; Conditions govern your use of this website, operated on behalf of Studio XO and Room XO
          outlets. By using this website, you agree to these terms.
        </p>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Reservations & Enquiries</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Table reservation and private party requests submitted through this website are enquiries, not confirmed bookings, until the relevant outlet confirms via WhatsApp, call or email.</li>
            <li>Table reservations are subject to availability at the individual outlet. Please contact the outlet directly for current details, minimum spends or entry policies.</li>
            <li>Outlets may have their own entry, dress code or age-restriction policies communicated directly at the venue.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Events & Ticketing</h2>
          <p>
            Tickets for events are sold and fulfilled by third-party ticketing platforms (including BookMyShow,
            District and Skillboxes) where linked from this website. Ticketing terms, refund and cancellation
            policies are governed by that platform, not by this website.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Outlet Status</h2>
          <p>
            Outlet status (operational, under renovation, reopening soon) is updated as accurately as possible but
            may change without notice. Please confirm directly with the outlet before travelling.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Use of This Website</h2>
          <p>You agree not to misuse this website, including submitting false enquiry information, attempting to disrupt its operation, or scraping content without permission.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Intellectual Property</h2>
          <p>All content on this website, including brand names, logos and imagery, belongs to Studio XO / Room XO or their respective owners and may not be reproduced without permission.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Limitation of Liability</h2>
          <p>This website is provided &ldquo;as is.&rdquo; We are not liable for losses arising from reliance on information here that has since changed, or from third-party platforms linked from this site.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href={`mailto:${GENERAL_EMAIL}`} className="text-gold-bright underline">
              {GENERAL_EMAIL}
            </a>
            . [Insert registered business name and address if required for your jurisdiction.]
          </p>
        </section>
      </div>
    </div>
  );
}
