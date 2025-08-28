"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCoach(id: string) {
	console.log("id", id)
	try {
		const supabase = await createClient();

		const { data: coach, error } = await supabase
			.from("team_members")
			.select(`
				*,
				user:user!team_members_user_id_fkey (
					id,
					email,
					image,
					name,
					role
				),
				team:coach_teams!team_members_team_id_fkey (
					id,
					premier_coach:team_members!coach_teams_premier_coach_id_fkey (
						id,
						name
					)
				),
				client_assignments (
					id,
					assignment_type,
					start_date,
					end_date,
					client:clients!client_assignments_client_id_fkey (
						id,
						name,
						email
					)
				),
				coach_payments (
					id,
					amount,
					status,
					created_at,
					updated_at
				)
			`)
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