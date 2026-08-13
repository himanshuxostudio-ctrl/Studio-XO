import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getSettings } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "How Studio XO uses cookies and similar technologies on this website.",
  path: "/cookies",
  noIndex: true,
});

export default async function CookiesPage() {
  const settings = await getSettings();
  return (
    <div className="pt-16 sm:pt-20">
      <Breadcrumbs items={[{ name: "Cookie Policy", url: "/cookies" }]} />
      <div className="container-xo max-w-3xl space-y-8 pb-24 text-bone-200/85">
        <div>
          <h1 className="text-display-2 mb-2">Cookie Policy</h1>
          <p className="text-sm text-bone-400">Last updated: [DD Month YYYY — update on publish]</p>
        </div>

        <p>This website may use cookies and similar technologies to operate correctly and to understand how it&rsquo;s used.</p>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Types of Cookies We May Use</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><span className="text-bone-100">Essential cookies</span> — required for core site functionality.</li>
            <li><span className="text-bone-100">Analytics cookies</span> — Google Analytics 4 and Google Tag Manager, used to understand site usage (only active where configured via environment variables).</li>
            <li><span className="text-bone-100">Advertising cookies</span> — Meta Pixel and Google Ads, used to measure campaign performance (only active where configured).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Managing Cookies</h2>
          <p>You can control or disable cookies through your browser settings. Disabling cookies may affect some website functionality.</p>
        </section>

        <section>
          <h2 className="font-display text-xl text-bone-100 mb-3">Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a href={`mailto:${settings.generalEmail}`} className="text-gold-bright underline">
              {settings.generalEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
