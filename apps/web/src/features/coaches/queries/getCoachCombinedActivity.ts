"use server";

import { createClient } from "@/utils/supabase/server";

import type {
	AuditLog,
	CoachActivityItem,
	CoachComment,
} from "@/features/shared/types/activity";

// Helper to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
}

export async function getCoachCombinedActivity(
	coachId: string,
): Promise<CoachActivityItem[]> {
	const supabase = await createClient();

	// Only fetch audit logs if coachId is a valid UUID format
	// Better Auth uses text-based IDs that won't work with UUID columns
	const shouldFetchAuditLogs = isValidUUID(coachId);

	// Fetch both audit logs and comments in parallel
	const [auditLogsResult, commentsResult] = await Promise.all([
		shouldFetchAuditLogs
			? supabase
					.from("audit_log")
					.select("*")
					.eq("record_id", coachId)
					.eq("table_name", "user")
					.order("changed_at", { ascending: true })
			: Promise.resolve({ data: [], error: null }),
		supabase
			.from("coach_comments")
			.select(`
				*,
				user!coach_comments_user_id_fkey (
					id,
					name,
					email,
					image
				)
			`)
			.eq("coach_id", coachId)
			.order("created_at", { ascending: true }),
	]);

	// Handle audit logs error gracefully - log but don't throw
	if (auditLogsResult.error) {
		console.error(
			"Error fetching coach audit logs (skipping audit logs):",
			auditLogsResult.error,
		);
	}

	if (commentsResult.error) {
		console.error("Error fetching coach comments:", commentsResult.error);
		throw new Error("Failed to fetch coach comments");
	}

	const combinedData: CoachActivityItem[] = [];

	// Add audit logs only if successful
	if (!auditLogsResult.error && auditLogsResult.data) {
		// Get unique user IDs from audit logs for batch lookup
		const userIds = Array.from(
			new Set(
				auditLogsResult.data
					.map((log) => log.changed_by)
					.filter((id): id is string => id !== null),
			),
		);

		// Fetch user data for all unique IDs
		const { data: users } = await supabase
			.from("user")
			.select("id, name, email, image")
			.in("id", userIds);

		const userMap = new Map(users?.map((user) => [user.id, user]) || []);

		auditLogsResult.data.forEach((log) => {
			const logWithUser = {
				...log,
				changed_by_user: log.changed_by ? userMap.get(log.changed_by) : null,
			} as AuditLog;

			combinedData.push({
				id: log.id,
				type: "activity",
				timestamp: log.changed_at || "",
				data: logWithUser,
			});
		});
	}

	// Add comments
	(commentsResult.data || []).forEach((comment) => {
		combinedData.push({
			id: comment.id,
			type: "comment",
			timestamp: comment.created_at || "",
			data: comment as CoachComment,
		});
	});

	// Sort by timestamp (oldest first)
	combinedData.sort((a, b) => {
		const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
		const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
		return dateA - dateB;
	});

	return combinedData;
}
