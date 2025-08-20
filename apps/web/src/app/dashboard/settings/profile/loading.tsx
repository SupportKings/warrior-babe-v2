import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import ProfileHeader from "@/features/profile/components/layout/profile-header";

export default function ProfilePageLoading() {
  return (
    <MainLayout headers={[<ProfileHeader key="profile-header" />]}>
      <div className="max-w-2xl space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>

          <div className="pt-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
