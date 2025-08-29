"use server";

import { createClient } from "@/utils/supabase/server";

// Get basic coach information with user and team details
export async function getCoachBasicInfo(id: string) {
	try {
		const supabase = await createClient();

		const { data: coach, error } = await supabase
			.from("team_members")
			.select(
				`
				*,
				user:user!team_members_user_id_fkey (
					id,
					email,
					image,
					name,
					role
				),
				team:coach_teams!team_members_team_id_fkey (
					id,
					premier_coach:team_members!coach_teams_premier_coach_id_fkey (
						id,
						name
					)
				)
			`,
			)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching coach basic info:", error);
			return null;
		}

		return coach;
	} catch (error) {
		console.error("Unexpected error in getCoachBasicInfo:", error);
		return null;
	}
}

// Get coach's client assignments with client details and payment plans
export async function getCoachClientAssignments(coachId: string) {
	try {
		const supabase = await createClient();

		const { data: clientAssignments, error } = await supabase
			.from("client_assignments")
			.select(
				`
				id,
				assignment_type,
				start_date,
				end_date,
				client:clients!client_assignments_client_id_fkey (
					id,
					name,
					email,
					payment_plans (
						id,
						name,
						term_start_date,
						term_end_date,
						total_amount,
						total_amount_paid,
						type,
						platform,
						subscription_id,
						notes,
						created_at,
						updated_at
					)
				)
			`,
			)
			.eq("coach_id", coachId)
			.order("start_date", { ascending: false });

		if (error) {
			console.error("Error fetching client assignments:", error);
			return [];
		}

		// Process client assignments to include sorted payment plans
		const processedAssignments =
			clientAssignments?.map((assignment) => ({
				...assignment,
				client: assignment.client
					? {
							...assignment.client,
							payment_plans: assignment.client.payment_plans?.sort(
								(a, b) =>
									new Date(a.term_start_date).getTime() -
									new Date(b.term_start_date).getTime(),
							),
						}
					: null,
			})) || [];

		return processedAssignments;
	} catch (error) {
		console.error("Unexpected error in getCoachClientAssignments:", error);
		return [];
	}
}

// Get coach's payment history with client counts
export async function getCoachPayments(coachId: string) {
	try {
		const supabase = await createClient();

		// Fetch coach payments
		const { data: coachPayments, error: paymentsError } = await supabase
			.from("coach_payments")
			.select(
				`
				id,
				amount,
				status,
				date,
				created_at,
				updated_at
			`,
			)
			.eq("coach_id", coachId)
			.order("date", { ascending: false });

		if (paymentsError) {
			console.error("Error fetching coach payments:", paymentsError);
			return [];
		}

		// Fetch client assignments for this coach to calculate counts
		const { data: clientAssignments, error: assignmentsError } = await supabase
			.from("client_assignments")
			.select(
				`
				id,
				start_date,
				end_date,
				client:clients!client_assignments_client_id_fkey (
					id,
					overall_status
				)
			`,
			)
			.eq("coach_id", coachId);

		if (assignmentsError) {
			console.error(
				"Error fetching client assignments for counts:",
				assignmentsError,
			);
		}

		// Process payments with client counts
		const processedPayments =
			coachPayments?.map((payment) => {
				// Simply count all assignments for this coach
				const totalClients = clientAssignments?.length || 0;
				const totalActiveClients =
					clientAssignments?.filter(
						(assignment) => assignment.client?.overall_status === "live",
					).length || 0;
				return {
					id: (payment as any).id,
					date: (payment as any).date || (payment as any).created_at,
					total_clients: totalClients,
					total_active_clients: totalActiveClients,
					status: (payment as any).status || "Not Paid",
				};
			}) || [];

		return processedPayments;
	} catch (error) {
		console.error("Unexpected error in getCoachPayments:", error);
		return [];
	}
}

// Legacy function - combines all data (kept for backward compatibility)
export async function getCoach(id: string) {
	try {
		const [coach, clientAssignments, coachPayments] = await Promise.all([
			getCoachBasicInfo(id),
			getCoachClientAssignments(id),
			getCoachPayments(id),
		]);

		if (!coach) {
			return null;
		}

		return {
			...coach,
			client_assignments: clientAssignments,
			coach_payments: coachPayments,
		};
	} catch (error) {
		console.error("Unexpected error in getCoach:", error);
		return null;
	}
}
