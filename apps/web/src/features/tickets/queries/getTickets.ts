"use server";

import type { Database } from "@/utils/supabase/database.types";
import { createClient } from "@/utils/supabase/server";

import type { FiltersState } from "@/components/data-table-filter/core/types";
import { getReminderStatus } from "../utils/reminder-helpers";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
	created_by_user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	} | null;
	assigned_to_user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		role: string | null;
	} | null;
	client: {
		id: string;
		first_name: string | null;
		last_name: string | null;
		email: string | null;
	} | null;
};

export async function getTickets(
	assignedToUserId?: string,
	filters?: FiltersState,
	excludeAdminTickets?: boolean,
	sortByReminder?: boolean,
	userRole?: string,
): Promise<Ticket[]> {
	const supabase = await createClient();

	let query = supabase
		.from("tickets")
		.select(`
			*,
			created_by_user:user!tickets_created_by_fkey(
				id,
				name,
				email,
				image
			),
			assigned_to_user:user!tickets_assigned_to_fkey(
				id,
				name,
				email,
				image,
				role
			),
			client:clients(
				id,
				first_name,
				last_name,
				email
			)
		`);
		
	// Apply sorting - we'll handle reminder sorting after fetching data
	query = query.order("created_at", { ascending: false });

	// Coach-specific filtering: show tickets for clients assigned to them
	// This applies when either:
	// 1. assignedToUserId is provided (My Tickets page)
	// 2. userRole is coach/premiereCoach (need to get current user ID separately)
	if (assignedToUserId && (userRole === "coach" || userRole === "premiereCoach")) {
		console.log("Coach filtering activated for:", { assignedToUserId, userRole });
		
		// Get client IDs based on role
		let clientIds: string[] = [];

		if (userRole === "coach") {
			// Regular coach: get their active client assignments
			const { data: assignments, error: assignmentsError } = await supabase
				.from("client_assignments")
				.select("client_id")
				.eq("user_id", assignedToUserId)
				.or("end_date.is.null,end_date.gte.now()");

			if (assignmentsError) {
				console.error("Error fetching client assignments:", assignmentsError);
				throw new Error("Failed to fetch client assignments");
			}

			clientIds = assignments?.map(a => a.client_id) || [];
		} else if (userRole === "premiereCoach") {
			// Premiere coach: get all team members' client assignments
			// Use Promise.all for parallel queries for better performance
			const [teamCoachesResult, ownAssignmentsResult] = await Promise.all([
				// Get all coaches under this premiere coach
				supabase
					.from("coach_teams")
					.select("coach_id")
					.eq("premier_coach_id", assignedToUserId)
					.or("end_date.is.null,end_date.gte.now()"),
				// Get the premiere coach's own assignments
				supabase
					.from("client_assignments")
					.select("client_id")
					.eq("user_id", assignedToUserId)
					.or("end_date.is.null,end_date.gte.now()")
			]);

			if (teamCoachesResult.error) {
				console.error("Error fetching coach teams:", teamCoachesResult.error);
				throw new Error("Failed to fetch coach teams");
			}

			if (ownAssignmentsResult.error) {
				console.error("Error fetching own assignments:", ownAssignmentsResult.error);
				throw new Error("Failed to fetch own assignments");
			}

			// If there are team coaches, get their assignments too
			if (teamCoachesResult.data && teamCoachesResult.data.length > 0) {
				const teamCoachIds = teamCoachesResult.data.map(t => t.coach_id);
				
				const { data: teamAssignments, error: teamAssignmentsError } = await supabase
					.from("client_assignments")
					.select("client_id")
					.in("user_id", teamCoachIds)
					.or("end_date.is.null,end_date.gte.now()");

				if (teamAssignmentsError) {
					console.error("Error fetching team assignments:", teamAssignmentsError);
					throw new Error("Failed to fetch team assignments");
				}

				// Combine all client IDs
				const ownClientIds = ownAssignmentsResult.data?.map(a => a.client_id) || [];
				const teamClientIds = teamAssignments?.map(a => a.client_id) || [];
				clientIds = [...ownClientIds, ...teamClientIds];
			} else {
				// No team coaches, just use own assignments
				clientIds = ownAssignmentsResult.data?.map(a => a.client_id) || [];
			}
		}

		// Apply filter to show tickets for their clients OR assigned to them
		if (clientIds.length > 0) {
			// Remove duplicates
			const uniqueClientIds = [...new Set(clientIds)];
			// Show tickets that are either:
			// 1. For their clients (client_id in uniqueClientIds)
			// 2. Directly assigned to them (assigned_to = assignedToUserId)
			query = query.or(`client_id.in.(${uniqueClientIds.join(",")}),assigned_to.eq.${assignedToUserId}`);
		} else {
			// No clients found, but still show tickets assigned to them
			query = query.eq("assigned_to", assignedToUserId);
		}
	} else if (assignedToUserId && (!userRole || userRole === "user")) {
		// For non-coach roles, filter by assigned_to as before
		query = query.eq("assigned_to", assignedToUserId);
	}

	// Apply filters
	if (filters && filters.length > 0) {
		filters.forEach((filter) => {
			const filterValues = filter.values;
			if (filterValues && filterValues.length > 0) {
				switch (filter.columnId) {
					case "status":
						query = query.in("status", filterValues);
						break;
					case "priority":
						query = query.in("priority", filterValues);
						break;
					case "type":
						query = query.in("ticket_type", filterValues);
						break;
					case "assignee":
						query = query.in("assigned_to", filterValues);
						break;
					case "client":
						query = query.in("client_id", filterValues);
						break;
					case "reminder": {
						// Handle reminder status filtering
						const now = new Date();
						const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
						const todayEnd = new Date(today);
						todayEnd.setDate(todayEnd.getDate() + 1);
						
						if (filterValues.includes("overdue")) {
							query = query.lt("reminder_date", today.toISOString())
								.neq("status", "resolved")
								.neq("status", "closed");
						}
						if (filterValues.includes("due-today")) {
							query = query.gte("reminder_date", today.toISOString())
								.lt("reminder_date", todayEnd.toISOString())
								.neq("status", "resolved")
								.neq("status", "closed");
						}
						if (filterValues.includes("upcoming")) {
							query = query.gte("reminder_date", todayEnd.toISOString())
								.neq("status", "resolved")
								.neq("status", "closed");
						}
						if (filterValues.includes("no-reminder")) {
							query = query.is("reminder_date", null);
						}
						break;
					}
				}
			}
			// Handle text filters
			if (
				filter.columnId === "title" &&
				filter.operator === "contains" &&
				filter.values?.[0]
			) {
				query = query.ilike("title", `%${filter.values[0]}%`);
			}
		});
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching tickets:", error);
		throw new Error("Failed to fetch tickets");
	}

	let tickets = data || [];

	// Filter out executive tickets for users without executive_read permission
	if (excludeAdminTickets) {
		tickets = tickets.filter(
			(ticket) => !ticket.is_executive
		);
	}

	// Apply reminder-based sorting if requested
	if (sortByReminder) {
		tickets = tickets.sort((a, b) => {
			const aStatus = getReminderStatus(a);
			const bStatus = getReminderStatus(b);

			// Only prioritize overdue and due-today reminders
			const aIsActionable = aStatus === "overdue" || aStatus === "due-today";
			const bIsActionable = bStatus === "overdue" || bStatus === "due-today";

			// Prioritize actionable reminders
			if (aIsActionable && !bIsActionable) return -1;
			if (!aIsActionable && bIsActionable) return 1;

			// If both are actionable reminders, sort by priority (overdue > due-today)
			if (aIsActionable && bIsActionable) {
				if (aStatus === "overdue" && bStatus === "due-today") return -1;
				if (aStatus === "due-today" && bStatus === "overdue") return 1;
				
				// If same status, sort by reminder date (ascending)
				if (a.reminder_date && b.reminder_date) {
					const aDate = new Date(a.reminder_date);
					const bDate = new Date(b.reminder_date);
					const dateDiff = aDate.getTime() - bDate.getTime();
					if (dateDiff !== 0) return dateDiff;
				}
			}

			// For all other cases, sort by created_at (descending - most recent first)
			if (a.created_at && b.created_at) {
				const aCreated = new Date(a.created_at);
				const bCreated = new Date(b.created_at);
				return bCreated.getTime() - aCreated.getTime();
			}
			
			return 0;
		});
	}

	return tickets;
}
