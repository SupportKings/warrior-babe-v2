"use client";

import { DonutChart } from "@/components/charts/donutChart";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useQuery } from "@tanstack/react-query";
import { kpiMetricsQuery } from "../../queries/finance-queries";
import { useDateRange } from "../date-range-provider";
import CashCollection from "./cashCollection";

const valueFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

const formatPercentage = (value: number) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export default function FinanceKPICards() {
  const { dateRange } = useDateRange();

  // Fetch KPI metrics
  const { data: kpiMetrics, isLoading } = useQuery(kpiMetricsQuery(dateRange));

  // Transform subscription data for donut chart
  const subscriptionData = Object.entries(
    kpiMetrics?.subscriptionsByProduct || {}
  ).map(([name, value]) => ({
    name,
    value,
  }));

  // Default colors for subscription chart
  const colors = ["blue", "emerald", "amber", "violet", "red"];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["monthly-revenue", "subscriptions", "aov", "cash-collection"].map(
          (cardType) => (
            <Card key={`skeleton-${cardType}`} className="px-6 py-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </Card>
          )
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Monthly Revenue Card */}
      <Card className="px-6 py-6">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Monthly Revenue</p>
          <p className="font-semibold text-2xl text-foreground">
            {isLoading
              ? "..."
              : valueFormatter(kpiMetrics?.monthlyRevenue || 0)}
          </p>
        </div>
        <p className="mt-4 text-sm">
          <span
            className={`${
              (kpiMetrics?.revenueGrowthPercentage || 0) >= 0
                ? "text-emerald-600"
                : "text-red-600"
            } font-medium`}
          >
            {formatPercentage(kpiMetrics?.revenueGrowthPercentage || 0)}
          </span>{" "}
          <span className="text-muted-foreground">from last period</span>
        </p>
      </Card>

      {/* Active Subscriptions Card with Donut Chart */}
      <Card className="px-6 py-6">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Active Subscriptions</p>
          <p className="font-semibold text-2xl text-foreground">
            {isLoading ? "..." : kpiMetrics?.totalActiveSubscriptions || 0}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm">
              <span
                className={`${
                  (kpiMetrics?.subscriptionGrowth || 0) >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                } font-medium`}
              >
                {(kpiMetrics?.subscriptionGrowth || 0) >= 0 ? "+" : ""}
                {kpiMetrics?.subscriptionGrowth || 0}
              </span>{" "}
              <span className="text-muted-foreground">from last period</span>
            </p>
          </div>
          <div className="ml-4">
            <DonutChart
              data={subscriptionData}
              category="name"
              value="value"
              colors={
                colors.slice(0, subscriptionData.length) as Array<
                  | "blue"
                  | "violet"
                  | "emerald"
                  | "amber"
                  | "red"
                  | "pink"
                  | "gray"
                  | "cyan"
                  | "lime"
                  | "fuchsia"
                  | "unutilized"
                >
              }
              className="h-16 w-16"
              showTooltip={true}
              showLabel={false}
            />
          </div>
        </div>
      </Card>

      {/* Average Order Value Card */}
      <Card className="px-6 py-6">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Average Order Value</p>
          <p className="font-semibold text-2xl text-foreground">
            {isLoading
              ? "..."
              : valueFormatter(kpiMetrics?.averageOrderValue || 0)}
          </p>
        </div>
        <p className="mt-4 text-sm">
          <span
            className={`${
              (kpiMetrics?.aovGrowthPercentage || 0) >= 0
                ? "text-emerald-600"
                : "text-red-600"
            } font-medium`}
          >
            {formatPercentage(kpiMetrics?.aovGrowthPercentage || 0)}
          </span>{" "}
          <span className="text-muted-foreground">from last period</span>
        </p>
      </Card>

      {/* Cash Collection Card - Replacing Churn Rate */}
      <CashCollection />
    </div>
  );
}
