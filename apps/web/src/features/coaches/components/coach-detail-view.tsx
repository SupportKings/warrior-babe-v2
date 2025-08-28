"use client";

import { useCoach } from "@/features/coaches/queries/useCoaches";
import { 
  CoachGeneralInfo, 
  CoachAssignmentsTable, 
  CoachPaymentsTable 
} from "./coach-details";

interface CoachDetailViewProps {
  coachId: string;
}

export default function CoachDetailView({ coachId }: CoachDetailViewProps) {
  const { data: coach, isLoading } = useCoach(coachId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!coach) {
    return <div>Coach not found</div>;
  }

  console.log(coach);

  return (
    <div className="space-y-6 p-6">
      {/* General Information */}
      <CoachGeneralInfo coach={coach} />

      {/* Client Assignments */}
      <CoachAssignmentsTable 
        assignments={coach.client_assignments || []} 
      />

      {/* Coach Payments */}
      <CoachPaymentsTable 
        payments={coach.coach_payments as any || []} 
        coachId={coachId}
      />
    </div>
  );
}