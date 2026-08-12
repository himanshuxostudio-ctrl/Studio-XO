"use client";

import { useRouter } from "next/navigation";
import type { Outlet } from "@/lib/types";
import { analytics } from "@/lib/analytics";

export function LocationSelector({ outlets }: { outlets: Outlet[] }) {
  const router = useRouter();

  return (
    <div>
      <label htmlFor="location-select" className="mb-2 block text-xs uppercase tracking-widest2 text-bone-300/70">
        Find your city
      </label>
      <div className="flex border border-bone-100/25 bg-ink-950/50 backdrop-blur-sm">
        <select
          id="location-select"
          defaultValue=""
          className="flex-1 bg-transparent px-4 py-3.5 text-sm text-bone-100 focus:outline-none"
          onChange={(e) => {
            const outlet = outlets.find((o) => o.slug === e.target.value);
            if (!outlet) return;
            analytics.locationSelect({ outlet: outlet.name, city: outlet.city });
            router.push(`/outlets/${outlet.slug}`);
          }}
        >
          <option value="" disabled>
            Choose a city
          </option>
          {outlets.map((outlet) => (
            <option key={outlet.slug} value={outlet.slug}>
              {outlet.city} — {outlet.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
