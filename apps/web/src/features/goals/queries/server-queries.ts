import { createClient } from "@/utils/supabase/server";

export interface GoalCategory {
	id: string;
	name: string;
	description?: string | null;
	is_active?: boolean | null;
	created_at?: string | null;
	updated_at?: string | null;
}

// Server-side query to fetch all goal categories
export const fetchGoalCategories = async (): Promise<GoalCategory[]> => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("goal_categories")
		.select("*")
		.order("name", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
};

// Server-side query to fetch active goal categories
export const fetchActiveGoalCategories = async (): Promise<GoalCategory[]> => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("goal_categories")
		.select("*")
		.eq("is_active", true)
		.order("name", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
};