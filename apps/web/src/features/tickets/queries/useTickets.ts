"use client";

import type { FiltersState } from "@/components/data-table-filter/core/types";
import type { CombinedActivityItem } from "@/features/shared/types/activity";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { createTicketComment } from "../actions/createTicketComment";
import { getCombinedActivity } from "./getCombinedActivity";
import { getTicket } from "./getTicket";
import { getTickets } from "./getTickets";

export function useTickets(
	assignedToUserId?: string,
	filters?: FiltersState,
	excludeAdminTickets?: boolean,
	sortByReminder?: boolean,
	userRole?: string,
) {
	return useQuery({
		queryKey: ["tickets", assignedToUserId, filters, excludeAdminTickets, sortByReminder, userRole],
		queryFn: () => getTickets(assignedToUserId, filters, excludeAdminTickets, sortByReminder, userRole),
	});
}

export function useTicket(ticketId: string) {
	return useQuery({
		queryKey: ["ticket", ticketId],
		queryFn: () => getTicket(ticketId),
		enabled: !!ticketId,
	});
}





export function useCreateTicketComment() {
	const queryClient = useQueryClient();

	const { execute, status, result } = useAction(createTicketComment, {
		onSuccess: (data) => {
			if (data.data?.comment) {
				// Invalidate both comments and audit log queries
				queryClient.invalidateQueries({
					queryKey: ["ticket-comments", data.data.comment.ticket_id],
				});
				queryClient.invalidateQueries({
					queryKey: ["combined-activity", data.data.comment.ticket_id],
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

// Re-export for backward compatibility
export type { CombinedActivityItem };

// Combined activity and comments hook - simpler version
export function useCombinedActivity(ticketId: string) {
	return useQuery({
		queryKey: ["combined-activity", ticketId],
		queryFn: () => getCombinedActivity(ticketId),
		enabled: !!ticketId,
		staleTime: 0, // Always consider data stale
		refetchInterval: false,
	});
}
