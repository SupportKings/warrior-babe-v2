import { Suspense } from "react";

import {
  admin,
  billingAdmin,
  coach,
  cpo,
  csc,
  csManager,
  csRep,
  finance,
  premiereCoach,
  salesRep,
  user,
} from "@/lib/permissions";

import MainLayout from "@/components/layout/main-layout";

import CoachProfileHeader from "@/features/coaches/layout/coach-profile-header";
import { coachQueries } from "@/features/coaches/queries/coaches";
import {
  getCoachClients,
  getCoachDetails,
  getCoachPerformanceHistory,
} from "@/features/coaches/queries/server-queries";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import CoachProfileClient from "./coach-profile-client";
import CoachProfileLoading from "./loading";

export default async function CoachPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<CoachProfileLoading />}>
      <CoachPageAsync coachId={id} />
    </Suspense>
  );
}

async function CoachPageAsync({ coachId }: { coachId: string }) {
  const queryClient = new QueryClient();

  // Get the user's role from the session

  // Map user's role to permissions
  const rolePermissions = {
    admin,
    user,
    coach,
    premiereCoach,
    cpo,
    csManager,
    csRep,
    csc,
    finance,
    billingAdmin,
    salesRep,
  };

  // Prefetch coach data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["coaches", "detail", coachId],
      queryFn: () => getCoachDetails(coachId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["coaches", "clients", coachId],
      queryFn: () => getCoachClients(coachId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["coaches", "performance-history", coachId],
      queryFn: () => getCoachPerformanceHistory(coachId),
    }),
    // Add the missing combined activity query
    queryClient.prefetchQuery(coachQueries.coachCombinedActivity(coachId)),
  ]);

  // Get coach data for header
  const coachData = queryClient.getQueryData(["coaches", "detail", coachId]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <CoachProfileHeader
            key="coach-profile-header"
            coach={coachData as any}
            permissions={[]}
          />,
        ]}
        disableScrollArea={true}
      >
        <CoachProfileClient coachId={coachId} />
      </MainLayout>
    </HydrationBoundary>
  );
}
