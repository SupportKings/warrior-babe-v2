"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const deleteCoachTeamSchema = z.object({
	id: z.string().uuid(),
});

export const deleteCoachTeam = actionClient
	.inputSchema(deleteCoachTeamSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// Check if coach team exists
			const { data: team, error: fetchError } = await supabase
				.from("coach_teams")
				.select(`
					id,
					team_name
				`)
				.eq("id", id)
				.single();

			if (fetchError || !team) {
				return returnValidationErrors(deleteCoachTeamSchema, {
					_errors: ["Coach team not found"],
				});
			}

			// First, unlink all team members from this team (set their team_id to null)
			const { error: unlinkError } = await supabase
				.from("team_members")
				.update({ team_id: null })
				.eq("team_id", id);

			if (unlinkError) {
				console.error("Error unlinking team members:", unlinkError);
				return returnValidationErrors(deleteCoachTeamSchema, {
					_errors: ["Failed to unlink team members. Please try again."],
				});
			}

			// Now delete the coach team
			const { error: deleteError } = await supabase
				.from("coach_teams")
				.delete()
				.eq("id", id);

			if (deleteError) {
				console.error("Error deleting coach team:", deleteError);
				return returnValidationErrors(deleteCoachTeamSchema, {
					_errors: ["Failed to delete coach team. Please try again."],
				});
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/coaches/teams");
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Coach team deleted successfully",
				},
			};
		} catch (error) {
			console.error("Unexpected error in deleteCoachTeam:", error);

			return returnValidationErrors(deleteCoachTeamSchema, {
				_errors: ["Failed to delete coach team. Please try again."],
			});
		}
	});
