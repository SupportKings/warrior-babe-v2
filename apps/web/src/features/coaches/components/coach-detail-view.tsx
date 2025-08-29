"use client";

import {
	useCoachBasicInfo,
	useCoachClientAssignments,
	useCoachPayments,
} from "@/features/coaches/queries/useCoachDetails";

import {
	CoachAssignmentsTable,
	CoachGeneralInfo,
	CoachPaymentsTable,
} from "./coach-details";

interface CoachDetailViewProps {
	coachId: string;
}

export default function CoachDetailView({ coachId }: CoachDetailViewProps) {
	const { data: coach, isLoading: isLoadingCoach } = useCoachBasicInfo(coachId);
	const { data: clientAssignments, isLoading: isLoadingAssignments } =
		useCoachClientAssignments(coachId);
	const { data: coachPayments, isLoading: isLoadingPayments } =
		useCoachPayments(coachId);

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
			<CoachAssignmentsTable assignments={clientAssignments || []} />

			{/* Coach Payments */}
			<CoachPaymentsTable payments={coachPayments || []} coachId={coachId} />
		</div>
	);
}
