"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	coachId: z.string().min(1, "Coach ID is required"),
	comment: z.string().min(1, "Comment cannot be empty").max(5000, "Comment is too long"),
	isInternal: z.boolean().optional().default(false),
});

export const createCoachComment = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput: { coachId, comment, isInternal } }) => {
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

			// Verify coach exists
			const { data: coach, error: coachError } = await supabase
				.from("user")
				.select("id")
				.eq("id", coachId)
				.single();

			if (coachError || !coach) {
				return returnValidationErrors(inputSchema, {
					coachId: { _errors: ["Coach not found"] },
				});
			}

			// Create comment
			const { data: newComment, error: commentError } = await supabase
				.from("coach_comments")
				.insert({
					coach_id: coachId,
					user_id: session.user.id,
					comment: comment.trim(),
					is_internal: isInternal,
				})
				.select(`
					*,
					user!coach_comments_user_id_fkey (
						id,
						name,
						email,
						image
					)
				`)
				.single();

			if (commentError) {
				console.error("Error creating coach comment:", commentError);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to create comment. Please try again."],
				});
			}

			return {
				success: "Comment added successfully",
				comment: newComment,
			};
		} catch (error) {
			console.error("Unexpected error creating coach comment:", error);
			return returnValidationErrors(inputSchema, {
				_errors: ["An unexpected error occurred. Please try again."],
			});
		}
	});