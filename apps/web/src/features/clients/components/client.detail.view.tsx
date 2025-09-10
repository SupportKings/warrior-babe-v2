"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteClientActivityPeriod } from "../actions/relations/activity-periods";
import { deleteClientAssignment } from "../actions/relations/assignments";
import { deleteClientEmail } from "../actions/relations/client-emails";
import { deleteClientGoal } from "../actions/relations/goals";
import { deleteClientNPSScore } from "../actions/relations/nps-scores";
import { deleteClientPaymentPlan } from "../actions/relations/payment-plans";
import { deleteClientTestimonial } from "../actions/relations/testimonials";
import { deleteClientWin } from "../actions/relations/wins";
import { updateClientAction } from "../actions/updateClient";
import { clientQueries, useClient } from "../queries/useClients";
import { ClientActivityPeriodsSection } from "./detail-sections/client-activity-periods-section";
import { ClientAssignmentsSection } from "./detail-sections/client-assignments-section";
import { ClientBasicInfo } from "./detail-sections/client-basic-info";
import { ClientEmailsSection } from "./detail-sections/client-emails-section";
import { ClientGoalsSection } from "./detail-sections/client-goals-section";
import { ClientNPSSection } from "./detail-sections/client-nps-section";
import { ClientOnboardingStatus } from "./detail-sections/client-onboarding-status";
import { ClientPaymentPlansSection } from "./detail-sections/client-payment-plans-section";
import { ClientSystemInfo } from "./detail-sections/client-system-info";
import { ClientTestimonialsSection } from "./detail-sections/client-testimonials-section";
import { ClientWinsSection } from "./detail-sections/client-wins-section";
import { DeleteConfirmModal } from "./shared/delete-confirm-modal";

interface ClientDetailViewProps {
	clientId: string;
}

export default function ClientDetailView({ clientId }: ClientDetailViewProps) {
	const { data: client, isLoading, error } = useClient(clientId);
	const queryClient = useQueryClient();
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		type: string;
		id: string;
		title: string;
	}>({ isOpen: false, type: "", id: "", title: "" });
	const [editState, setEditState] = useState<{
		isEditing: boolean;
		section: "basic" | "onboarding" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "basic" | "onboarding") => {
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
			// Transform form data to match the updateClientSchema format - only include relevant fields
			const updateData: any = {
				id: clientId,
			};

			// Only include fields from the section being edited
			if (editState.section === "basic") {
				// Basic info fields
				updateData.name = data.name;
				updateData.email = data.email;
				updateData.phone = data.phone || null;
				updateData.overallStatus = data.overall_status as
					| "new"
					| "live"
					| "paused"
					| "churned"
					| null;
				updateData.everfitAccess = data.everfit_access as
					| "new"
					| "requested"
					| "confirmed"
					| null;
			} else if (editState.section === "onboarding") {
				// Onboarding fields
				updateData.onboardingCallCompleted = data.onboarding_call_completed;
				updateData.twoWeekCheckInCallCompleted =
					data.two_week_check_in_call_completed;
				updateData.vipTermsSigned = data.vip_terms_signed;
				updateData.onboardingNotes = data.onboarding_notes || null;
				updateData.onboardingCompletedDate =
					data.onboarding_completed_date || null;
				updateData.offboardDate = data.offboard_date || null;
			}

			// Call the update action
			const result = await updateClientAction(updateData);

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
					toast.error("Failed to update client");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Client updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: clientQueries.detail(clientId),
				});
			} else {
				toast.error("Failed to update client");
			}
		} catch (error) {
			console.error("Error updating client:", error);
			toast.error("Failed to update client");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	const handleDelete = async () => {
		try {
			switch (deleteModal.type) {
				case "email":
					await deleteClientEmail(deleteModal.id);
					toast.success("Email deleted successfully");
					break;
				case "goal":
					await deleteClientGoal(deleteModal.id);
					toast.success("Goal deleted successfully");
					break;
				case "win":
					await deleteClientWin(deleteModal.id);
					toast.success("Win deleted successfully");
					break;
				case "assignment":
					await deleteClientAssignment(deleteModal.id);
					toast.success("Assignment deleted successfully");
					break;
				case "activity_period":
					await deleteClientActivityPeriod(deleteModal.id);
					toast.success("Activity period deleted successfully");
					break;
				case "nps":
					await deleteClientNPSScore(deleteModal.id);
					toast.success("NPS score deleted successfully");
					break;
				case "testimonial":
					await deleteClientTestimonial(deleteModal.id);
					toast.success("Testimonial deleted successfully");
					break;
				case "payment_plan":
					await deleteClientPaymentPlan(deleteModal.id);
					toast.success("Payment plan deleted successfully");
					break;
				default:
					throw new Error("Unknown delete type");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});
		} catch (error) {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
			throw error;
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !client) return <div>Error loading client</div>;

	const fullName = client.name;
	const initials = client.name
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
						<h1 className="font-bold text-2xl">{fullName}</h1>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				<ClientBasicInfo
					client={{
						name: client.name,
						email: client.email,
						phone: client.phone,
						overall_status: client.overall_status || "unknown",
						everfit_access: client.everfit_access || "unknown",
					}}
					isEditing={editState.isEditing && editState.section === "basic"}
					onEditToggle={() => handleEditToggle("basic")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<ClientOnboardingStatus
					client={client}
					isEditing={editState.isEditing && editState.section === "onboarding"}
					onEditToggle={() => handleEditToggle("onboarding")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Children Level Info Sections */}
			<Tabs defaultValue="emails" className="w-full">
				<TabsList className="grid w-full grid-cols-8">
					<TabsTrigger value="emails">Emails</TabsTrigger>
					<TabsTrigger value="assignments">Assignments</TabsTrigger>
					<TabsTrigger value="goals">Goals</TabsTrigger>
					<TabsTrigger value="wins">Wins</TabsTrigger>
					<TabsTrigger value="activity-periods">Activity Periods</TabsTrigger>
					<TabsTrigger value="nps">NPS Scores</TabsTrigger>
					<TabsTrigger value="testimonials">Testimonials</TabsTrigger>
					<TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
				</TabsList>

				<TabsContent value="emails">
					<ClientEmailsSection
						clientId={clientId}
						emails={client.client_emails}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="assignments">
					<ClientAssignmentsSection
						clientId={clientId}
						assignments={client.client_assignments}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="goals">
					<ClientGoalsSection
						clientId={clientId}
						goals={client.client_goals}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="wins">
					<ClientWinsSection
						clientId={clientId}
						wins={client.client_wins}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="activity-periods">
					<ClientActivityPeriodsSection
						clientId={clientId}
						activityPeriods={client.client_activity_periods}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="nps">
					<ClientNPSSection
						clientId={clientId}
						npsScores={client.client_nps}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="testimonials">
					<ClientTestimonialsSection
						clientId={clientId}
						testimonials={client.client_testimonials}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>

				<TabsContent value="payment-plans">
					<ClientPaymentPlansSection
						clientId={clientId}
						paymentPlans={client.payment_plans}
						setDeleteModal={setDeleteModal}
					/>
				</TabsContent>
			</Tabs>

			{/* System Information */}
			<ClientSystemInfo client={client} />

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={deleteModal.isOpen}
				onOpenChange={(open) =>
					setDeleteModal({ ...deleteModal, isOpen: open })
				}
				onConfirm={handleDelete}
				title={deleteModal.title}
				description="This action cannot be undone. This will permanently delete the record."
			/>
		</div>
	);
}
