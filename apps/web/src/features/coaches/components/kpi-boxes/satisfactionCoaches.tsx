"use client";

import { useState } from "react";

import { BarList } from "@/components/charts/barList";
import { DonutChart, type TooltipProps } from "@/components/charts/donutChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import NumberFlow from "@number-flow/react";
import { SearchIcon } from "lucide-react";
import type { CoachMetrics, CoachPerformance } from "../../types/coach";
import { formatNPSScore } from "../../utils/calculateNPS";

interface SatisfactionCoachesProps {
  metrics?: CoachMetrics;
  topPerformers?: CoachPerformance[];
  isLoading: boolean;
}

const npsFormatter = (number: number): string => {
  // The number passed in is the NPS score (-100 to +100)
  return formatNPSScore(Math.round(number));
};

export const SatisfactionCoaches = ({
  metrics,
  topPerformers = [],
  isLoading,
}: SatisfactionCoachesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tooltipData, setTooltipData] = useState<TooltipProps | null>(null);

  // Transform top performers data to the format expected by BarList
  const coachNPSScores = topPerformers.map((coach) => ({
    name: coach.coachName,
    value: coach.npsScore || 0, // Use the actual NPS score
    image: coach.coachImage,
    href: `/dashboard/coaches/${coach.coachId}`,
  }));

  const filteredItems = coachNPSScores.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use the overall NPS score from metrics (calculated from all client responses)
  const overallNPS = metrics?.npsScore || 0;
  const formattedNPS = formatNPSScore(overallNPS);

  // Calculate client count from top performers data
  const calculatedClientCount = topPerformers.reduce(
    (sum, coach) => sum + coach.clientCount,
    0
  );

  // Use real NPS distribution data from metrics or estimate from average
  const npsDistribution = metrics?.npsDistribution
    ? [
        {
          name: "Detractors (0-6)",
          amount: metrics.npsDistribution.detractors,
          borderColor: "bg-pink-500",
        },
        {
          name: "Passives (7-8)",
          amount: metrics.npsDistribution.passives,
          borderColor: "bg-amber-500",
        },
        {
          name: "Promoters (9-10)",
          amount: metrics.npsDistribution.promoters,
          borderColor: "bg-emerald-500",
        },
      ]
    : calculatedClientCount > 0
    ? [
        {
          name: "Detractors (0-6)",
          amount: Math.floor(calculatedClientCount * 0.2), // Estimate 20%
          borderColor: "bg-pink-500",
        },
        {
          name: "Passives (7-8)",
          amount: Math.floor(calculatedClientCount * 0.3), // Estimate 30%
          borderColor: "bg-amber-500",
        },
        {
          name: "Promoters (9-10)",
          amount: Math.ceil(calculatedClientCount * 0.5), // Estimate 50%
          borderColor: "bg-emerald-500",
        },
      ]
    : [];

  // Use actual NPS response count from metrics or calculated client count
  const totalResponses = metrics?.npsResponseCount || calculatedClientCount;
  const payload = tooltipData?.payload?.[0];
  const currentResponseCount = payload?.value ?? totalResponses;

  return (
    <Card className="px-6 py-6">
      <div className="space-y-1">
        <h3 className="font-medium text-foreground text-sm">
          Client Satisfaction (NPS)
        </h3>
        <p className="text-muted-foreground text-sm leading-6">
          Distribution of client NPS responses and coach performance rankings.
        </p>
      </div>

      {/* NPS Score with Interactive Chart */}
      <div className="mt-4 mb-6 flex items-center gap-6">
        <DonutChart
          data={npsDistribution}
          value="amount"
          category="name"
          className="h-24 w-24 flex-shrink-0"
          colors={["pink", "amber", "emerald"]}
          tooltipCallback={(props) => {
            if (props.active) {
              setTooltipData((prev) => {
                if (prev?.payload[0].category === props.payload[0].category)
                  return prev;
                return props;
              });
            } else {
              setTooltipData(null);
            }
            return null;
          }}
        />
        <div className="flex-1">
          <p className="text-muted-foreground text-sm">Overall NPS Score</p>
          <p className="mt-1 font-semibold text-2xl text-foreground">
            {isLoading ? "..." : formattedNPS}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">
            <NumberFlow value={currentResponseCount} /> responses
          </p>
        </div>
      </div>

      {/* Top Coaches Bar List */}
      <div className="">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground text-sm">
            Coach NPS Rankings
          </p>
          <p className="font-medium text-muted-foreground text-xs uppercase">
            NPS
          </p>
        </div>
        {isLoading ? (
          <div className="mt-4 text-muted-foreground text-sm">
            Loading coaches...
          </div>
        ) : (
          <BarList
            data={coachNPSScores.slice(0, 5)}
            valueFormatter={npsFormatter}
            className="mt-4"
          />
        )}
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(true)}
          >
            View all coaches
          </Button>
        </div>
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
              <p className="font-medium text-foreground text-sm">
                Coach NPS Scores
              </p>
              <p className="font-medium text-muted-foreground text-xs uppercase">
                NPS
              </p>
            </div>
          </div>
          <div className=" overflow-y-scroll px-6">
            {filteredItems.length > 0 ? (
              <BarList data={filteredItems} valueFormatter={npsFormatter} />
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
