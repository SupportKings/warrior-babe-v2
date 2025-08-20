import { Suspense } from "react";

import { redirect } from "next/navigation";

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

import CoachesHeader from "@/features/coaches/layout/coaches-header";
import { coachQueries } from "@/features/coaches/queries/coaches";
import { systemSettingsQueries } from "@/features/system-settings/queries/system-settings";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import CoachesClient from "./coaches-client";
import CoachesLoading from "./loading";

export default function CoachesPage() {
  return (
    <Suspense fallback={<CoachesLoading />}>
      <CoachesPageAsync />
    </Suspense>
  );
}

async function CoachesPageAsync() {
  const queryClient = new QueryClient();

  // Get user session first to determine which queries to prefetch
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  // Get the user's role from the session
  const userRole = session.user.role || "user";

  // Set up team filter for premier coaches
  const teamFilter = userRole === "premiereCoach" 
    ? { premiereCoachId: session.user.id } 
    : undefined;

  // Prefetch all queries with appropriate filters
  await Promise.all([
    // Dashboard overview queries
    queryClient.prefetchQuery(coachQueries.metrics(teamFilter)),
    queryClient.prefetchQuery(coachQueries.topPerformers(teamFilter)),
    queryClient.prefetchQuery(coachQueries.workloadDistribution(teamFilter)),
    // Renewal rate queries
    queryClient.prefetchQuery(coachQueries.renewalRateRankings(teamFilter)),
    queryClient.prefetchQuery(coachQueries.overallRenewalRate(teamFilter)),
    // Table queries
    queryClient.prefetchQuery(coachQueries.allCoaches(undefined, teamFilter)),
    queryClient.prefetchQuery(coachQueries.faceted.types()),
    queryClient.prefetchQuery(coachQueries.faceted.specializations()),
    queryClient.prefetchQuery(coachQueries.faceted.certifications()),
    queryClient.prefetchQuery(coachQueries.faceted.clientCounts()),
    // Available coaches query (no exclusions for main page)
    queryClient.prefetchQuery(coachQueries.availableCoaches()),
    // System settings for global defaults
    queryClient.prefetchQuery(systemSettingsQueries.multiple(["global_default_client_units_per_coach"])),
  ]);

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

  const rawRolePermissions =
    rolePermissions[userRole as keyof typeof rolePermissions] || user;

  // Extract only the statements data (not the functions) for client component
  const permissionStatements = rawRolePermissions.statements;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <CoachesHeader
            key="coaches-header"
            permissions={permissionStatements}
          />,
        ]}
      >
        <CoachesClient
          permissions={permissionStatements}
          userId={session.user.id}
          userRole={userRole}
        />
      </MainLayout>
    </HydrationBoundary>
  );
}
