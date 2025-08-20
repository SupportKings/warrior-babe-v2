"use server";

import { createClient } from "@/utils/supabase/server";
import type { GoalType } from "../types/goalType";

export async function getAllGoalTypes(): Promise<GoalType[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("goal_types")
		.select(`
			*,
			goal_categories (
				id,
				name
			)
		`)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching goal types:", error);
		return [];
	}

	return data || [];
}

export async function getActiveGoalTypes(): Promise<GoalType[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("goal_types")
		.select(`
			*,
			goal_categories (
				id,
				name
			)
		`)
		.eq("is_active", true)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching active goal types:", error);
		return [];
	}

	return data || [];
}

export async function getGoalTypeById(id: string): Promise<GoalType | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("goal_types")
		.select(`
			*,
			goal_categories (
				id,
				name
			)
		`)
		.eq("id", id)
		.single();

	if (error) {
		console.error("Error fetching goal type:", error);
		return null;
	}

	return data;
}