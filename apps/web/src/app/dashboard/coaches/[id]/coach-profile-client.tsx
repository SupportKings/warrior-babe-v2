"use client";

import { Skeleton } from "@/components/ui/skeleton";

import CoachClientsList from "@/features/coaches/components/coach-clients-list";
import { CoachCommentInput } from "@/features/coaches/components/coach-comment-input";
import CoachOverview from "@/features/coaches/components/coach-overview";
import CoachProfileSidebar from "@/features/coaches/components/coach-profile-sidebar";
import { coachQueries } from "@/features/coaches/queries/coaches";
import { useCoachCombinedActivity } from "@/features/coaches/queries/useCoachComments";
import { ActivityLog } from "@/features/tickets/components/activity-log";

import { useQuery } from "@tanstack/react-query";
import { LayoutGroup } from "motion/react";

interface CoachProfileClientProps {
  coachId: string;
}

export default function CoachProfileClient({
  coachId,
}: CoachProfileClientProps) {
  // Fetch coach details
  const { data: coach, isLoading: coachLoading } = useQuery(
    coachQueries.coachDetails(coachId)
  );

  // Fetch coach clients
  const { data: clients, isLoading: clientsLoading } = useQuery(
    coachQueries.coachClients(coachId)
  );

  // Fetch performance history
  const { data: performanceData, isLoading: performanceLoading } = useQuery(
    coachQueries.coachPerformanceHistory(coachId)
  );

  // Fetch coach activity
  const { data: coachActivity, isLoading: activityLoading } =
    useCoachCombinedActivity(coachId);

  const isLoading = coachLoading || clientsLoading || performanceLoading;

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="space-y-6 p-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
        <div className="h-full w-[430px] border-l bg-card p-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Coach not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-6">
            {/* Overview Section with metrics and chart */}
            <CoachOverview coach={coach} performanceData={performanceData} />

            {/* Clients List */}
            <CoachClientsList clients={clients || []} />

            {/* Activity Section */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold text-lg">Activity</h2>
              {activityLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <LayoutGroup>
                  <ActivityLog items={coachActivity || []} entityType="coach" />
                  <CoachCommentInput coachId={coachId} />
                </LayoutGroup>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Fixed height */}
      <div className="h-full w-[430px] overflow-y-auto border-l bg-card">
        <CoachProfileSidebar coach={coach} />
      </div>
    </div>
  );
}
