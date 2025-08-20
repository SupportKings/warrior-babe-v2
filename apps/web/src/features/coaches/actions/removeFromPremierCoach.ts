"use server";


import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const schema = z.object({
	coachId: z.string().min(1, "Coach ID is required"),
});

export const removeFromPremierCoach = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const { coachId } = parsedInput;
		const supabase = await createClient();

		// Check if the coach is currently in a team
		const { data: currentTeam, error: checkError } = await supabase
			.from("coach_teams")
			.select("id, premier_coach_id")
			.eq("coach_id", coachId)
			.is("end_date", null)
			.single();

		if (checkError) {
			if (checkError.code === "PGRST116") {
				// No active team membership found
				throw new Error(
					"This coach is not currently assigned to a premier coach",
				);
			}
			throw new Error("Failed to check current team membership");
		}

		// End the current team membership by setting end_date
		const { data, error } = await supabase
			.from("coach_teams")
			.update({
				end_date: new Date().toISOString(),
			})
			.eq("id", currentTeam.id)
			.select()
			.single();

		if (error) {
			throw new Error("Failed to remove coach from premier coach");
		}

		return {
			success: true,
			data,
			message: "Coach successfully removed from premier coach",
		};
	});
