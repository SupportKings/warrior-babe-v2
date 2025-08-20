import { createClient } from "@/utils/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { SpecializationCategory } from "../queries/server-queries";

// Client-side query to fetch all specialization categories
const fetchSpecializationCategories = async (): Promise<SpecializationCategory[]> => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("specialization_categories")
		.select("*")
		.order("name", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
};

// Client-side query to fetch active specialization categories
const fetchActiveSpecializationCategories = async (): Promise<SpecializationCategory[]> => {
	const supabase = createClient();

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

export const specializationCategoryQueries = {
	all: () =>
		queryOptions({
			queryKey: ["specialization-categories", "all"],
			queryFn: fetchSpecializationCategories,
		}),

	active: () =>
		queryOptions({
			queryKey: ["specialization-categories", "active"],
			queryFn: fetchActiveSpecializationCategories,
		}),
};
