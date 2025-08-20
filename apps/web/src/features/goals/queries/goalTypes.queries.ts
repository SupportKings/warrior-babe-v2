import { getAllGoalTypes, getActiveGoalTypes, getGoalTypeById } from "./goalTypes.server";

export const goalTypeQueries = {
	allGoalTypes: () => ({
		queryKey: ["goal-types", "all"],
		queryFn: () => getAllGoalTypes(),
	}),
	activeGoalTypes: () => ({
		queryKey: ["goal-types", "active"],
		queryFn: () => getActiveGoalTypes(),
	}),
	goalTypeById: (id: string) => ({
		queryKey: ["goal-types", id],
		queryFn: () => getGoalTypeById(id),
	}),
};