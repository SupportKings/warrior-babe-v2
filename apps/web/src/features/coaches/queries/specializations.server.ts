"use server";

import { createClient } from "@/utils/supabase/server";
import type { Tables } from "@/utils/supabase/database.types";

export type SpecializationCategory = Tables<"specialization_categories">;
export type Specialization = Tables<"specializations"> & {
	specialization_category?: SpecializationCategory | null;
};
export type UserSpecialization = Tables<"user_specializations"> & {
	specialization: Specialization;
};

// Server function to get user's specializations
export async function getUserSpecializations(userId: string): Promise<UserSpecialization[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_specializations")
		.select(`
			*,
			specialization:specializations(
				*,
				specialization_category:specialization_categories(*)
			)
		`)
		.eq("user_id", userId)
		.order("is_primary", { ascending: false });

	if (error) throw error;
	return data || [];
}

// Server function to get user's primary specialization
export async function getUserPrimarySpecialization(userId: string): Promise<UserSpecialization | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_specializations")
		.select(`
			*,
			specialization:specializations(
				*,
				specialization_category:specialization_categories(*)
			)
		`)
		.eq("user_id", userId)
		.eq("is_primary", true)
		.single();

	if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
	return data || null;
}

// Server function to get all specializations
export async function getAllSpecializations(): Promise<Specialization[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("specializations")
		.select(`
			*,
			specialization_category:specialization_categories(*)
		`)
		.eq("is_active", true)
		.order("name");

	if (error) throw error;
	return data || [];
}