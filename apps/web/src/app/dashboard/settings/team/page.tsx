import { Suspense } from "react";

import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";

import MainLayout from "@/components/layout/main-layout";

import TeamHeader from "@/features/team/layout/team-header";
import { getUsers } from "@/features/team/queries/getUsers";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import TeamSettingsLoading from "./loading";
import TeamClient from "./team-client";

export default function TeamPage() {
  return (
    <Suspense fallback={<TeamSettingsLoading />}>
      <TeamPageAsync />
    </Suspense>
  );
}

async function TeamPageAsync() {
  const queryClient = new QueryClient();

  // Parallelize data fetching
  const [session] = await Promise.all([
    getUser(),
    queryClient.prefetchQuery({
      queryKey: ["users"],
      queryFn: getUsers,
    }),
  ]);

  if (!session) {
    redirect("/");
  }

  // Get the user's role from the session and map to permissions
  const userRole = session.user.role || "user";
  const rolePermissions = {
    admin,
    user,
    coach,
  };

  const rawRolePermissions =
    rolePermissions[userRole as keyof typeof rolePermissions] || user;

  // Extract only the statements data (not the functions) for client component
  const permissionStatements = rawRolePermissions.statements;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <TeamHeader key="team-header" permissions={permissionStatements} />,
        ]}
      >
        <TeamClient
          currentUserId={session.session.userId}
          permissions={permissionStatements}
          impersonatedBy={session.session.impersonatedBy}
        />
      </MainLayout>
    </HydrationBoundary>
  );
}
