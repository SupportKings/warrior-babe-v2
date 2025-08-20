import { useQuery } from "@tanstack/react-query";
import { onboardingQueries } from "../queries";

export function useAllTemplates() {
	return useQuery(onboardingQueries.allTemplates());
}