import type { Tables } from "@/utils/supabase/database.types";

export type GoalType = Tables<"goal_types"> & {
  goal_categories?: {
    id: string;
    name: string;
  } | null;
};

export interface GoalTypeFormData {
	name: string;
	category?: string | null;
	description?: string | null;
	icon?: string | null;
	is_measurable?: boolean | null;
	unit_of_measure?: string | null;
	default_duration_days?: number | null;
}