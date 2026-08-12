import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center border border-dashed border-bone-300/15 px-6 py-20 text-center", className)}>
      <p className="font-display text-2xl text-bone-100">{title}</p>
      {description && <p className="mt-3 max-w-md text-sm text-bone-300/70">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-outline mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
