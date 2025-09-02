import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";

import { getUser } from "@/queries/getUser";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getActivityPeriod } from "@/features/client_activity_period/actions/getActivityPeriod";
import ActivityPeriodDetailSkeleton from "@/features/client_activity_period/components/activity-period.detail.skeleton";
import ActivityPeriodDetailHeader from "@/features/client_activity_period/layout/activity-period.detail.header";
import ActivityPeriodDetailView from "@/features/client_activity_period/components/activity-period.detail.view";

interface ActivityPeriodDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ActivityPeriodDetailPage({
  params,
}: ActivityPeriodDetailPageProps) {
  return (
    <Suspense fallback={<ActivityPeriodDetailSkeleton activityPeriodId="" />}>
      <ActivityPeriodDetailPageAsync params={params} />
    </Suspense>
  );
}

async function ActivityPeriodDetailPageAsync({
  params,
}: ActivityPeriodDetailPageProps) {
  const { id } = await params;

  // Validate that id is provided
  if (!id) {
    notFound();
  }

  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  // Prefetch the activity period data
  await queryClient.prefetchQuery({
    queryKey: ["activity-periods", "detail", id],
    queryFn: () => getActivityPeriod(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <ActivityPeriodDetailHeader
            key="activity-period-detail-header"
            activityPeriodId={id}
          />,
        ]}
      >
        <ActivityPeriodDetailView activityPeriodId={id} />
      </MainLayout>
    </HydrationBoundary>
  );
}
