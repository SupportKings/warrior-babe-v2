"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllCoaches() {
	const supabase = await createClient();

	const { data: coaches, error } = await supabase
		.from("team_members")
		.select(`
			id,
			name,
			contract_type,
			onboarding_date,
			user:user!team_members_user_id_fkey (
				id,
				name,
				email
			)
		`)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching coaches:", error);
		throw new Error(`Failed to fetch coaches: ${error.message}`);
	}

	return coaches || [];
}

export async function getActiveCoaches() {
	const supabase = await createClient();

	// Get all team members with user accounts as potential coaches
	const { data: coaches, error } = await supabase
		.from("team_members")
		.select(`
			id,
			name,
			contract_type,
			onboarding_date,
			user:user!team_members_user_id_fkey (
				id,
				name,
				email
			)
		`)
		.not("user_id", "is", null) // Only include team members with user accounts
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching coaches:", error);
		throw new Error(`Failed to fetch coaches: ${error.message}`);
	}

	return coaches || [];
}
