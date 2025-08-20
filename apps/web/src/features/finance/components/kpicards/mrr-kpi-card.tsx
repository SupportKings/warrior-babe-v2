"use client";

import { Card } from "@/components/ui/card";

import { mrrQuery } from "@/features/finance/queries/finance-queries";

import { useQuery } from "@tanstack/react-query";

export function MRRKPICard() {
  const { data, isLoading } = useQuery(mrrQuery());

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
          <p className="text-muted-foreground text-sm">
            Monthly Recurring Revenue
          </p>
          <p className="font-semibold text-2xl text-foreground">...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="px-6 py-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">
          Monthly Recurring Revenue
        </p>
        <p className="font-semibold text-2xl text-foreground">
          {formatCurrency(data?.mrr || 0)}
        </p>
      </div>
      <p className="mt-4 text-muted-foreground text-sm">
        From {data?.activeSubscriptions || 0} active subscriptions
      </p>
    </Card>
  );
}
