"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Outlet } from "@/lib/types";
import { EVENT_CATEGORY_LABELS } from "@/lib/constants";
import { analytics } from "@/lib/analytics";

interface EventFiltersProps {
  outlets: Outlet[];
}

export function EventFilters({ outlets }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cities = Array.from(new Set(outlets.map((o) => o.city))).sort();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/events${params.toString() ? `?${params.toString()}` : ""}`);
    analytics.eventFilter({ city: params.get("city") || undefined, category: params.get("category") || undefined, month: params.get("month") || undefined });
  }

  const selectClass = "border border-bone-300/20 bg-ink-900 px-3.5 py-2.5 text-sm text-bone-100 focus:border-gold-bright";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Filter by city"
        value={searchParams.get("city") || ""}
        onChange={(e) => updateParam("city", e.target.value)}
        className={selectClass}
      >
        <option value="">All Cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by outlet"
        value={searchParams.get("outlet") || ""}
        onChange={(e) => updateParam("outlet", e.target.value)}
        className={selectClass}
      >
        <option value="">All Outlets</option>
        {outlets.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by event type"
        value={searchParams.get("category") || ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className={selectClass}
      >
        <option value="">All Event Types</option>
        {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <input
        type="month"
        aria-label="Filter by month"
        value={searchParams.get("month") || ""}
        onChange={(e) => updateParam("month", e.target.value)}
        className={selectClass}
      />

      {(searchParams.get("city") || searchParams.get("outlet") || searchParams.get("category") || searchParams.get("month")) && (
        <button type="button" onClick={() => router.push("/events")} className="text-xs font-semibold uppercase tracking-widest2 text-gold-bright">
          Clear filters
        </button>
      )}
    </div>
  );
}
