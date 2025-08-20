import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateChecklistProgress } from "../actions/updateChecklistProgress";
import { onboardingQueries } from "../queries";
import { toast } from "sonner";

export function useUpdateChecklistProgress() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { progressId: string; isCompleted: boolean; notes?: string }) => {
			return await updateChecklistProgress(input);
		},
		onSuccess: (data) => {
			console.log("Update success:", data);
			if (data?.success) {
				queryClient.invalidateQueries({ queryKey: onboardingQueries.overview().queryKey });
				queryClient.invalidateQueries({ queryKey: onboardingQueries.metrics().queryKey });
			}
		},
		onError: (error: Error) => {
			console.error("Error updating checklist:", error);
			toast.error(error.message || "Failed to update checklist item");
		},
	});
}