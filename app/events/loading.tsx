import { GridSkeleton } from "@/components/shared/Skeleton";

export default function EventsLoading() {
  return (
    <div className="container-xo pt-32 pb-24 sm:pt-40">
      <GridSkeleton count={6} />
    </div>
  );
}
