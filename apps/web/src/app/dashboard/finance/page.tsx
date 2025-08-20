import { redirect } from "next/navigation";

import { admin, coach, user } from "@/lib/permissions";

import {
  activeSubscriptionsQuery,
  cashCollectionQuery,
  churnMetricsQuery,
  customerMetricsQuery,
  type DateRange,
  kpiMetricsQuery,
  mrrQuery,
  revenueChartQuery,
  revenueMetricsQuery,
} from "@/features/finance/queries/finance-queries";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import FinanceWrapper from "./finance-wrapper";

export default async function FinancePage() {
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

  // Default date range: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Convert dates to ISO strings for serialization
  const defaultDateRange: DateRange = {
    from: thirtyDaysAgo.toISOString(),
    to: today.toISOString(),
  };

  // Prefetch all queries in parallel
  await Promise.all([
    queryClient.prefetchQuery(revenueMetricsQuery(defaultDateRange)),
    queryClient.prefetchQuery(activeSubscriptionsQuery(defaultDateRange)),
    queryClient.prefetchQuery(mrrQuery()),
    queryClient.prefetchQuery(customerMetricsQuery(defaultDateRange)),
    queryClient.prefetchQuery(revenueChartQuery(defaultDateRange)),
    queryClient.prefetchQuery(kpiMetricsQuery(defaultDateRange)),
    queryClient.prefetchQuery(cashCollectionQuery(defaultDateRange)),
    queryClient.prefetchQuery(churnMetricsQuery(defaultDateRange)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FinanceWrapper />
    </HydrationBoundary>
  );
}
