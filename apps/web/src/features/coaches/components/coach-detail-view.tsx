"use client";

import { 
  useCoachBasicInfo, 
  useCoachClientAssignments, 
  useCoachPayments 
} from "@/features/coaches/queries/useCoachDetails";
import { 
  CoachGeneralInfo, 
  CoachAssignmentsTable, 
  CoachPaymentsTable 
} from "./coach-details";

interface CoachDetailViewProps {
  coachId: string;
}

/**
 * Displays detailed coach information, client assignments, and payment records for a given coach.
 *
 * Renders a loading state while the coach's basic info is being fetched, shows a "Coach not found"
 * message if no coach is returned, and otherwise displays the coach's general info, a table of
 * client assignments, and a table of coach payments (each table receives an empty array if its
 * data is undefined).
 *
 * @param coachId - Identifier of the coach to load and display
 * @returns A React element containing the coach detail view
 */
export default function CoachDetailView({ coachId }: CoachDetailViewProps) {
  const { data: coach, isLoading: isLoadingCoach } = useCoachBasicInfo(coachId);
  const { data: clientAssignments, isLoading: isLoadingAssignments } = useCoachClientAssignments(coachId);
  const { data: coachPayments, isLoading: isLoadingPayments } = useCoachPayments(coachId);

  if (isLoadingCoach) {
    return <div>Loading...</div>;
  }

  if (!coach) {
    return <div>Coach not found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* General Information */}
      <CoachGeneralInfo coach={coach} />

      {/* Client Assignments */}
      <CoachAssignmentsTable 
        assignments={clientAssignments || []} 
      />

      {/* Coach Payments */}
      <CoachPaymentsTable 
        payments={coachPayments || []} 
        coachId={coachId}
      />
    </div>
  );
}