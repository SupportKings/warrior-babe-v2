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

import SupportTicketsHeader from "@/features/tickets/layout/tickets-header";
import { getTickets } from "@/features/tickets/queries/getTickets";
import { TicketsTableWrapper } from "@/features/tickets/table/tickets-table-wrapper";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import AllTicketsLoading from "./loading";

export default function AllTicketsPage() {
  return (
    <Suspense fallback={<AllTicketsLoading />}>
      <AllTicketsPageAsync />
    </Suspense>
  );
}

async function AllTicketsPageAsync() {
  const queryClient = new QueryClient();

  // Get session first to determine if we should exclude admin tickets
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  const userRole = session.user.role || "user";
  const rolePermissions = {
    admin,
    user,
    coach,
    cpo,
    csManager,
    premiereCoach,
    csRep,
    csc,
    finance,
    billingAdmin,
    salesRep,
  };

  const rawRolePermissions =
    rolePermissions[userRole as keyof typeof rolePermissions] || user;

  const permissionStatements = rawRolePermissions.statements;

  // Check if user has executive_read permission to see executive tickets
  // Roles with executive_read permission: admin, cpo, csManager
  const rolesWithExecutiveAccess = ["admin", "cpo", "csManager"];
  const hasExecutiveReadPermission = rolesWithExecutiveAccess.includes(userRole);
  const shouldExcludeAdminTickets = !hasExecutiveReadPermission;

  // Prefetch tickets with the correct excludeAdminTickets value
  await queryClient.prefetchQuery({
    queryKey: ["tickets", undefined, [], shouldExcludeAdminTickets],
    queryFn: () => getTickets(undefined, [], shouldExcludeAdminTickets),
  });

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
        <TicketsTableWrapper excludeAdminTickets={shouldExcludeAdminTickets} />
      </MainLayout>
    </HydrationBoundary>
  );
}

