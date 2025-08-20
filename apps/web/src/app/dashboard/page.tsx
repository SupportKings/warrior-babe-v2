import { Suspense } from "react";

import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";

import MainLayout from "@/components/layout/main-layout";

import DashboardHeader from "@/features/dashboard/layout/dashboard-header";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import DashboardClient from "./dashboard-client";
import DashboardLoading from "./loading";

export default function Home() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <HomeAsync />
    </Suspense>
  );
}

async function HomeAsync() {
  const queryClient = new QueryClient();

  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  const userRole = session.user.role || "user";
  const rolePermissions = {
    admin,
    user,
    coach,
  };

  const rawRolePermissions =
    rolePermissions[userRole as keyof typeof rolePermissions] || user;

  const permissionStatements = rawRolePermissions.statements;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <DashboardHeader
            key="dashboard-header"
            permissions={permissionStatements}
          />,
        ]}
      >
        <DashboardClient user={session.user} />
      </MainLayout>
    </HydrationBoundary>
  );
}
