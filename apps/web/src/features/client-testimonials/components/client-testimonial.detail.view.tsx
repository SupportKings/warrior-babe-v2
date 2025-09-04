"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// Import update action
import { updateClientTestimonialAction } from "../actions/updateClientTestimonial";
// Import queries
import {
	clientTestimonialQueries,
	useClientTestimonial,
} from "../queries/useClientTestimonials";
// Import section components
import { ClientTestimonialBasicInfo } from "./detail-sections/client-testimonial-basic-info";
import { ClientTestimonialSystemInfo } from "./detail-sections/client-testimonial-system-info";

interface ClientTestimonialDetailViewProps {
	testimonialId: string;
}

export default function ClientTestimonialDetailView({
	testimonialId,
}: ClientTestimonialDetailViewProps) {
	const {
		data: testimonial,
		isLoading,
		error,
	} = useClientTestimonial(testimonialId);
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
			// Transform form data to match the update schema format
			const updateData: any = {
				id: testimonialId,
			};

			// Only include fields from the section being edited
			if (editState.section === "basic") {
				// Basic info fields
				updateData.client_id = data.client_id || null;
				updateData.testimonial_type = data.testimonial_type;
				updateData.content = data.content;
				updateData.testimonial_url = data.testimonial_url || null;
				updateData.recorded_date = data.recorded_date;
				updateData.recorded_by = data.recorded_by || null;
			}

			// Call the update action
			const result = await updateClientTestimonialAction(updateData);

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
					toast.error("Failed to update testimonial");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Testimonial updated successfully");
				setEditState({ isEditing: false, section: null });

				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: clientTestimonialQueries.detail(testimonialId).queryKey,
				});
			} else {
				toast.error("Failed to update testimonial");
			}
		} catch (error) {
			console.error("Error updating testimonial:", error);
			toast.error("Failed to update testimonial");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !testimonial) return <div>Error loading testimonial</div>;

	const displayName = testimonial.client_name || "Unknown Client";
	const testimonialType = testimonial.testimonial_type || "Testimonial";
	const initials = displayName
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
						<h1 className="font-bold text-2xl">
							{displayName} -{" "}
							<span className="capitalize">{testimonialType}</span>
						</h1>
						<p className="text-muted-foreground">{testimonial.client_email}</p>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6">
				<ClientTestimonialBasicInfo
					testimonial={{
						client_id: testimonial.client_id,
						client_name: testimonial.client_name,
						testimonial_type: testimonial.testimonial_type,
						content: testimonial.content,
						testimonial_url: testimonial.testimonial_url,
						recorded_date: testimonial.recorded_date,
						recorded_by: testimonial.recorded_by,
						recorded_by_name: testimonial.recorded_by_name,
					}}
					isEditing={editState.isEditing && editState.section === "basic"}
					onEditToggle={() => handleEditToggle("basic")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* System Information */}
			<ClientTestimonialSystemInfo testimonial={testimonial} />
		</div>
	);
}
