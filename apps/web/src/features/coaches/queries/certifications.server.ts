"use server";

import type { Tables } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

export type Certification = Tables<"certifications">;
export type UserCertification = Tables<"user_certifications"> & {
	certification: Certification;
};

// Server function to get all available certifications
export async function getAllCertifications(): Promise<Certification[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("certifications")
		.select("*")
		.eq("is_active", true)
		.order("name");

	if (error) throw error;
	return data || [];
}

// Server function to get user's certifications
export async function getUserCertifications(
	userId: string,
): Promise<UserCertification[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_certifications")
		.select(`
			*,
			certification:certifications(*)
		`)
		.eq("user_id", userId)
		.order("date_achieved", { ascending: false });

	if (error) throw error;
	return data || [];
}
