import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteClientActivityPeriod } from "../actions/relations/activity-periods";
import { deleteClientAssignment } from "../actions/relations/assignments";
import { deleteClientGoal } from "../actions/relations/goals";
import { deleteClientNPSScore } from "../actions/relations/nps-scores";
import { deleteClientPaymentPlan } from "../actions/relations/payment-plans";
import { deleteClientTestimonial } from "../actions/relations/testimonials";
import { deleteClientWin } from "../actions/relations/wins";
import { clientQueryKeys } from "../utils/query-keys";

/**
 * Shared hook for client relation deletion mutations
 * Provides consistent error handling and query invalidation
 */
export function useClientRelationMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			type,
			id,
			clientId,
		}: {
			type: string;
			id: string;
			clientId: string;
		}) => {
			switch (type) {
				case "goal":
					await deleteClientGoal(id);
					return "Goal deleted successfully";
				case "win":
					await deleteClientWin(id);
					return "Win deleted successfully";
				case "assignment":
					await deleteClientAssignment(id);
					return "Assignment deleted successfully";
				case "activity_period":
					await deleteClientActivityPeriod(id);
					return "Activity period deleted successfully";
				case "nps":
					await deleteClientNPSScore(id);
					return "NPS score deleted successfully";
				case "testimonial":
					await deleteClientTestimonial(id);
					return "Testimonial deleted successfully";
				case "payment_plan":
					await deleteClientPaymentPlan(id);
					return "Payment plan deleted successfully";
				default:
					throw new Error("Unknown delete type");
			}
		},
		onSuccess: (message, { clientId }) => {
			toast.success(message);
			// Invalidate the client query to refresh the data
			queryClient.invalidateQueries({
				queryKey: clientQueryKeys.detail(clientId),
			});
		},
		onError: (error) => {
			console.error("Error deleting record:", error);
			toast.error("Failed to delete record");
		},
	});
}
