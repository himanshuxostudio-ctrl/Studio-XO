"use client";

import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface PhoneCTAProps {
  number: string;
  label?: string;
  outlet?: string;
  city?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function PhoneCTA({ number, label, outlet, city, className, variant = "outline" }: PhoneCTAProps) {
  const style = variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : "btn-ghost";

  return (
    <a
      href={`tel:+${number}`}
      className={cn(style, className)}
      onClick={() => analytics.phoneClick({ outlet, city })}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
      </svg>
      {label || `Call ${number.startsWith("91") ? number.slice(2) : number}`}
    </a>
  );
}
