"use client";

import { analytics } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface WhatsAppCTAProps {
  number: string;
  message: string;
  label?: string;
  context: string;
  outlet?: string;
  city?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function WhatsAppCTA({
  number,
  message,
  label = "WhatsApp",
  context,
  outlet,
  city,
  className,
  variant = "primary",
}: WhatsAppCTAProps) {
  const url = buildWhatsAppUrl(number, message);
  const style = variant === "primary" ? "btn-whatsapp" : variant === "outline" ? "btn-outline" : "btn-ghost";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(style, className)}
      onClick={() => analytics.whatsappClick({ outlet, city, context })}
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.87 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.85 1h.01a7.94 7.94 0 0 0 5.54-13.58ZM12.06 18.4h-.01a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1 1 12.24-3.51 6.55 6.55 0 0 1-6.64 6.6Zm3.6-4.94c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.5.64-.62.77-.23.15-.43.05a5.4 5.4 0 0 1-1.59-.98 5.96 5.96 0 0 1-1.1-1.37c-.11-.2 0-.3.09-.4s.2-.23.29-.35a1.3 1.3 0 0 0 .2-.33.36.36 0 0 0 0-.35c-.05-.1-.44-1.06-.6-1.45s-.32-.33-.44-.33h-.38a.72.72 0 0 0-.53.25 2.2 2.2 0 0 0-.68 1.63c0 .96.7 1.89.8 2.02s1.37 2.1 3.32 2.94a11.2 11.2 0 0 0 1.11.41 2.68 2.68 0 0 0 1.23.08 2.02 2.02 0 0 0 1.32-.93 1.63 1.63 0 0 0 .12-.93c-.05-.09-.19-.14-.39-.24Z" />
      </svg>
      {label}
    </a>
  );
}
