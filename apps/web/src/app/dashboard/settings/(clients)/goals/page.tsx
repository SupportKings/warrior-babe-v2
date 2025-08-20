import { Suspense } from "react";

import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";

import MainLayout from "@/components/layout/main-layout";

import GoalTypesTable from "@/features/goals/components/goal-types-table";
import GoalTypesHeader from "@/features/goals/layout/goal-types-header";
import { goalTypeQueries } from "@/features/goals/queries/goalTypes.queries";
import { goalCategoryQueries } from "@/features/goals/queries/categories.queries";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import GoalTypesLoading from "./loading";

export default function GoalTypesPage() {
  return (
    <Suspense fallback={<GoalTypesLoading />}>
      <GoalTypesPageAsync />
    </Suspense>
  );
}

async function GoalTypesPageAsync() {
  const queryClient = new QueryClient();

  // Parallelize data fetching
  const [session] = await Promise.all([
    getUser(),
    queryClient.prefetchQuery(goalTypeQueries.allGoalTypes()),
    queryClient.prefetchQuery(goalCategoryQueries.all()),
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
          <GoalTypesHeader
            key="goal-types-header"
            permissions={permissionStatements}
          />,
        ]}
      >
        <div className="h-screen">
          <GoalTypesTable permissions={permissionStatements} />
        </div>
      </MainLayout>
    </HydrationBoundary>
  );
}
