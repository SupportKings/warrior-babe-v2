"use server";

import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

export type Client = Database["public"]["Tables"]["clients"]["Row"] & {
	assignments?: {
		id: string;
		user_id: string;
		assignment_type: string;
		start_date: string;
		end_date: string | null;
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			role: string | null;
		};
	}[];
};

export async function getClients() {
	const supabase = await createClient();

	const { data: clients, error } = await supabase
		.from("clients")
		.select(`
			*,
			assignments:client_assignments(
				id,
				user_id,
				assignment_type,
				start_date,
				end_date,
				user:user!client_assignments_user_id_fkey(
					id,
					name,
					email,
					image,
					role
				)
			)
		`)
		.order("first_name", { ascending: true });

	if (error) {
		console.error("Error fetching clients:", error);
		return { clients: [], error };
	}

	return { clients: clients || [], error: null };
}
