"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Get the currently assigned coach for a client
 * Returns the coach_id from the active coach assignment (no end_date)
 */
export async function getClientAssignedCoach(clientId: string) {
	const supabase = await createClient();

	const { data: assignment, error } = await supabase
		.from("client_assignments")
		.select("coach_id")
		.eq("client_id", clientId)
		.eq("assignment_type", "coach")
		.is("end_date", null) // Active assignment (no end date)
		.single();

	if (error) {
		console.error("Error finding client coach assignment:", error);
		return null;
	}

	return assignment?.coach_id || null;
}
