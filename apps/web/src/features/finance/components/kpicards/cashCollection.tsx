"use client";

import { CategoryBar } from "@/components/charts/categoryBar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useQuery } from "@tanstack/react-query";
import { cashCollectionQuery } from "../../queries/finance-queries";
import { useDateRange } from "../date-range-provider";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const valueFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

type CategoryName = "Cash Collected" | "Outstanding";

interface CategoryDetail {
  name: CategoryName;
  value: string;
}

// Remove hardcoded data - will use real data from API

const legendColor: Record<CategoryName, string> = {
  "Cash Collected": "bg-emerald-500",
  Outstanding: "bg-red-500",
};

export default function CashCollection() {
  const { dateRange } = useDateRange();

  // Fetch cash collection metrics
  const { data: cashData, isLoading } = useQuery(
    cashCollectionQuery(dateRange)
  );

  // Transform data for display
  const details: CategoryDetail[] = [
    {
      name: "Cash Collected",
      value: valueFormatter(cashData?.cashCollected || 0),
    },
    {
      name: "Outstanding",
      value: valueFormatter(cashData?.outstanding || 0),
    },
  ];

  if (isLoading) {
    return (
      <Card className="px-6 py-6">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-4 w-full" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="px-6 py-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">Total Sales</p>
        <p className="font-semibold text-2xl text-foreground">
          {valueFormatter(cashData?.totalSales || 0)}
        </p>
      </div>
      <CategoryBar
        values={cashData?.split || [0, 0]}
        colors={["emerald", "red"]}
        showLabels={false}
        className="mt-6"
      />
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {details.map((category) => (
          <div key={category.name} className="flex items-center space-x-2">
            <span
              className={classNames(
                legendColor[category.name],
                "size-3 shrink-0 rounded-sm"
              )}
              aria-hidden={true}
            />
            <span className="text-muted-foreground text-sm">
              <span className="font-medium text-foreground">
                {category.value}
              </span>{" "}
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
