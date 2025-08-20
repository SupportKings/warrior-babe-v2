"use client";

import { DonutChart } from "@/components/charts/donutChart";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { CapacityMetrics } from "../types/capacity";

interface CapacityDistributionChartProps {
  metrics?: CapacityMetrics;
  isLoading: boolean;
}

function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const unitFormatter = (number: number): string => {
  return `${number} unit${number !== 1 ? "s" : ""}`;
};

export const CapacityDistributionChart = ({
  metrics,
  isLoading,
}: CapacityDistributionChartProps) => {
  // Calculate data from live metrics
  const utilized = metrics?.total_utilized || 0;
  const available = metrics?.total_available || 0;
  const totalCapacity = utilized + available;
  
  // Calculate utilization percentage
  const utilizationPercentage = totalCapacity > 0 
    ? ((utilized / totalCapacity) * 100).toFixed(1)
    : "0.0";

  const data =
    totalCapacity > 0
      ? [
          {
            name: "Utilized",
            amount: utilized,
            share: `${((utilized / totalCapacity) * 100).toFixed(1)}%`,
            borderColor: "bg-emerald-500",
          },
          {
            name: "Available",
            amount: available,
            share: `${((available / totalCapacity) * 100).toFixed(1)}%`,
            borderColor: "bg-gray-300/70 dark:bg-gray-600/70",
          },
        ]
      : [
          {
            name: "Utilized",
            amount: 0,
            share: "0%",
            borderColor: "bg-emerald-500",
          },
          {
            name: "Available",
            amount: 0,
            share: "0%",
            borderColor: "bg-gray-300 dark:bg-gray-600",
          },
        ];


  return (
    <Card className="px-6 py-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">Capacity Utilization</p>
        <p className="font-semibold text-2xl text-foreground">
          {isLoading ? "..." : `${utilizationPercentage}%`}
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8">
        {isLoading ? (
          <>
            <div className="flex h-40 items-center justify-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <div className="mt-6 sm:mt-0">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </>
        ) : (
          <>
            <DonutChart
              data={data}
              value="amount"
              category="name"
              valueFormatter={unitFormatter}
              showTooltip={true}
              showLabel={false}
              className="h-40"
              colors={["emerald", "unutilized"]}
            />
            <div className="mt-6 flex items-center sm:mt-0">
              <ul className="space-y-3">
                {data.map((item) => (
                  <li key={item.name} className="flex space-x-3">
                    <span
                      className={classNames(
                        item.borderColor,
                        "w-1 shrink-0 rounded"
                      )}
                    />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {unitFormatter(item.amount)}{" "}
                        <span className="font-normal">({item.share})</span>
                      </p>
                      <p className="mt-0.5 whitespace-nowrap text-muted-foreground text-sm">
                        {item.name}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
