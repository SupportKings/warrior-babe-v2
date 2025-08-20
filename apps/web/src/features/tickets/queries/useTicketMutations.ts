"use client";

import { useRouter } from "next/navigation";

import type { Database } from "@/utils/supabase/database.types";

import { createTicket } from "@/features/tickets/actions/createTicket";
import { deleteTicket } from "@/features/tickets/actions/deleteTicket";
import { updateTicket } from "@/features/tickets/actions/updateTicket";
import type { TicketWithRelations } from "@/features/tickets/queries/getTicket";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface UpdateTicketParams {
	ticketId: string;
	title?: string;
	description?: string;
	ticket_type?: Database["public"]["Enums"]["ticket_type_enum"];
	priority?: Database["public"]["Enums"]["ticket_priority_enum"];
	status?: Database["public"]["Enums"]["ticket_status_enum"];
	assigned_to?: string | null;
	client_id?: string | null;
	is_executive?: boolean;
	reminder_date?: string | null;
}

export function useCreateTicketMutation() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const { execute, isPending, result } = useAction(createTicket, {
		onSuccess: ({ data }) => {
			if (data?.success && data?.ticket) {
				toast.success(data.success, {
					action: {
						label: "View Ticket",
						onClick: () => router.push(`/dashboard/tickets/${data.ticket.id}`),
					},
				});
				// Invalidate tickets queries to refetch data
				queryClient.invalidateQueries({ queryKey: ["tickets"] });
			}
		},
		onError: ({ error }) => {
			if (error.validationErrors?._errors) {
				toast.error(error.validationErrors._errors[0]);
			} else {
				toast.error("Failed to create ticket");
			}
		},
	});

	return {
		createTicket: execute,
		isPending,
		result,
	};
}

export function useUpdateTicket() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (variables: UpdateTicketParams) => {
			console.log('UpdateTicket mutation called with variables:', variables);
			const result = await updateTicket(variables);
			console.log('UpdateTicket result:', result);
			
			if (result.validationErrors) {
				console.error('Validation errors:', result.validationErrors);
				throw new Error(result.validationErrors._errors?.[0] || "Validation failed");
			}
			
			if (!result.data?.ticket) {
				console.error('No ticket data in result:', result);
				throw new Error("Failed to update ticket");
			}
			
			return result.data;
		},
		onMutate: async (variables) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: ["ticket", variables.ticketId],
			});
			await queryClient.cancelQueries({
				queryKey: ["ticket-audit-log", variables.ticketId],
			});

			// Snapshot the previous value
			const previousTicket = queryClient.getQueryData<TicketWithRelations>([
				"ticket",
				variables.ticketId,
			]);

			// Optimistically update the ticket with relations preserved
			if (previousTicket) {
				queryClient.setQueryData<TicketWithRelations>(
					["ticket", variables.ticketId],
					(old) => {
						if (!old) return old;
						
						// Build the update object, preserving undefined fields
						const updates: Partial<TicketWithRelations> = {
							updated_at: new Date().toISOString(),
						};
						
						// Only add fields that are explicitly being updated
						if (variables.title !== undefined) updates.title = variables.title;
						if (variables.description !== undefined) updates.description = variables.description;
						if (variables.ticket_type !== undefined) updates.ticket_type = variables.ticket_type;
						if (variables.priority !== undefined) updates.priority = variables.priority;
						if (variables.status !== undefined) updates.status = variables.status;
						if (variables.is_executive !== undefined) updates.is_executive = variables.is_executive;
						if (variables.reminder_date !== undefined) updates.reminder_date = variables.reminder_date;
						
						// Handle assigned_to specially to clear the user relation
						if (variables.assigned_to !== undefined) {
							updates.assigned_to = variables.assigned_to;
							// Clear the relation data when unassigning
							if (variables.assigned_to === null) {
								updates.assigned_to_user = null;
							}
							// Keep existing relation data when reassigning (will be refreshed on invalidate)
						}
						
						// Handle client_id specially to clear the client relation
						if (variables.client_id !== undefined) {
							updates.client_id = variables.client_id;
							// Clear the relation data when removing client
							if (variables.client_id === null) {
								updates.client = null;
							}
							// Keep existing relation data when reassigning (will be refreshed on invalidate)
						}
						
						return {
							...old,
							...updates,
						};
					},
				);
			}

			// Don't optimistically update audit logs - they'll be fetched immediately after
			// This prevents the flashing issue where optimistic entries are replaced

			// Return a context object with the snapshotted value
			return { previousTicket };
		},
		onError: (_err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousTicket) {
				queryClient.setQueryData(
					["ticket", variables.ticketId],
					context.previousTicket,
				);
			}
			toast.error("Failed to update ticket");
		},
		onSuccess: (_data, _variables) => {
			/* toast.success("Ticket updated successfully"); */
		},
		onSettled: (_data, _error, variables) => {
			// Always refetch after error or success to ensure cache consistency
			queryClient.invalidateQueries({
				queryKey: ["ticket", variables.ticketId],
			});
			queryClient.invalidateQueries({
				queryKey: ["ticket-audit-log", variables.ticketId],
			});
			queryClient.invalidateQueries({
				queryKey: ["combined-activity", variables.ticketId],
			});
			queryClient.invalidateQueries({ queryKey: ["tickets"] });
		},
	});
}

export function useDeleteTicket() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const { execute, isPending, result } = useAction(deleteTicket, {
		onSuccess: ({ data }) => {
			if (data?.success) {
				toast.success(data.success);
				// Invalidate tickets queries to refetch data
				queryClient.invalidateQueries({ queryKey: ["tickets"] });
				// Redirect to tickets list
				if (data.redirect) {
					router.push(data.redirect);
				}
			}
		},
		onError: ({ error }) => {
			if (error.validationErrors?._errors) {
				toast.error(error.validationErrors._errors[0]);
			} else {
				toast.error("Failed to delete ticket");
			}
		},
	});

	return {
		deleteTicket: execute,
		isPending,
		result,
	};
}
