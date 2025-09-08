"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Import relation delete actions
import { deleteTeamMember } from "../actions/relations/team-members";
// Import update action
import { updateCoachTeam } from "../actions/updateCoachTeam";
// Import queries
import { coachTeamQueries, useCoachTeam } from "../queries/usecoach-teams";
// Import section components
import { CoachTeamBasicInfo } from "./detail-sections/coach-team-basic-info";
import { CoachTeamMembersSection } from "./detail-sections/coach-team-members-section";
import { CoachTeamSystemInfo } from "./detail-sections/coach-team-system-info";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface CoachTeamDetailViewProps {
	teamId: string;
}

export default function CoachTeamDetailView({
	teamId,
}: CoachTeamDetailViewProps) {
	const { data: coachTeam, isLoading, error } = useCoachTeam(teamId);
	const queryClient = useQueryClient();
	// Delete modal state
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}>({ isOpen: false, type: "", id: "", title: "" });

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
			// Transform form data to match the updateCoachTeamSchema format
			const updateData: any = {
				id: teamId,
			};

			// Only include fields from the section being edited
			if (editState.section === "basic") {
				// Basic info fields
				updateData.teamName = data.teamName;
				updateData.premierCoachId = data.premierCoachId || null;
				console.log("we are in the basic");
			}
			console.log("update date", updateData);
			// Call the update action
			const result = await updateCoachTeam({
				id: updateData.id,
				premier_coach_id: updateData.premierCoachId,
				team_name: updateData.teamName,
			});
			console.log("result ", result);
			if (result?.validationErrors) {
				// Handle validation errors
				const errorMessages: string[] = [];

				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}

				// Handle field-specific errors
				Object.entries(result.validationErrors).forEach(([field, errors]) => {
					if (field !== "_errors" && errors) {
						if (Array.isArray(errors)) {
							errorMessages.push(...errors);
						} else if (
							errors &&
							typeof errors === "object" &&
							"_errors" in errors &&
							Array.isArray(errors._errors)
						) {
							errorMessages.push(...errors._errors);
						}
					}
				});

				if (errorMessages.length > 0) {
					errorMessages.forEach((error) => toast.error(error));
				} else {
					toast.error("Failed to update coach team");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Coach team updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: coachTeamQueries.detail(teamId),
				});
			} else {
				toast.error("Failed to update coach team");
			}
		} catch (error) {
			console.error("Error updating coach team:", error);
			toast.error("Failed to update coach team");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "team_member":
					await deleteTeamMember(deleteModal.id);
					toast.success("Team member removed from team successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the coach team query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: coachTeamQueries.detail(teamId),
			});
		} catch (error) {
			console.error("Error removing team member:", error);
			toast.error("Failed to remove team member");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !coachTeam) return <div>Error loading coach team</div>;

	const teamName = coachTeam.team_name || "Unnamed Team";
	const premierCoachName = coachTeam.premier_coach?.name || "No Premier Coach";
	const initials = teamName
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarFallback className="font-semibold text-lg">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="font-bold text-2xl">{teamName}</h1>
						<p className="text-muted-foreground">
							Premier Coach: {premierCoachName}
						</p>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<CoachTeamBasicInfo
				coachTeam={{
					team_name: coachTeam.team_name,
					premier_coach_id: coachTeam.premier_coach_id,
					premier_coach: coachTeam.premier_coach,
				}}
				isEditing={editState.isEditing && editState.section === "basic"}
				onEditToggle={() => handleEditToggle("basic")}
				onSave={handleSave}
				onCancel={handleCancel}
			/>

			<CoachTeamMembersSection
				teamId={teamId}
				teamMembers={coachTeam.coach_team_members || []}
				setDeleteModal={setDeleteModal}
			/>
			{/* System Information */}
			<CoachTeamSystemInfo coachTeam={coachTeam} />

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={deleteModal.isOpen}
				onOpenChange={(open) =>
					setDeleteModal({ ...deleteModal, isOpen: open })
				}
				onConfirm={handleDelete}
				title={deleteModal.title}
				description={
					deleteModal.type === "team_member"
						? "This will remove the team member from this team. The team member record will not be deleted and can be assigned to another team."
						: "This action cannot be undone. This will permanently delete the record."
				}
			/>
		</div>
	);
}
