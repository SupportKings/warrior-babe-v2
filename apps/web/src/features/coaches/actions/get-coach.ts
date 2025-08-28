"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Retrieve a coach's basic record from team_members, including related user and team data.
 *
 * Returns the team_members row for the given id with nested:
 * - `user` (id, email, image, name, role)
 * - `team` (id) and its `premier_coach` (id, name)
 *
 * @param id - The team_members id of the coach to fetch
 * @returns The coach object with nested `user` and `team` fields, or `null` if not found or on error
 */
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
			`
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

/**
 * Fetches a coach's client assignments including client details and their payment plans.
 *
 * Returns each assignment with a nested `client` object; when present, the client's
 * `payment_plans` are sorted by `term_start_date` ascending.
 *
 * @param coachId - The coach's identifier used to filter assignments.
 * @returns An array of client assignment records (each may include `client` and
 *          a sorted `payment_plans` array). Returns an empty array on error.
 */
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
			`
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
                  new Date(b.term_start_date).getTime()
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

/**
 * Retrieve a coach's payment records and augment each with client counts.
 *
 * Fetches payments for the given coach (ordered newest first) and counts the coach's total clients and active clients (clients with `overall_status === "live"`). Returns an array of payment summaries; on any error the function returns an empty array.
 *
 * @param coachId - The coach's identifier used to filter payments and assignments
 * @returns An array of payment summary objects with the shape:
 *   - id: payment id
 *   - date: payment date (falls back to `created_at` when `date` is missing)
 *   - total_clients: total number of client assignments for the coach
 *   - total_active_clients: number of assigned clients whose `overall_status` is `"live"`
 *   - status: payment status (defaults to `"Not Paid"` when missing)
 */
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
			`
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
			`
      )
      .eq("coach_id", coachId);

    if (assignmentsError) {
      console.error(
        "Error fetching client assignments for counts:",
        assignmentsError
      );
    }


    // Process payments with client counts
    const processedPayments =
      coachPayments?.map((payment) => {
        // Simply count all assignments for this coach
        const totalClients = clientAssignments?.length || 0;
        const totalActiveClients =
          clientAssignments?.filter(
            (assignment) => assignment.client?.overall_status === "live"
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

/**
 * Fetches and aggregates a coach's basic info, client assignments, and payments into a single legacy-shaped object.
 *
 * Uses the newer helper functions to fetch basic coach data, client assignments, and payments in parallel and
 * returns a merged object containing the coach record plus `client_assignments` and `coach_payments`.
 *
 * @param id - The coach's identifier.
 * @returns The aggregated coach object with `client_assignments` and `coach_payments`, or `null` if the coach is not found or an error occurs.
 */
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

