import { useMutation, useQueryClient } from "@tanstack/react-query";
import { manageTemplate } from "../actions/manageTemplate";
import { onboardingQueries } from "../queries";

interface TemplateItem {
	id?: string;
	name: string;
	is_active: boolean;
	type?: "client_cs_onboarding" | "client_coach_onboarding" | "client_offboarding" | "coach_onboarding";
}

export function useManageTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (items: TemplateItem[]) => {
			const result = await manageTemplate(items);
			return result?.data;
		},
		onSuccess: () => {
			// Invalidate both the single template and all templates queries
			queryClient.invalidateQueries({ queryKey: onboardingQueries.template().queryKey });
			queryClient.invalidateQueries({ queryKey: onboardingQueries.allTemplates().queryKey });
		},
	});
}