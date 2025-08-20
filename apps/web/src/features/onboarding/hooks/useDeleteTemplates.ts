import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTemplates } from "../actions/deleteTemplates";
import { onboardingQueries } from "../queries";

export function useDeleteTemplates() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const result = await deleteTemplates(ids);
			return result;
		},
		onSuccess: () => {
			// Invalidate both the single template and all templates queries
			queryClient.invalidateQueries({ queryKey: onboardingQueries.template().queryKey });
			queryClient.invalidateQueries({ queryKey: onboardingQueries.allTemplates().queryKey });
		},
	});
}