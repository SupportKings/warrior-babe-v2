"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Import update action
import { updateActivityPeriodAction } from "../actions/updateActivityPeriod";

// Import queries
import { activityPeriodQueries, useActivityPeriod } from "../queries/useActivityPeriods";

// Import section components
import { ActivityPeriodBasicInfo } from "./detail-sections/activity-period-basic-info";
import { ActivityPeriodSystemInfo } from "./detail-sections/activity-period-system-info";

interface ActivityPeriodDetailViewProps {
	activityPeriodId: string;
}

export default function ActivityPeriodDetailView({ activityPeriodId }: ActivityPeriodDetailViewProps) {
	const { data: activityPeriod, isLoading, error } = useActivityPeriod(activityPeriodId);
	const queryClient = useQueryClient();

	// Edit state for basic info sections
	const [editState, setEditState] = useState<{
		isEditing: boolean;
		section: "basic" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "basic") => {
		if (editState.isEditing && editState.section === section) {
			// Cancel edit
			setEditState({ isEditing: false, section: null });
		} else {
			// Start edit
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (data: any) => {
		try {
			// Transform form data to match the updateActivityPeriodSchema format
			const updateData: any = {
				id: activityPeriodId,
			};

			// Only include fields from the section being edited
			if (editState.section === "basic") {
				if (data.start_date !== undefined) updateData.start_date = data.start_date;
				if (data.end_date !== undefined) updateData.end_date = data.end_date;
				if (data.active !== undefined) updateData.active = data.active;
				if (data.coach_id !== undefined) updateData.coach_id = data.coach_id;
				if (data.coach_payment !== undefined) updateData.coach_payment = data.coach_payment;
				if (data.payment_plan !== undefined) updateData.payment_plan = data.payment_plan;
			}

			// Execute the update action
			const result = await updateActivityPeriodAction(updateData);

			if (result?.serverError) {
				throw new Error("Server error occurred during update");
			}

			if (result?.validationErrors) {
				throw new Error("Validation failed");
			}

			if (result?.data?.success) {
				// Success - show toast and invalidate queries
				toast.success("Activity period updated successfully");

				// Invalidate relevant queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: activityPeriodQueries.detail(activityPeriodId),
				});

				// Exit edit mode
				setEditState({ isEditing: false, section: null });
			}
		} catch (error) {
			console.error("Update failed:", error);
			toast.error("Failed to update activity period. Please try again.");
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error loading activity period</div>;
	}

	if (!activityPeriod) {
		return <div>Activity period not found</div>;
	}
console.log(activityPeriod)
	// Get client initials for avatar
	const getInitials = (name: string | null | undefined): string => {
		if (!name) return "??";
		const words = name.split(" ");
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return name.slice(0, 2).toUpperCase();
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header with client info */}
			<div className="flex items-start space-x-4">
				<Avatar className="h-16 w-16">
					<AvatarFallback className="text-lg font-medium">
						{getInitials(activityPeriod.client?.name)}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<h1 className="text-2xl font-bold text-foreground truncate">
						{activityPeriod.client?.name || "Unknown Client"}
					</h1>
					<p className="text-muted-foreground truncate">
						{activityPeriod.payment_plan_detail?.name || "No payment plan"}
					</p>
				</div>
			</div>

			{/* Activity Period Information Sections */}
			<div className="grid gap-6">
				{/* Basic Info Section */}
				<ActivityPeriodBasicInfo
					activityPeriod={activityPeriod as any}
					isEditing={editState.isEditing && editState.section === "basic"}
					onEditToggle={() => handleEditToggle("basic")}
					onSave={handleSave}
					onCancel={() => setEditState({ isEditing: false, section: null })}
				/>

				{/* System Info Section */}
				<ActivityPeriodSystemInfo activityPeriod={activityPeriod} />
			</div>
		</div>
	);
}