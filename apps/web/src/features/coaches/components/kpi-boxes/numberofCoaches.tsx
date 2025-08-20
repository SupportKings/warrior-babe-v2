"use client";

import { DonutChart } from "@/components/charts/donutChart";
import { Card } from "@/components/ui/card";
import type { CoachMetrics } from "../../types/coach";

interface NumberOfCoachesProps {
  metrics?: CoachMetrics;
  isLoading: boolean;
}

function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const mockData = [
  {
    name: "Standard Coaches",
    amount: 42,
    share: "70.0%",
    borderColor: "bg-violet-500",
  },
  {
    name: "Premier Coaches",
    amount: 18,
    share: "30.0%",
    borderColor: "bg-fuchsia-500",
  },
];

const coachFormatter = (number: number): string => {
  return `${number} coach${number !== 1 ? "es" : ""}`;
};

export const NumberOfCoaches = ({ metrics, isLoading }: NumberOfCoachesProps) => {
  // Calculate data from live metrics or fallback to mock data
  const regularCount = metrics?.regularCoachCount || 0;
  const premierCount = metrics?.premierCoachCount || 0;
  const totalCount = regularCount + premierCount;
  
  const data = totalCount > 0 ? [
    {
      name: "Standard Coaches",
      amount: regularCount,
      share: `${((regularCount / totalCount) * 100).toFixed(1)}%`,
      borderColor: "bg-violet-500",
    },
    {
      name: "Premier Coaches", 
      amount: premierCount,
      share: `${((premierCount / totalCount) * 100).toFixed(1)}%`,
      borderColor: "bg-fuchsia-500",
    },
  ] : mockData;

  return (
    <Card className="px-6 py-6">
      <div className="space-y-1">
        <h3 className="font-medium text-foreground text-sm">
          Coach Distribution
        </h3>
        <p className="text-muted-foreground text-sm leading-6">
          Breakdown of standard vs premier coaching staff across the organization.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8">
        <DonutChart
          data={data}
          value="amount"
          category="name"
          valueFormatter={coachFormatter}
          showTooltip={false}
          className="h-40"
          colors={["violet", "fuchsia"]}
        />
        <div className="mt-6 flex items-center sm:mt-0">
          <ul className="space-y-3">
            {isLoading ? (
              <li className="text-muted-foreground text-sm">Loading...</li>
            ) : (
              data.map((item) => (
              <li key={item.name} className="flex space-x-3">
                <span
                  className={classNames(
                    item.borderColor,
                    "w-1 shrink-0 rounded"
                  )}
                />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {coachFormatter(item.amount)}{" "}
                    <span className="font-normal">({item.share})</span>
                  </p>
                  <p className="mt-0.5 whitespace-nowrap text-muted-foreground text-sm">
                    {item.name}
                  </p>
                </div>
              </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};
