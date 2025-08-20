"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	ticketId: z.string().uuid("Invalid ticket ID"),
	comment: z.string().min(1, "Comment cannot be empty").max(5000, "Comment is too long"),
	isInternal: z.boolean().optional().default(false),
});

export const createTicketComment = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { ticketId, comment, isInternal } }) => {
		try {
			// Get current user
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to comment."],
				});
			}

			const supabase = await createClient();

			// Verify ticket exists
			const { data: ticket, error: ticketError } = await supabase
				.from("tickets")
				.select("id")
				.eq("id", ticketId)
				.single();

			if (ticketError || !ticket) {
				return returnValidationErrors(inputSchema, {
					ticketId: { _errors: ["Ticket not found"] },
				});
			}

			// Create comment
			const { data: newComment, error: commentError } = await supabase
				.from("ticket_comments")
				.insert({
					ticket_id: ticketId,
					user_id: session.user.id,
					comment: comment.trim(),
					is_internal: isInternal,
				})
				.select(`
					*,
					user:user_id (
						id,
						name,
						email,
						image
					)
				`)
				.single();

			if (commentError) {
				console.error("Error creating comment:", commentError);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to create comment. Please try again."],
				});
			}

			return {
				success: "Comment added successfully",
				comment: newComment,
			};
		} catch (error) {
			console.error("Unexpected error creating comment:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred. Please try again."],
			});
		}
	});