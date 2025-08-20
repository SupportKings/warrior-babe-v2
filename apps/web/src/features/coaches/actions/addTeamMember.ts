"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const schema = z.object({
	premierCoachId: z.string().min(1, "Premier coach ID is required"),
	coachId: z.string().min(1, "Coach ID is required"),
});

export const addTeamMember = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const { premierCoachId, coachId } = parsedInput;
		const supabase = await createClient();

		console.log("Adding team member:", { premierCoachId, coachId });

		// Check if the coach is already in a team
		const { data: existingTeam, error: checkError } = await supabase
			.from("coach_teams")
			.select("id")
			.eq("coach_id", coachId)
			.is("end_date", null)
			.maybeSingle();

		console.log("Existing team check:", { existingTeam, checkError });

		if (checkError) {
			console.error("Failed to check existing team membership:", checkError);
			throw new Error(`Failed to check existing team membership: ${checkError.message}`);
		}

		if (existingTeam) {
			throw new Error("This coach is already in a team");
		}

		// Add the coach to the team
		const { data, error } = await supabase
			.from("coach_teams")
			.insert({
				premier_coach_id: premierCoachId,
				coach_id: coachId,
				start_date: new Date().toISOString().split('T')[0],
			})
			.select()
			.single();

		console.log("Insert result:", { data, error });

		if (error) {
			console.error("Failed to add team member:", error);
			throw new Error(`Failed to add team member: ${error.message}`);
		}

		return { success: true, data };
	});