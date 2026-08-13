import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getSettings } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Studio XO collects, uses and protects your personal information.",
  path: "/privacy",
  noIndex: true,
});

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "Privacy Policy", url: "/privacy" }]} />
      <div className="container-xo max-w-3xl space-y-8 pb-24 text-bone-200/85">
        <div>
          <h1 className="text-display-2 mb-2">Privacy Policy</h1>
          <p className="text-sm text-bone-400">Last updated: [DD Month YYYY — update on publish]</p>
        </div>

        <p>
          This Privacy Policy explains how Studio XO (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), operating outlets under the Studio XO and
          Room XO brands, collects, uses and protects information when you use this website or contact us through
          it.
        </p>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Information We Collect</h2>
          <p>When you use this website, we may collect:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Information you submit through forms — name, phone number, email address, event/outlet preferences, guest count and message content, for table reservations, private party enquiries and general contact.</li>
            <li>Usage data collected automatically via analytics tools (see our <a href="/cookies" className="text-gold-bright underline">Cookie Policy</a>), such as pages visited, referring source, device type and approximate location.</li>
            <li>Any information you choose to share with us directly over WhatsApp, phone or email.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>To respond to reservation requests, private party enquiries and general questions.</li>
            <li>To operate, secure and improve this website.</li>
            <li>To measure marketing performance across channels including Google and Meta advertising, where enabled.</li>
            <li>To comply with legal obligations where applicable.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Sharing of Information</h2>
          <p>
            We do not sell your personal information. Enquiry details you submit are shared only with the relevant
            Studio XO / Room XO outlet team to action your request, and with service providers who help us operate
            this website (such as hosting and analytics providers) under appropriate confidentiality obligations.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">WhatsApp & Third-Party Platforms</h2>
          <p>
            When you contact us via WhatsApp, ticketing platforms (such as BookMyShow, District or Skillboxes), or
            social platforms (such as Instagram), your interaction is also subject to that platform&rsquo;s own privacy
            policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Data Retention</h2>
          <p>We retain enquiry and reservation information for as long as reasonably necessary to fulfil your request and for legitimate business record-keeping, after which it may be deleted or anonymised.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal information by contacting us using the details below.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Contact Us</h2>
          <p>
            For privacy-related requests, write to us at{" "}
            <a href={`mailto:${settings.generalEmail}`} className="text-gold-bright underline">
              {settings.generalEmail}
            </a>
            . [Insert registered business name, address and grievance officer details if required for your jurisdiction.]
          </p>
        </section>
      </div>
    </div>
  );
}
