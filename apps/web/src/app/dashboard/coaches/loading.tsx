import { Skeleton } from "@/components/ui/skeleton";

export default function CoachesLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* KPI Boxes Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Performance Section Skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border">
        <div className="p-4">
          <Skeleton className="h-9 w-[300px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}
