"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { generalEnquiryMessage } from "@/lib/whatsapp";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";

const HIDDEN_PREFIXES = ["/admin", "/reserve"];

export function StickyMobileCTA({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-bone-300/10 bg-ink-950/95 p-3 backdrop-blur-md lg:hidden">
      <Link href="/reserve" className="btn-primary flex-1">
        Book a Table
      </Link>
      <WhatsAppCTA
        number={whatsappNumber}
        message={generalEnquiryMessage()}
        context="sticky-mobile-cta"
        label="WhatsApp"
        className="flex-1"
      />
    </div>
  );
}
