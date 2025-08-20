"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

export const removeUser = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { userId } }) => {
		try {
			const supabase = await createClient();

			// Check if the user is a premier coach with active coach teams
			const { data: coachTeams, error: coachTeamsError } = await supabase
				.from("coach_teams")
				.select("*")
				.eq("premier_coach_id", userId)
				.is("end_date", null);

			if (coachTeamsError) {
				console.error("Error checking coach teams:", coachTeamsError);
				throw new Error("Failed to check coach teams");
			}

			// If user is a premier coach with active teams, handle the cleanup
			if (coachTeams && coachTeams.length > 0) {
				// Get all coach IDs from the teams
				const coachIds = coachTeams.map((team) => team.coach_id);

				// End all coach_teams relationships
				const { error: updateTeamsError } = await supabase
					.from("coach_teams")
					.update({ end_date: new Date().toISOString() })
					.eq("premier_coach_id", userId)
					.is("end_date", null);

				if (updateTeamsError) {
					console.error("Error updating coach teams:", updateTeamsError);
					throw new Error("Failed to update coach teams");
				}

				// Update coach_onboarding records to remove premier_coach_id
				const { error: updateOnboardingError } = await supabase
					.from("coach_onboarding")
					.update({ premier_coach_id: null })
					.eq("premier_coach_id", userId);

				if (updateOnboardingError) {
					console.error(
						"Error updating coach onboarding:",
						updateOnboardingError,
					);
					throw new Error("Failed to update coach onboarding records");
				}

				// Remove client assignments that were through this premier coach
				// This ensures clients aren't left without proper coach assignments
				const { error: updateAssignmentsError } = await supabase
					.from("client_assignments")
					.update({ end_date: new Date().toISOString() })
					.in("user_id", coachIds)
					.eq("assignment_type", "coach")
					.is("end_date", null);

				if (updateAssignmentsError) {
					console.error(
						"Error updating client assignments:",
						updateAssignmentsError,
					);
					throw new Error("Failed to update client assignments");
				}
			}

			// Now ban the user through the auth system
			const bannedUser = await auth.api.banUser({
				body: {
					userId,
				},
				headers: await headers(),
			});

			return {
				success: "User removed successfully",
				user: bannedUser,
			};
		} catch (error) {
			console.error("Error in removeUser:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to remove user. Please try again."],
			});
		}
	});
