import { GridSkeleton } from "@/components/shared/Skeleton";

export default function OutletsLoading() {
  return (
    <div className="container-xo pt-32 pb-24 sm:pt-40">
      <GridSkeleton count={9} />
    </div>
  );
}
