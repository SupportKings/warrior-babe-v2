"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { createCoachComment } from "../actions/createCoachComment";
import { coachQueries } from "./coaches";

// Hook for fetching combined coach activity (comments + audit logs)
export function useCoachCombinedActivity(coachId: string) {
	return useQuery({
		...coachQueries.coachCombinedActivity(coachId),
		enabled: !!coachId,
		staleTime: 0, // Always consider data stale
		refetchInterval: false,
	});
}

// Hook for creating coach comments
export function useCreateCoachComment() {
	const queryClient = useQueryClient();

	const { execute, status, result } = useAction(createCoachComment, {
		onSuccess: (data) => {
			if (data.data?.comment) {
				// Invalidate coach activity queries
				queryClient.invalidateQueries({
					queryKey: [
						"coaches",
						"combined-activity",
						data.data.comment.coach_id,
					],
				});
			}
		},
	});

	return {
		mutate: execute,
		isPending: status === "executing",
		error: result.validationErrors,
		data: result.data,
	};
}
