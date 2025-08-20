import { useQuery } from "@tanstack/react-query";
import { onboardingQueries } from "../queries";

export function useOnboardingMetrics() {
	return useQuery(onboardingQueries.metrics());
}