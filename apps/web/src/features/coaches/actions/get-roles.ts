"use server";

import { createClient } from "@/utils/supabase/server";

export interface Role {
	id: string;
	name: string;
	description: string | null;
}

export async function getAllRoles(): Promise<Role[]> {
	try {
		const supabase = await createClient();

		const { data: roles, error } = await supabase
			.from("roles")
			.select("id, name, description")
			.order("name", { ascending: true });

		if (error) {
			console.error("Error fetching roles:", error);
			return [];
		}

		return roles || [];
	} catch (error) {
		console.error("Unexpected error in getAllRoles:", error);
		return [];
	}
}
