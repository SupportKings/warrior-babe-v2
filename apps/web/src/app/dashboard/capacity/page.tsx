import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";

import MainLayout from "@/components/layout/main-layout";

import CapacityClient from "@/features/capacity/components/capacity-client";
import CapacityHeader from "@/features/capacity/layout/capacity-header";
import { capacityQueries } from "@/features/capacity/queries/capacity";
import { coachQueries } from "@/features/coaches/queries/coaches";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function CapacityPage() {
  const queryClient = new QueryClient();

  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  const userRole = session.user.role || "user";
  const userId = session.user.id;

  const rolePermissions = {
    admin,
    user,
    coach,
  };

  const rawRolePermissions =
    rolePermissions[userRole as keyof typeof rolePermissions] || user;

  const permissionStatements = rawRolePermissions.statements;

  // Set up team filter for premier coaches
  const teamFilter =
    userRole === "premiereCoach" ? { premiereCoachId: userId } : undefined;

  // Prefetch both capacity and coach data
  await Promise.all([
    // Keep capacity-specific queries for KPI boxes
    queryClient.prefetchQuery(capacityQueries.metrics(teamFilter)),
    queryClient.prefetchQuery(capacityQueries.globalSettings()),
    queryClient.prefetchQuery(capacityQueries.productDistribution()),
    queryClient.prefetchQuery(capacityQueries.products()),

    // Add coach queries for the advanced table
    queryClient.prefetchQuery(coachQueries.allCoaches([], teamFilter)),
    queryClient.prefetchQuery(coachQueries.faceted.types()),
    queryClient.prefetchQuery(coachQueries.faceted.specializations()),
    queryClient.prefetchQuery(coachQueries.faceted.clientCounts()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <CapacityHeader
            key="capacity-header"
            permissions={permissionStatements}
            userRole={userRole}
          />,
        ]}
      >
        <div className="space-y-6 p-6">
          <CapacityClient
            permissions={permissionStatements}
            userId={userId}
            userRole={userRole}
          />
        </div>
      </MainLayout>
    </HydrationBoundary>
  );
}
