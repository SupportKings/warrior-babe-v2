"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createCoachTeams } from "../actions/createCoachTeams";
import { updateCoachTeam } from "../actions/updateCoachTeam";
import type { TeamMember } from "../types/coach-teams";
import {
	type CoachTeamsEditFormInput,
	type CoachTeamsFormInput,
	getAllValidationErrors,
	validateSingleField,
} from "../types/coach-teams";

interface CoachTeamsFormProps {
	mode: "create" | "edit";
	initialData?: CoachTeamsEditFormInput;
	teamMembers: TeamMember[];
	onSuccess?: () => void;
}

export function CoachTeamsForm({
	mode,
	initialData,
	teamMembers,
	onSuccess,
}: CoachTeamsFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Filter team members for premier coach (all team members)
	const premierCoachOptions = useMemo(() => {
		return teamMembers.map((member) => ({
			value: member.id,
			label: member.name || member.id,
		}));
	}, [teamMembers]);

	// Filter team members for coach (only those not in a team)
	const coachOptions = useMemo(() => {
		return teamMembers
			.filter((member) => !member.team_id)
			.map((member) => ({
				value: member.id,
				label: member.name || member.id,
			}));
	}, [teamMembers]);

	const createAction = useAction(createCoachTeams, {
		onSuccess: () => {
			toast.success("Coach team created successfully");
			queryClient.invalidateQueries({ queryKey: ["coach-teams"] });
			queryClient.invalidateQueries({ queryKey: ["team-members"] });
			if (onSuccess) {
				onSuccess();
			} else {
				router.push("/dashboard/coaches/teams");
			}
		},
		onError: (error) => {
			console.error("Error creating coach team:", error);
			toast.error(error.error?.serverError || "Failed to create coach team");
		},
	});

	const updateAction = useAction(updateCoachTeam, {
		onSuccess: () => {
			toast.success("Coach team updated successfully");
			queryClient.invalidateQueries({ queryKey: ["coach-teams"] });
			queryClient.invalidateQueries({ queryKey: ["team-members"] });
			if (onSuccess) {
				onSuccess();
			}
		},
		onError: (error) => {
			console.error("Error updating coach team:", error);
			toast.error(error.error?.serverError || "Failed to update coach team");
		},
	});

	const form = useForm({
		defaultValues: initialData || {
			team_name: "",
			premier_coach_id: "",
			coach_id: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				if (mode === "edit" && initialData?.id) {
					await updateAction.executeAsync({
						id: initialData.id,
						...value,
					});
				} else {
					await createAction.executeAsync({
						team_name: value.team_name,
						premier_coach_id: value.premier_coach_id,
						coach_id: value.coach_id || undefined,
					});
				}
			} catch (error) {
				console.error("Form submission error:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Basic Information Section */}
			<h2>Basic Information</h2>

			{/* Team Name Field */}
			<form.Field
				name="team_name"
				validators={{
					onBlur: ({ value }) => {
						const result = validateSingleField("team_name", value);
						return result.error;
					},
					onChange: ({ value }) => {
						if (!value) return "Team name is required";
						return undefined;
					},
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="team_name">
							Team Name <span className="text-red-500">*</span>
						</Label>
						<Input
							id="team_name"
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Enter team name"
							className={`h-10 ${
								field.state.meta.errors.length > 0 ? "border-red-500" : ""
							}`}
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="text-red-500 text-sm">
								{field.state.meta.errors.join(", ")}
							</p>
						)}
					</div>
				)}
			</form.Field>

			{/* Premier Coach Field */}
			<form.Field
				name="premier_coach_id"
				validators={{
					onBlur: ({ value }) => {
						const result = validateSingleField("premier_coach_id", value);
						return result.error;
					},
					onChange: ({ value }) => {
						if (!value) return "Premier coach is required";
						return undefined;
					},
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="premier_coach_id">
							Premier Coach <span className="text-red-500">*</span>
						</Label>
						<Combobox
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value)}
							options={premierCoachOptions}
							placeholder="Select premier coach"
							searchPlaceholder="Search coaches..."
							emptyText="No coaches found"
							className={`h-10 ${
								field.state.meta.errors.length > 0 ? "border-red-500" : ""
							}`}
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="text-red-500 text-sm">
								{field.state.meta.errors.join(", ")}
							</p>
						)}
					</div>
				)}
			</form.Field>

			{/* Coach Field (Optional) */}
			<form.Field
				name="coach_id"
				validators={{
					onBlur: ({ value }) => {
						if (value) {
							const result = validateSingleField("coach_id", value);
							return result.error;
						}
						return undefined;
					},
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="coach_id">Coach (Optional)</Label>
						<Combobox
							value={field.state.value || ""}
							onValueChange={(value) => field.handleChange(value || null)}
							options={coachOptions}
							placeholder="Select coach (optional)"
							searchPlaceholder="Search coaches not in a team..."
							emptyText="No available coaches found"
							className={`h-10 ${
								field.state.meta.errors.length > 0 ? "border-red-500" : ""
							}`}
						/>
						{field.state.meta.errors.length > 0 && (
							<p className="text-red-500 text-sm">
								{field.state.meta.errors.join(", ")}
							</p>
						)}
						<p className="text-muted-foreground text-sm">
							Only coaches not currently assigned to a team are shown
						</p>
					</div>
				)}
			</form.Field>

			{/* Action Buttons */}
			<div className="flex justify-end gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						if (onSuccess) {
							onSuccess();
						} else {
							router.push("/dashboard/coaches/teams");
						}
					}}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting || !form.state.canSubmit}>
					{isSubmitting
						? "Saving..."
						: mode === "edit"
							? "Update Team"
							: "Create Team"}
				</Button>
			</div>
		</form>
	);
}
