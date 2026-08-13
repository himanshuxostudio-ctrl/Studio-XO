"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredConsent, setStoredConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  if (!visible) return null;

  function choose(value: "accepted" | "declined") {
    setStoredConsent(value);
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-16 z-50 border-t border-bone-300/15 bg-ink-950/98 px-5 py-4 backdrop-blur-md sm:bottom-0 sm:px-8"
    >
      <div className="container-xo flex flex-col items-start gap-3 !px-0 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-bone-300/80 sm:max-w-xl">
          We use cookies for essential site function and, where enabled, analytics. See our{" "}
          <Link href="/cookies" className="text-gold-bright underline underline-offset-2">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose("declined")} className="btn-outline px-4 py-2 text-xs">
            Decline
          </button>
          <button type="button" onClick={() => choose("accepted")} className="btn-primary px-4 py-2 text-xs">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
