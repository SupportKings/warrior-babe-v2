"use client";

import { useState } from "react";

import { BarList } from "@/components/charts/barList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { coachQueries } from "../../coaches/queries/coaches";

interface CoachUtilizationRankingsProps {
  userId?: string;
  userRole?: string;
}

interface CoachUtilizationData {
  key: string;
  name: string;
  value: number;
  image?: string | null;
  current: number;
  max: number;
  utilizationPercentage: number;
  isOverCapacity: boolean;
}

const utilizationFormatter = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const CoachUtilizationRankings = ({
  userId,
  userRole,
}: CoachUtilizationRankingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Set up team filter for premier coaches
  const teamFilter =
    userRole === "premiereCoach" && userId
      ? { premiereCoachId: userId }
      : undefined;

  // Fetch coaches data
  const { data: coaches, isLoading } = useQuery(
    coachQueries.allCoaches([], teamFilter)
  );

  // Transform coaches data for BarList
  const allUtilizationData: CoachUtilizationData[] = (coaches || [])
    .map((coach) => {
      const current = coach.totalUnits;
      const max = coach.maxCapacity;
      const utilizationPercentage =
        max > 0 ? Math.round((current / max) * 100) : 0;
      const isOverCapacity = current > max;

      return {
        key: coach.id,
        name: coach.name,
        value: utilizationPercentage,
        image: coach.image,
        href: `/dashboard/coaches/${coach.id}`,
        current,
        max,
        utilizationPercentage,
        isOverCapacity,
      };
    })
    .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);

  // Top 5 for main display
  const topUtilizationData = allUtilizationData.slice(0, 5);

  // Filtered data for dialog
  const filteredUtilizationData = allUtilizationData.filter((coach) =>
    coach.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="relative px-6 py-6">
      <div className="space-y-1">
        <h3 className="font-medium text-foreground text-sm">
          Coach Utilization Rankings
        </h3>
        <p className="text-muted-foreground text-sm leading-6">
          Coaches sorted by current utilization percentage.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-medium text-foreground text-sm">Top 5 Coaches</p>
        <p className="font-medium text-muted-foreground text-xs uppercase">
          Utilization
        </p>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : topUtilizationData.length > 0 ? (
          <BarList
            data={topUtilizationData}
            valueFormatter={utilizationFormatter}
          />
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No coaches found
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-background to-transparent py-7">
        <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
          View all coaches
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
          <div className="px-6 pt-6 pb-4">
            <div className="relative">
              <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coaches..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <p className="font-medium text-foreground text-sm">Coaches</p>
              <p className="font-medium text-muted-foreground text-xs uppercase">
                Utilization
              </p>
            </div>
          </div>
          <div className="overflow-y-scroll px-6">
            {filteredUtilizationData.length > 0 ? (
              <BarList
                data={filteredUtilizationData}
                valueFormatter={utilizationFormatter}
              />
            ) : (
              <p className="flex h-full items-center justify-center text-foreground text-sm">
                No results.
              </p>
            )}
          </div>
          <div className="mt-4 border-border border-t bg-muted/30 p-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Go back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
