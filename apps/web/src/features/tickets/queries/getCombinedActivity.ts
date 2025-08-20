"use server";

import { createClient } from "@/utils/supabase/server";
import type { CombinedActivityItem, AuditLog, TicketComment } from "@/features/shared/types/activity";

export async function getCombinedActivity(
	ticketId: string,
): Promise<CombinedActivityItem[]> {
	const supabase = await createClient();
	// Fetch both audit logs and comments in parallel
	const [auditLogsResult, commentsResult] = await Promise.all([
		supabase
			.from("audit_log")
			.select(`
				*,
				changed_by_user:user!audit_log_changed_by_fkey(
					id,
					name,
					email,
					image
				)
			`)
			.eq("record_id", ticketId)
			.eq("table_name", "tickets")
			.order("changed_at", { ascending: true }),
		supabase
			.from("ticket_comments")
			.select(`
				*,
				user:user_id (
					id,
					name,
					email,
					image
				)
			`)
			.eq("ticket_id", ticketId)
			.order("created_at", { ascending: true }),
	]);

	if (auditLogsResult.error) {
		console.error("Error fetching audit logs:", auditLogsResult.error);
		throw new Error("Failed to fetch audit logs");
	}

	if (commentsResult.error) {
		console.error("Error fetching comments:", commentsResult.error);
		throw new Error("Failed to fetch comments");
	}

	const combinedData: CombinedActivityItem[] = [];

	// Add audit logs
	(auditLogsResult.data || []).forEach((log) => {
		combinedData.push({
			id: log.id,
			type: "activity",
			timestamp: log.changed_at || "",
			data: log as AuditLog,
		});
	});

	// Add comments
	(commentsResult.data || []).forEach((comment) => {
		combinedData.push({
			id: comment.id,
			type: "comment",
			timestamp: comment.created_at || "",
			data: comment as TicketComment,
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
