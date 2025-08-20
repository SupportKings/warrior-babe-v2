"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

type TicketPriority = Database["public"]["Enums"]["ticket_priority_enum"];
type TicketStatus = Database["public"]["Enums"]["ticket_status_enum"];
type TicketType = Database["public"]["Enums"]["ticket_type_enum"];

const inputSchema = z.object({
	ticketId: z.string().uuid("Invalid ticket ID"),
	title: z.string().min(1, "Title is required").max(255, "Title must be under 255 characters").optional(),
	description: z.string().optional(),
	ticket_type: z.enum([
		"billing",
		"tech_problem", 
		"escalation",
		"coaching_transfer",
		"retention",
		"pausing",
		"other",
	] as const).optional(),
	priority: z.enum(["low", "medium", "high", "urgent"] as const).optional(),
	status: z.enum(["open", "in_progress", "resolved", "closed", "paused"] as const).optional(),
	assigned_to: z.string().optional().nullable(),
	client_id: z.string().uuid().optional().nullable(),
	is_executive: z.boolean().optional(),
	reminder_date: z.string().optional().nullable(),
});

export const updateTicket = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Get current user
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to update tickets."],
				});
			}

			const supabase = await createClient();

			// Get current ticket data for audit logging
			const { data: currentTicket, error: fetchError } = await supabase
				.from("tickets")
				.select("*")
				.eq("id", parsedInput.ticketId)
				.single();

			if (fetchError || !currentTicket) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Ticket not found."],
				});
			}

			// Prepare update data (only include fields that are provided)
			const updateData: Partial<Database["public"]["Tables"]["tickets"]["Update"]> = {};
			const oldValues: Record<string, any> = {};
			const newValues: Record<string, any> = {};
			let changeType: string = 'multiple';

			// Check each field and only update if provided
			if (parsedInput.title !== undefined) {
				updateData.title = parsedInput.title;
				oldValues.title = currentTicket.title;
				newValues.title = parsedInput.title;
			}

			if (parsedInput.description !== undefined) {
				updateData.description = parsedInput.description;
				oldValues.description = currentTicket.description;
				newValues.description = parsedInput.description;
			}

			if (parsedInput.ticket_type !== undefined) {
				updateData.ticket_type = parsedInput.ticket_type as TicketType;
				oldValues.ticket_type = currentTicket.ticket_type;
				newValues.ticket_type = parsedInput.ticket_type;
			}

			if (parsedInput.priority !== undefined) {
				updateData.priority = parsedInput.priority as TicketPriority;
				oldValues.priority = currentTicket.priority;
				newValues.priority = parsedInput.priority;
			}

			if (parsedInput.status !== undefined) {
				updateData.status = parsedInput.status as TicketStatus;
				oldValues.status = currentTicket.status;
				newValues.status = parsedInput.status;
			}

			if (parsedInput.assigned_to !== undefined) {
				updateData.assigned_to = parsedInput.assigned_to;
				oldValues.assigned_to = currentTicket.assigned_to;
				newValues.assigned_to = parsedInput.assigned_to;
			}

			if (parsedInput.is_executive !== undefined) {
				updateData.is_executive = parsedInput.is_executive;
				oldValues.is_executive = currentTicket.is_executive;
				newValues.is_executive = parsedInput.is_executive;
			}

			if (parsedInput.client_id !== undefined) {
				updateData.client_id = parsedInput.client_id;
				oldValues.client_id = currentTicket.client_id;
				newValues.client_id = parsedInput.client_id;
			}

			if (parsedInput.reminder_date !== undefined) {
				updateData.reminder_date = parsedInput.reminder_date;
				oldValues.reminder_date = currentTicket.reminder_date;
				newValues.reminder_date = parsedInput.reminder_date;
			}

			// Determine change type based on what fields are being updated
			const updatedFields = Object.keys(newValues);
			if (updatedFields.length === 1) {
				if (updatedFields.includes('title')) changeType = 'title';
				else if (updatedFields.includes('description')) changeType = 'description';
				else if (updatedFields.includes('status')) changeType = 'status';
				else if (updatedFields.includes('priority')) changeType = 'priority';
				else if (updatedFields.includes('assigned_to')) changeType = 'assignment';
				else if (updatedFields.includes('client_id')) changeType = 'client';
				else if (updatedFields.includes('ticket_type')) changeType = 'type';
				else if (updatedFields.includes('reminder_date')) changeType = 'due_date';
			}

			// For title and description changes, check if there's a recent similar change within 5 minutes
			let shouldSkipAuditLog = false;
			if ((changeType === 'title' || changeType === 'description')) {
				const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
				
				const { data: recentChanges } = await supabase
					.from('audit_log')
					.select('id')
					.eq('record_id', parsedInput.ticketId)
					.eq('table_name', 'tickets')
					.eq('action', 'UPDATE')
					.eq('changed_by', session.user.id)
					.eq('change_type', changeType)
					.gte('changed_at', fiveMinutesAgo)
					.limit(1);

				shouldSkipAuditLog = !!(recentChanges && recentChanges.length > 0);
			}

			// Add updated_at timestamp
			updateData.updated_at = new Date().toISOString();

			// Update the ticket
			const { data: updatedTicket, error: updateError } = await supabase
				.from("tickets")
				.update(updateData)
				.eq("id", parsedInput.ticketId)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating ticket:", updateError);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to update ticket. Please try again."],
				});
			}

			// Log the update in audit_log (skip if this is a frequent title/description change)
			if (!shouldSkipAuditLog) {
				const { error: auditError } = await supabase
					.from("audit_log")
					.insert({
						action: "UPDATE",
						changed_at: new Date().toISOString(),
						changed_by: session.user.id,
						client_id: currentTicket.client_id,
						record_id: parsedInput.ticketId,
						table_name: "tickets",
						new_values: newValues,
						old_values: oldValues,
						change_type: changeType,
					});

				if (auditError) {
					console.error("Error logging audit:", auditError);
					// Don't fail the ticket update if audit logging fails
				}
			}

			return {
				success: "Ticket updated successfully",
				ticket: updatedTicket,
			};
		} catch (error) {
			console.error("Error updating ticket:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to update ticket. Please try again."],
			});
		}
	}); 