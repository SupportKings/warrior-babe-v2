import { useQuery } from "@tanstack/react-query";
import { getActivityPeriod } from "../actions/getActivityPeriod";

export const activityPeriodQueries = {
	all: () => ["activity-periods"] as const,
	lists: () => [...activityPeriodQueries.all(), "list"] as const,
	detail: (id: string) => [...activityPeriodQueries.all(), "detail", id] as const,
};

export function useActivityPeriod(id: string) {
	return useQuery({
		queryKey: activityPeriodQueries.detail(id),
		queryFn: () => getActivityPeriod(id),
		enabled: !!id,
	});
}