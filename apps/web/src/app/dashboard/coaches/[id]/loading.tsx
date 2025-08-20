import { coach } from "@/lib/permissions";

import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import CoachProfileHeader from "@/features/coaches/layout/coach-profile-header";

export default function CoachProfileLoading() {
  return (
    <MainLayout
      headers={[
        <CoachProfileHeader
          key="coach-profile-header"
          coach={coach as any}
          permissions={[]}
        />,
      ]}
      className="flex h-full flex-col"
    >
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
