import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startOnboarding } from "../actions/startOnboarding";
import { onboardingQueries } from "../queries";
import { toast } from "sonner";

export function useStartOnboarding() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (clientId: string) => {
			const result = await startOnboarding(clientId);
			return result;
		},
		onSuccess: (data) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: onboardingQueries.overview().queryKey });
			queryClient.invalidateQueries({ queryKey: onboardingQueries.metrics().queryKey });
			queryClient.invalidateQueries({ queryKey: ["clients"] });
			
			toast.success(data.message || "Onboarding started successfully");
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to start onboarding");
		},
	});
}