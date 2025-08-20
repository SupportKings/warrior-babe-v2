import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";

import MainLayout from "@/components/layout/main-layout";

import ReportsHeader from "@/features/reports/layout/reports-header";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function ReportsPage() {
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
          <ReportsHeader key="reports-header" permissions={permissionStatements} />,
        ]}
      >
        <div className="p-6">
          <p>Reports content goes here</p>
        </div>
      </MainLayout>
    </HydrationBoundary>
  );
}
