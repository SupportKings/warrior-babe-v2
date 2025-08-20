import { createClient } from "@/utils/supabase/server";

export interface SpecializationCategory {
	id: string;
	name: string;
	description?: string | null;
	is_active?: boolean | null;
	created_at?: string | null;
	updated_at?: string | null;
}

// Server-side query to fetch all specialization categories
export const fetchSpecializationCategories = async (): Promise<SpecializationCategory[]> => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("specialization_categories")
		.select("*")
		.order("name", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
};

// Server-side query to fetch active specialization categories
export const fetchActiveSpecializationCategories = async (): Promise<SpecializationCategory[]> => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("specialization_categories")
		.select("*")
		.eq("is_active", true)
		.order("name", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
};