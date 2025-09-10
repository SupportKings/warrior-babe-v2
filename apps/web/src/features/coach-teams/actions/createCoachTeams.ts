"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { coachTeamsCreateSchema } from "../types/coach-teams";

export const createCoachTeams = actionClient
	.use(async ({ next }) => {
		const user = await getUser();
		if (!user) {
			throw new Error("Unauthorized");
		}
		return next({ ctx: { user } });
	})
	.inputSchema(coachTeamsCreateSchema)
	.action(async ({ parsedInput, ctx }) => {
		const supabase = await createClient();

		try {
			// Check if a team with the same name already exists
			const { data: existingTeam } = await supabase
				.from("coach_teams")
				.select("id")
				.eq("team_name", parsedInput.team_name)
				.single();

			if (existingTeam) {
				returnValidationErrors(coachTeamsCreateSchema, {
					team_name: {
						_errors: ["A team with this name already exists"],
					},
				});
			}

			// Check if premier coach exists
			const { data: premierCoach } = await supabase
				.from("team_members")
				.select("id, name")
				.eq("id", parsedInput.premier_coach_id)
				.single();

			if (!premierCoach) {
				returnValidationErrors(coachTeamsCreateSchema, {
					premier_coach_id: {
						_errors: ["Premier coach not found"],
					},
				});
			}


			// Create the coach team
			const { data: newTeam, error } = await supabase
				.from("coach_teams")
				.insert({
					team_name: parsedInput.team_name,
					premier_coach_id: parsedInput.premier_coach_id,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating coach team:", error);
				throw new Error("Failed to create coach team");
			}


			// Revalidate relevant paths
			revalidatePath("/dashboard/coaches/teams");
			revalidatePath(`/dashboard/coaches/teams/${newTeam.id}`);

			return {
				success: true,
				data: newTeam,
			};
		} catch (error) {
			console.error("Error in createCoachTeams:", error);
			throw new Error(
				error instanceof Error ? error.message : "Failed to create coach team",
			);
		}
	});
