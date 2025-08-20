"use client";

import { useCapacityMetrics } from "../queries/capacity";
import { CapacityDistributionChart } from "./capacity-distribution-chart";
import { CoachUtilizationRankings } from "./coach-utilization-rankings";

interface CapacityOverviewProps {
  userId?: string;
  userRole?: string;
}

export default function CapacityOverview({
  userId,
  userRole,
}: CapacityOverviewProps) {
  // Set up team filter for premier coaches
  const teamFilter =
    userRole === "premiereCoach" && userId
      ? { premiereCoachId: userId }
      : undefined;

  const { data: metrics, isLoading } = useCapacityMetrics(teamFilter);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CapacityDistributionChart metrics={metrics} isLoading={isLoading} />
      <CoachUtilizationRankings userId={userId} userRole={userRole} />
      {/* 			<ProductDistributionChart />
       */}{" "}
    </div>
  );
}
