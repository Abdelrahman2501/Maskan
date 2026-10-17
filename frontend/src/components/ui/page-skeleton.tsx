import { Skeleton } from "./skeleton";

/** Placeholder for a detail page while its route params resolve (Suspense fallback). */
export function DetailPageSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}
