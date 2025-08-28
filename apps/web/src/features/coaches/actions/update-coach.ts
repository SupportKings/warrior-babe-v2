"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

// Validation schema for coach update
const updateCoachSchema = z.object({
	id: z.string().min(1, "Coach ID is required"),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	onboarding_date: z.string().optional(),
	contract_type: z.string().optional(),
	roles: z.string().optional(),
	team_id: z.string().optional().nullable(),
});

export type UpdateCoachInput = z.infer<typeof updateCoachSchema>;

export async function updateCoach(input: UpdateCoachInput) {
	try {
		const supabase = await createClient();

		// First, get the team member to find the user_id
		const { data: teamMember, error: fetchError } = await supabase
			.from("team_members")
			.select("user_id")
			.eq("id", input.id)
			.single();

		if (fetchError || !teamMember) {
			console.error("Error fetching team member:", fetchError);
			throw new Error(
				`Team member not found: ${fetchError?.message || "Unknown error"}`,
			);
		}

		const userId = teamMember.user_id;

		if (userId) {
			// Update the user record if it exists
			const { error: userUpdateError } = await supabase
				.from("user")
				.update({
					email: input.email,
					name: input.name,
					role: input.roles || null,
					updatedAt: new Date().toISOString(),
				})
				.eq("id", userId);

			if (userUpdateError) {
				console.error("Error updating user:", userUpdateError);
				throw new Error(`Failed to update user: ${userUpdateError.message}`);
			}
		} else {
			// If no user_id, create a new user (rare case, but handles incomplete data)
			const { data: newUser, error: userError } = await supabase
				.from("user")
				.insert({
					id: crypto.randomUUID(),
					email: input.email,
					name: input.name,
					role: input.roles || null,
					emailVerified: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
				.select()
				.single();

			if (userError) {
				console.error("Error creating user during update:", userError);
				throw new Error(`Failed to create user: ${userError.message}`);
			}

			// Update team_member with the new user_id
			const { error: linkError } = await supabase
				.from("team_members")
				.update({ user_id: newUser.id })
				.eq("id", input.id);

			if (linkError) {
				console.error("Error linking user to team member:", linkError);
			}
		}

		// Update the team_member record
		const { data: updatedTeamMember, error: teamMemberError } = await supabase
			.from("team_members")
			.update({
				name: input.name,
				team_id: input.team_id ?? null,
				contract_type:
					input.contract_type === "W2" || input.contract_type === "Hourly"
						? input.contract_type
						: null,
				onboarding_date: input.onboarding_date ?? null,
			})
			.eq("id", input.id)
			.select(`
				*,
				user:user!team_members_user_id_fkey (
					id,
					email,
					name,
					role
				),
				team:coach_teams!team_members_team_id_fkey (
					id,
					premier_coach:team_members!coach_teams_premier_coach_id_fkey (
						id,
						name
					)
				)
			`)
			.single();

		if (teamMemberError) {
			console.error("Error updating team member:", teamMemberError);
			throw new Error(
				`Failed to update team member: ${teamMemberError.message}`,
			);
		}

		// Revalidate the coaches pages
		revalidatePath("/dashboard/coaches");
		revalidatePath(`/dashboard/coaches/${input.id}`);
		revalidatePath(`/dashboard/coaches/${input.id}/edit`);

		return {
			success: true,
			data: updatedTeamMember,
			message: `Team member ${input.name} has been successfully updated`,
		};
	} catch (error) {
		console.error("Unexpected error in updateCoach:", error);

		return {
			success: false,
			message:
				error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}
