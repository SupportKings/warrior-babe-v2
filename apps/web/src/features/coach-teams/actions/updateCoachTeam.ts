"use server";

import { revalidatePath } from "next/cache";

import { getUser } from "@/queries/getUser";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { coachTeamsUpdateSchema } from "../types/coach-teams";

export const updateCoachTeam = actionClient
	.use(async ({ next }) => {
		const user = await getUser();
		if (!user) {
			throw new Error("Unauthorized");
		}
		return next({ ctx: { user } });
	})
	.inputSchema(coachTeamsUpdateSchema)
	.action(async ({ parsedInput, ctx }) => {
		const supabase = await createClient();
		try {
			// Check if team exists
			const { data: existingTeam } = await supabase
				.from("coach_teams")
				.select("*")
				.eq("id", parsedInput.id)
				.single();

			if (!existingTeam) {
				throw new Error("Team not found");
			}

			// Check if new team name conflicts (if team name is being changed)
			if (
				parsedInput.team_name &&
				parsedInput.team_name !== existingTeam.team_name
			) {
				const { data: conflictingTeam } = await supabase
					.from("coach_teams")
					.select("id")
					.eq("team_name", parsedInput.team_name)
					.neq("id", parsedInput.id)
					.single();

				if (conflictingTeam) {
					returnValidationErrors(coachTeamsUpdateSchema, {
						team_name: {
							_errors: ["A team with this name already exists"],
						},
					});
				}
			}

			// Check if premier coach exists (if being changed)
			if (parsedInput.premier_coach_id) {
				const { data: premierCoach } = await supabase
					.from("team_members")
					.select("id, name")
					.eq("id", parsedInput.premier_coach_id)
					.single();

				if (!premierCoach) {
					returnValidationErrors(coachTeamsUpdateSchema, {
						premier_coach_id: {
							_errors: ["Premier coach not found"],
						},
					});
				}
			}

			// Update the coach team
			const updateData: any = {};
			if (parsedInput.team_name !== undefined)
				updateData.team_name = parsedInput.team_name;
			if (parsedInput.premier_coach_id !== undefined)
				updateData.premier_coach_id = parsedInput.premier_coach_id;

			const { data: updatedTeam, error } = await supabase
				.from("coach_teams")
				.update(updateData)
				.eq("id", parsedInput.id)
				.select()
				.single();

			if (error) {
				console.error("Error updating coach team:", error);
				throw new Error("Failed to update coach team");
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/coaches/teams");
			revalidatePath(`/dashboard/coaches/teams/${parsedInput.id}`);

			return {
				success: true,
				data: updatedTeam,
			};
		} catch (error) {
			console.error("Error in updateCoachTeam:", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to update coach team",
			);
		}
	});
