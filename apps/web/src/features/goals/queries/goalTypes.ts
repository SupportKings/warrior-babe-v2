"use client";

import { useQuery } from "@tanstack/react-query";
import { goalTypeQueries } from "./goalTypes.queries";

export function useAllGoalTypes() {
	return useQuery(goalTypeQueries.allGoalTypes());
}

export function useActiveGoalTypes() {
	return useQuery(goalTypeQueries.activeGoalTypes());
}

export function useGoalTypeById(id: string) {
	return useQuery({
		...goalTypeQueries.goalTypeById(id),
		enabled: !!id,
	});
}