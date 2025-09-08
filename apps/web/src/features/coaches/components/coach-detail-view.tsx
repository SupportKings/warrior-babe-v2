"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { updateCoach } from "@/features/coaches/actions/update-coach";
import {
	useCoachBasicInfo,
	useCoachClientAssignments,
	useCoachPayments,
} from "@/features/coaches/queries/useCoachDetails";

import { CoachGeneralInfo } from "./coach-details";
import { CoachActivitiesTabs } from "./coach-details/coach-activities-tabs";
import { CoachSystemInfo } from "./coach-details/coach-system-info";

interface CoachDetailViewProps {
	coachId: string;
}

export default function CoachDetailView({ coachId }: CoachDetailViewProps) {
	const {
		data: coach,
		isLoading: isLoadingCoach,
		refetch,
	} = useCoachBasicInfo(coachId);
	const { data: clientAssignments } = useCoachClientAssignments(coachId);
	const { data: coachPayments } = useCoachPayments(coachId);

	const [isEditingGeneral, setIsEditingGeneral] = useState(false);
	const router = useRouter();

	if (isLoadingCoach) {
		return <div>Loading...</div>;
	}

	if (!coach) {
		return <div>Coach not found</div>;
	}

	const handleSaveGeneralInfo = async (data: any) => {
		try {
			const result = await updateCoach({
				id: coachId,
				name: data.name,
				email: data.email,
				contract_type: data.contract_type,
				onboarding_date: data.onboarding_date,
				roles: data.roles,
				team_id: data.team_id,
			});

			if (result.success) {
				setIsEditingGeneral(false);
				router.refresh();
				refetch();
			} else {
				console.error("Failed to update:", result.message);
				// Optionally show an error state
			}
		} catch (error) {
			console.error("Failed to update coach information", error);
		}
	};

	return (
		<div className="space-y-6 p-6">
			{/* General Information */}
			<CoachGeneralInfo
				coach={coach}
				isEditing={isEditingGeneral}
				onEditToggle={() => setIsEditingGeneral(!isEditingGeneral)}
				onSave={handleSaveGeneralInfo}
				onCancel={() => setIsEditingGeneral(false)}
			/>

			{/* Activities Tabs - Client Assignments and Payments */}
			<CoachActivitiesTabs
				assignments={clientAssignments || []}
				payments={coachPayments || []}
				coachId={coachId}
			/>

			{/* System Information */}
			<CoachSystemInfo coach={coach} />
		</div>
	);
}
