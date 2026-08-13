import Link from "next/link";
import type { Outlet } from "@/lib/types";
import { Frame } from "@/components/shared/Frame";
import { OUTLET_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OutletCard({ outlet }: { outlet: Outlet }) {
  return (
    <Link href={`/outlets/${outlet.slug}`} className="group block">
      <div className="relative overflow-hidden border border-transparent transition-colors duration-500 ease-editorial group-hover:border-gold-bright/30">
        <Frame image={outlet.heroImage} className="aspect-[4/5] transition-transform duration-500 ease-editorial group-hover:scale-[1.03]" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        <span
          className={cn(
            "absolute left-3 top-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm",
            outlet.status === "operational" && "bg-ink-950/80 text-gold-bright",
            outlet.status === "renovation" && "bg-signal-amber/90 text-ink-950",
            outlet.status === "reopening-soon" && "bg-bone-100/90 text-ink-950"
          )}
        >
          {OUTLET_STATUS_LABELS[outlet.status]}
        </span>
      </div>
      <div className="pt-3">
        <p className="eyebrow">{outlet.city}</p>
        <h3 className="mt-1 font-display text-xl text-bone-100 group-hover:text-gold-bright transition-colors">{outlet.name}</h3>
        <p className="mt-1 text-sm text-bone-300/70">{outlet.tagline}</p>
      </div>
    </Link>
  );
}
