"use client";

import Link from "next/link";
import { NAV_LINKS, GENERAL_WHATSAPP_NUMBER } from "@/lib/constants";
import { generalEnquiryMessage } from "@/lib/whatsapp";
import { WhatsAppCTA } from "@/components/shared/WhatsAppCTA";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 bottom-0 z-40 bg-ink-950 transition-opacity duration-300 ease-editorial lg:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <nav className="container-xo flex h-full flex-col justify-between py-8" aria-label="Mobile">
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block border-b border-bone-300/10 py-4 font-display text-3xl text-bone-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 pt-8">
          <Link href="/reserve" onClick={onClose} className="btn-primary w-full">
            Book a Table
          </Link>
          <WhatsAppCTA
            number={GENERAL_WHATSAPP_NUMBER}
            message={generalEnquiryMessage()}
            context="mobile-nav"
            className="w-full"
            variant="outline"
          />
        </div>
      </nav>
    </div>
  );
}
