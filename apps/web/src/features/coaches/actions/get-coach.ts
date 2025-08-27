"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCoach(id: any) {
	try {
		const supabase = await createClient();

		const { data: coach, error } = await supabase
			.from("team_members")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching coach:", error);
			return null;
		}

		return coach;
	} catch (error) {
		console.error("Unexpected error in getCoach:", error);
		return null;
	}
}