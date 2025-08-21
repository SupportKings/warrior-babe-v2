"use server";

import { createClient } from "@/utils/supabase/server";

export async function getClient(id: string) {
	try {
		const supabase = await createClient();

		// Fetch client with related data
		const { data: client, error } = await supabase
			.from("clients")
			.select(`
				*,
				created_by:user!clients_created_by_fkey (
					id,
					name,
					email
				),
				product:products (
					id,
					name,
					client_unit,
					description
				),
				client_assignments!client_assignments_client_id_fkey (
					id,
					user_id,
					start_date,
					assignment_type,
					coach:user!client_assignments_user_id_fkey (
						id,
						name,
						email
					)
				),
				client_goals!client_goals_client_id_fkey (
					id,
					goal_type_id,
					description,
					status,
					created_at,
					goal_type:goal_types (
						id,
						name,
						description
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching client:", error);
			return null;
		}

		return client;
	} catch (error) {
		console.error("Unexpected error in getClient:", error);
		return null;
	}
}

export async function getClientBasic(id: string) {
	try {
		const supabase = await createClient();

		const { data: client, error } = await supabase
			.from("clients")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching client basic data:", error);
			return null;
		}

		return client;
	} catch (error) {
		console.error("Unexpected error in getClientBasic:", error);
		return null;
	}
}

export async function getAllClients() {
	try {
		const supabase = await createClient();

		const { data: clients, error } = await supabase
			.from("clients")
			.select(`
				*,
				created_by:user!clients_created_by_fkey (
					id,
					name,
					email
				),
				product:products (
					id,
					name,
					client_unit,
					description
				),
				client_assignments!client_assignments_client_id_fkey (
					coach:user!client_assignments_coach_id_fkey (
						id,
						name,
						email
					)
				)
			`)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching clients:", error);
			return [];
		}

		return clients || [];
	} catch (error) {
		console.error("Unexpected error in getAllClients:", error);
		return [];
	}
}