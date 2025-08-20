"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

type TicketType = Database["public"]["Enums"]["ticket_type_enum"];
type TicketPriority = Database["public"]["Enums"]["ticket_priority_enum"];

const inputSchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(255, "Title must be under 255 characters"),
	description: z.string().optional(),
	ticket_type: z.enum([
		"billing",
		"tech_problem",
		"escalation",
		"coaching_transfer",
		"retention",
		"pausing",
		"other",
	] as const),
	priority: z
		.enum(["low", "medium", "high", "urgent"] as const)
		.default("medium"),
	is_executive: z.boolean().default(false),
	assigned_to: z.string().optional(), // Changed from z.string().uuid().optional()
	client_id: z.string().uuid().optional(),
	reminder_date: z.string().optional(),
});

export const createTicket = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Get current user
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to create tickets."],
				});
			}

			const supabase = await createClient();

			// Create the ticket
			const { data: ticket, error } = await supabase
				.from("tickets")
				.insert({
					title: parsedInput.title,
					description: parsedInput.description,
					ticket_type: parsedInput.ticket_type as TicketType,
					priority: parsedInput.priority as TicketPriority,
					is_executive: parsedInput.is_executive,
					assigned_to: parsedInput.assigned_to,
					reminder_date: parsedInput.reminder_date,
					client_id: parsedInput.client_id,
					created_by: session.user.id,
					status: "open",
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating ticket:", error);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to create ticket. Please try again."],
				});
			}

			// Log the ticket creation in audit_log
			const { error: auditError } = await supabase
				.from("audit_log")
				.insert({
					action: "INSERT",
					changed_at: new Date().toISOString(),
					changed_by: session.user.id,
					client_id: parsedInput.client_id || null,
					record_id: ticket.id,
					table_name: "tickets",
					new_values: {
						title: parsedInput.title,
						description: parsedInput.description,
						ticket_type: parsedInput.ticket_type,
						priority: parsedInput.priority,
						is_executive: parsedInput.is_executive,
						assigned_to: parsedInput.assigned_to,
						reminder_date: parsedInput.reminder_date,
						status: "open",
						created_by: session.user.id,
					},
					old_values: null, // No previous values for creation
				});

			if (auditError) {
				console.error("Error logging audit:", auditError);
				// Don't fail the ticket creation if audit logging fails
			}

			return {
				success: "Ticket created successfully",
				ticket,
			};
		} catch (error) {
			console.error("Error creating ticket:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to create ticket. Please try again."],
			});
		}
	});
