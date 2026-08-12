"use client";

import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface DirectionsCTAProps {
  mapsUrl: string;
  label?: string;
  outlet?: string;
  city?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function DirectionsCTA({ mapsUrl, label = "Get Directions", outlet, city, className, variant = "outline" }: DirectionsCTAProps) {
  const style = variant === "primary" ? "btn-primary" : variant === "outline" ? "btn-outline" : "btn-ghost";

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(style, className)}
      onClick={() => analytics.directionsClick({ outlet, city })}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {label}
    </a>
  );
}
