import { useQuery } from "@tanstack/react-query";
import { onboardingQueries } from "../queries";

export function useOnboardingOverview() {
	return useQuery(onboardingQueries.overview());
}