"use client";

import { CategoryBar } from "@/components/charts/categoryBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Settings } from "lucide-react";

interface ClientUnitsProps {
  currentUnits?: number;
  maxCapacity?: number;
}

export default function ClientUnits({
  currentUnits = 0,
  maxCapacity = 1, // Minimum of 1, actual default should come from parent
}: ClientUnitsProps) {
  // Calculate utilization ranges for the bar chart
  // Good: 0-75%, Medium: 75-90%, Red: 90%+
  const utilizationPercentage = (currentUnits / maxCapacity) * 100;

  // For the category bar, we'll show the capacity distribution
  // This is a simplified view - in a real app you might want more sophisticated logic
  const goodRangeLimit = Math.floor(maxCapacity * 0.75);
  const mediumRangeLimit = Math.floor(maxCapacity * 0.9);

  const values = [
    goodRangeLimit,
    mediumRangeLimit - goodRangeLimit,
    maxCapacity - mediumRangeLimit,
  ];

  const data = {
    name: "Client Units",
    total: maxCapacity.toString(),
    current: currentUnits.toString(),
    values,
    details: [
      {
        name: "Good range",
        value: `0-${goodRangeLimit}`,
        color: "emerald",
      },
      {
        name: "Medium range",
        value: `${goodRangeLimit + 1}-${mediumRangeLimit}`,
        color: "amber",
      },
      {
        name: "Red range",
        value: `${mediumRangeLimit + 1}+`,
        color: "red",
      },
    ],
  };
  return (
    <Card className="relative px-6 py-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{data.name}</p>
          <p className="text-left font-semibold text-2xl text-foreground">
            {data.current}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <CategoryBar
        values={data.values}
        colors={["emerald", "amber", "red"]}
        marker={{
          value: Number(data.current),
          tooltip: data.current,
          showAnimation: true,
        }}
        className="mt-6"
      />
    </Card>
  );
}
