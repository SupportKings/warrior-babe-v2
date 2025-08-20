"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	ticketId: z.string().uuid("Invalid ticket ID"),
});

export const deleteTicket = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { ticketId } }) => {
		try {
			// Get current user
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to delete tickets."],
				});
			}

			const supabase = await createClient();

			// Check if ticket exists
			const { data: ticket, error: fetchError } = await supabase
				.from("tickets")
				.select("id")
				.eq("id", ticketId)
				.single();

			if (fetchError || !ticket) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Ticket not found."],
				});
			}

			// Delete associated audit log entries first
			const { error: auditLogDeleteError } = await supabase
				.from("audit_log")
				.delete()
				.eq("record_id", ticketId)
				.eq("table_name", "tickets");

			if (auditLogDeleteError) {
				console.error("Error deleting audit log entries:", auditLogDeleteError);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to delete ticket audit history. Please try again."],
				});
			}

			// Delete the ticket (cascade will handle related records)
			const { error: deleteError } = await supabase
				.from("tickets")
				.delete()
				.eq("id", ticketId);

			if (deleteError) {
				console.error("Error deleting ticket:", deleteError);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to delete ticket. Please try again."],
				});
			}

			return {
				success: "Ticket deleted successfully",
				redirect: "/dashboard/tickets/my-tickets",
			};
		} catch (error) {
			console.error("Unexpected error in deleteTicket:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to delete ticket. Please try again."],
			});
		}
	});
