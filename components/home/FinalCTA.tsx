import Link from "next/link";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { generalEnquiryMessage } from "@/lib/whatsapp";
import { GENERAL_WHATSAPP_NUMBER } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="border-t border-bone-300/10">
      <div className="container-xo py-24 text-center sm:py-32">
        <h2 className="text-display-2 text-balance">Your next night starts here.</h2>
        <p className="mx-auto mt-5 max-w-md text-bone-300/70">
          Pick your city, find the event, or just tell us what you&rsquo;re planning — we&rsquo;ll take it from there.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/reserve" className="btn-primary">
            Book a Table
          </Link>
          <WhatsAppCTA number={GENERAL_WHATSAPP_NUMBER} message={generalEnquiryMessage()} context="homepage-final-cta" />
        </div>
      </div>
    </section>
  );
}
