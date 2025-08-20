import { createClient } from "@/utils/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { GoalCategory } from "../queries/server-queries";

// Client-side query to fetch all goal categories
const fetchGoalCategories = async (): Promise<GoalCategory[]> => {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("goal_categories")
		.select("*")
		.order("name", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data || [];
};

// Client-side query to fetch active goal categories
const fetchActiveGoalCategories = async (): Promise<GoalCategory[]> => {
	const supabase = createClient();

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

export const goalCategoryQueries = {
	all: () =>
		queryOptions({
			queryKey: ["goal-categories", "all"],
			queryFn: fetchGoalCategories,
		}),

	active: () =>
		queryOptions({
			queryKey: ["goal-categories", "active"],
			queryFn: fetchActiveGoalCategories,
		}),
};
