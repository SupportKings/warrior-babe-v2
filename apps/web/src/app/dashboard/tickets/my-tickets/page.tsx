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

import SupportTicketsHeader from "@/features/tickets/layout/my-tickets-header";
import { getTickets } from "@/features/tickets/queries/getTickets";
import { TicketsTableWrapper } from "@/features/tickets/table/tickets-table-wrapper";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import MyTicketsLoading from "./loading";

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<MyTicketsLoading />}>
      <MyTicketsPageAsync />
    </Suspense>
  );
}

async function MyTicketsPageAsync() {
  const queryClient = new QueryClient();

  // Get session first to know the user ID
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  const userRole = session.user.role || "user";

  // Prefetch user's tickets with role-based filtering
  await queryClient.prefetchQuery({
    queryKey: ["tickets", session.user.id, [], undefined, userRole],
    queryFn: () =>
      getTickets(session.user.id, [], undefined, undefined, userRole),
  });
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

  const permissionStatements = rawRolePermissions.statements;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <SupportTicketsHeader
            key="support-tickets-header"
            permissions={permissionStatements}
          />,
        ]}
      >
        <TicketsTableWrapper
          assignedToUserId={session.user.id}
          userRole={userRole}
        />
      </MainLayout>
    </HydrationBoundary>
  );
}
