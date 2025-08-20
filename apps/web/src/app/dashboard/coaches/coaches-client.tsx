"use client";

import type { AnyRoleStatements } from "@/lib/permissions";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import ClientsCoaches from "@/features/coaches/components/kpi-boxes/clientsBarList";
import { NumberOfCoaches } from "@/features/coaches/components/kpi-boxes/numberofCoaches";
import { RenewalRateCoaches } from "@/features/coaches/components/kpi-boxes/renewalRateCoaches";
import { SatisfactionCoaches } from "@/features/coaches/components/kpi-boxes/satisfactionCoaches";
import { CoachesTable } from "@/features/coaches/components/table";
import { coachQueries } from "@/features/coaches/queries/coaches";

import { useQuery } from "@tanstack/react-query";
import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";

const filtersSchema = z.custom<FiltersState>();

interface CoachesClientProps {
  permissions: AnyRoleStatements;
  userId: string;
  userRole: string;
}

export default function CoachesClient({
  permissions,
  userId,
  userRole,
}: CoachesClientProps) {
  // Manage filters state with URL persistence
  const [filters, setFilters] = useQueryState<FiltersState>(
    "filters",
    parseAsJson(filtersSchema.parse).withDefault([])
  );

  // Set up team filter for premier coaches
  const teamFilter = userRole === "premiereCoach" 
    ? { premiereCoachId: userId } 
    : undefined;

  // Fetch data using React Query with unified queries
  const metricsQuery = useQuery(coachQueries.metrics(teamFilter));
  const topPerformersQuery = useQuery(coachQueries.topPerformers(teamFilter));
  const workloadQuery = useQuery(coachQueries.workloadDistribution(teamFilter));
  const renewalRateQuery = useQuery(coachQueries.renewalRateRankings(teamFilter));
  const overallRenewalRateQuery = useQuery(coachQueries.overallRenewalRate(teamFilter));

  return (
    <div className="space-y-6 p-6">
      {/* KPI Components - 1 column on mobile, 2x2 on tablets/13-inch laptops (accounting for 256px sidebar), 4 columns on larger screens */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4">
        <ClientsCoaches
          totalClients={metricsQuery.data?.totalClients}
          workloadData={workloadQuery.data}
          isLoading={metricsQuery.isLoading || workloadQuery.isLoading}
        />

        {userRole !== "premiereCoach" && (
          <NumberOfCoaches
            metrics={metricsQuery.data}
            isLoading={metricsQuery.isLoading}
          />
        )}
        <RenewalRateCoaches
          renewalRateData={renewalRateQuery.data}
          overallRenewalRate={overallRenewalRateQuery.data}
          isLoading={
            renewalRateQuery.isLoading || overallRenewalRateQuery.isLoading
          }
        />
        <SatisfactionCoaches
          metrics={metricsQuery.data}
          topPerformers={topPerformersQuery.data}
          isLoading={metricsQuery.isLoading || topPerformersQuery.isLoading}
        />
      </div>
      {/* Coaches Table */}
      <CoachesTable
        state={{ filters, setFilters }}
        userId={userId}
        userRole={userRole}
      />
    </div>
  );
}
