"use client";

import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface InstagramCTAProps {
  url: string;
  handle?: string;
  outlet?: string;
  brand?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function InstagramCTA({ url, handle, outlet, brand, className, variant = "outline" }: InstagramCTAProps) {
  const style = variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : "btn-ghost";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(style, className)}
      onClick={() => analytics.instagramClick({ outlet, brand })}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
      {handle || "Follow on Instagram"}
    </a>
  );
}
