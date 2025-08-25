import type { Database } from "@/utils/supabase/database.types";

// Base audit log type with user information
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"] & {
	changed_by_user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	} | null;
};

// Generic activity item that can represent any entity's activity
export type ActivityItem<T = AuditLog> = {
	id: string;
	type: "activity" | "comment" | "client";
	timestamp: string;
	data: T;
};

// Specific activity item types for different entities
export type TicketActivityItem = ActivityItem<AuditLog>;
export type CoachActivityItem = ActivityItem<AuditLog>;

// Legacy type for backward compatibility
export type CombinedActivityItem = TicketActivityItem;
