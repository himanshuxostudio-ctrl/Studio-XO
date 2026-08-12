import type { Outlet } from "@/lib/types";
import { OutletCard } from "./OutletCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function OutletGrid({ outlets, emptyTitle = "No outlets found" }: { outlets: Outlet[]; emptyTitle?: string }) {
  if (!outlets.length) return <EmptyState title={emptyTitle} />;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {outlets.map((outlet) => (
        <OutletCard key={outlet.slug} outlet={outlet} />
      ))}
    </div>
  );
}
