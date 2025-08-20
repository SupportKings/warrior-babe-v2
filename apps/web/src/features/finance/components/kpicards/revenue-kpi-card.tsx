"use client";

import { Card } from "@/components/ui/card";

import { useDateRange } from "@/features/finance/components/date-range-provider";
import { revenueMetricsQuery } from "@/features/finance/queries/finance-queries";

import { useQuery } from "@tanstack/react-query";

export function RevenueKPICard() {
  const { dateRange } = useDateRange();
  const { data, isLoading } = useQuery(revenueMetricsQuery(dateRange));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="px-6 py-6">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">Total Revenue</p>
          <p className="font-semibold text-2xl text-foreground">...</p>
        </div>
      </Card>
    );
  }

  const isPositive = (data?.growth || 0) > 0;

  return (
    <Card className="px-6 py-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">Total Revenue</p>
        <p className="font-semibold text-2xl text-foreground">
          {formatCurrency(data?.totalRevenue || 0)}
        </p>
      </div>
      <div className="mt-4 text-sm">
        <span
          className={`${
            isPositive ? "text-emerald-600" : "text-red-600"
          } font-medium`}
        >
          {isPositive ? "+" : ""}
          {formatCurrency(data?.growth || 0)}
        </span>
        <span className="ml-1 text-muted-foreground">
          ({(data?.growthPercentage || 0).toFixed(1)}%) vs previous period
        </span>
      </div>
    </Card>
  );
}
