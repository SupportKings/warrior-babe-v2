"use client";

import { useState } from "react";

import { BarList } from "@/components/charts/barList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { SearchIcon } from "lucide-react";
import type { CoachRenewalRate } from "../../types/coach";

interface RenewalRateCoachesProps {
  renewalRateData?: CoachRenewalRate[];
  overallRenewalRate?: number;
  isLoading: boolean;
}

const valueFormatter = (number: number) => `${number}%`;

export const RenewalRateCoaches = ({
  renewalRateData = [],
  overallRenewalRate = 0,
  isLoading,
}: RenewalRateCoachesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Transform renewal rate data to the format expected by BarList
  const coaches = renewalRateData.map((coach) => ({
    name: coach.coachName,
    value: coach.renewalRate,
    image: coach.coachImage,
    href: `/dashboard/coaches/${coach.coachId}`,
  }));

  const filteredItems = coaches.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="relative px-6 py-6">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">Renewal Rate</p>
        <p className="font-semibold text-2xl text-foreground">
          {isLoading ? "..." : `${overallRenewalRate}%`}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="font-medium text-foreground text-sm">Top 5 Coaches</p>
        <p className="font-medium text-muted-foreground text-xs uppercase">
          Rate
        </p>
      </div>
      {isLoading || coaches.length === 0 ? (
        <div className="mt-4 text-muted-foreground text-sm">
          {isLoading ? "Loading renewal rates..." : "No data available"}
        </div>
      ) : (
        <BarList
          data={coaches.slice(0, 5)}
          valueFormatter={valueFormatter}
          className="mt-4"
        />
      )}
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
                Renewal Rate
              </p>
            </div>
          </div>
          <div className=" overflow-y-scroll px-6">
            {filteredItems.length > 0 ? (
              <BarList data={filteredItems} valueFormatter={valueFormatter} />
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
