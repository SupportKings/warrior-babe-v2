import { useQuery } from "@tanstack/react-query";
import { onboardingQueries } from "../queries";

export function useOnboardingTemplate() {
	return useQuery(onboardingQueries.template());
}