"use server";

import { createClient } from "@/utils/supabase/server";

import type { FiltersState } from "@/components/data-table-filter/core/types";

import { getSystemSetting } from "../../system-settings/queries/server-queries";
import { getSettingValue } from "../../system-settings/utils/parse-setting";
import { calculateNPSFromDistribution, calculateNPSFromScores } from "../utils/calculateNPS";
import type {
	CoachMetrics,
	CoachPerformance,
	CoachRenewalRate,
	CoachTableRow,
	CoachWorkload,
} from "../types/coach";
import type {
	CoachClient,
	CoachPerformanceData,
	CoachProfile,
	CoachTeamMember,
} from "../types/coach-profile";

// Get all coaches with their capacity and client count
export async function getAllCoaches(
	filters?: FiltersState,
	teamFilter?: { premiereCoachId: string },
): Promise<CoachTableRow[]> {
	const supabase = await createClient();

	// Get global default client units setting
	const globalDefaultSetting = await getSystemSetting(
		"global_default_client_units_per_coach",
	);
	const globalDefaultClientUnits = getSettingValue(globalDefaultSetting, 20); // fallback to 20

	let coaches: any[] = [];

	if (teamFilter) {
		// Get team member IDs first
		const { data: teamData } = await supabase
			.from("coach_teams")
			.select("coach_id")
			.eq("premier_coach_id", teamFilter.premiereCoachId)
			.is("end_date", null);

		const teamMemberIds = teamData?.map((t) => t.coach_id) || [];
		
		if (teamMemberIds.length === 0) {
			return [];
		}

		// Get coaches with their capacity (exclude banned users)
		const { data: teamCoaches, error: coachError } = await supabase
			.from("user")
			.select(`
				*,
				coach_capacity (
					max_client_units,
					is_paused
				)
			`)
			.in("id", teamMemberIds)
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;
		coaches = teamCoaches || [];
	} else {
		// Get all users with coach or premiereCoach role (exclude banned users)
		const { data: allCoaches, error: coachError } = await supabase
			.from("user")
			.select(`
				*,
				coach_capacity (
					max_client_units,
					is_paused
				)
			`)
			.in("role", ["coach", "premiereCoach"])
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;
		coaches = allCoaches || [];
	}

	// Get client assignments for the filtered coaches
	const filteredCoachIds = coaches.map((coach) => coach.id);
	const { data: assignments, error: assignmentError } = await supabase
		.from("client_assignments")
		.select("user_id, client_id")
		.in("user_id", filteredCoachIds)
		.is("end_date", null);

	if (assignmentError) throw assignmentError;

	// Get premier coach relationships
	const { data: coachTeams, error: premierError } = await supabase
		.from("coach_teams")
		.select(`
			coach_id,
			premier_coach_id,
			premier_coach:user!coach_teams_premier_coach_id_fkey (
				id,
				name,
				email,
				image
			)
		`)
		.is("end_date", null);

	if (premierError) throw premierError;

	// Map regular coaches to their premier coaches
	const premierCoachMap = new Map<string, any>();
	coachTeams?.forEach((ct) => {
		premierCoachMap.set(ct.coach_id, ct.premier_coach);
	});

	// Count clients per coach
	const clientCountMap = new Map<string, number>();
	const coachClientMap = new Map<string, string[]>();

	assignments?.forEach((assignment) => {
		const count = clientCountMap.get(assignment.user_id) || 0;
		clientCountMap.set(assignment.user_id, count + 1);

		// Also track client IDs per coach
		const clients = coachClientMap.get(assignment.user_id) || [];
		clients.push(assignment.client_id);
		coachClientMap.set(assignment.user_id, clients);
	});

	// Get call feedback for rating calculation
	const { data: callFeedback } = await supabase
		.from("call_feedback")
		.select("client_id, rating")
		.not("rating", "is", null);

	// Calculate ratings per coach based on their clients' feedback
	const coachRatingMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const clientFeedback =
			callFeedback?.filter((fb) => coachClients.includes(fb.client_id)) || [];

		if (clientFeedback.length > 0) {
			const avgRating =
				clientFeedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
				clientFeedback.length;
			coachRatingMap.set(coach.id, avgRating);
		}
	});

	// Get NPS scores for satisfaction calculation
	const { data: npsScores } = await supabase
		.from("client_nps")
		.select("client_id, nps_score");

	// Calculate satisfaction per coach
	const coachSatisfactionMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const clientNpsScores =
			npsScores?.filter((nps) => coachClients.includes(nps.client_id)) || [];

		if (clientNpsScores.length > 0) {
			const avgNps =
				clientNpsScores.reduce((sum, nps) => sum + nps.nps_score, 0) /
				clientNpsScores.length;
			// Convert NPS (0-10) to percentage (0-100)
			coachSatisfactionMap.set(coach.id, Math.round(avgNps * 10));
		}
	});

	// Calculate actual NPS score per coach
	const coachAvgNPSMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const clientNpsScores =
			npsScores?.filter((nps) => coachClients.includes(nps.client_id)) || [];

		if (clientNpsScores.length > 0) {
			// Extract the raw scores and calculate actual NPS
			const scores = clientNpsScores.map(nps => nps.nps_score);
			const npsResult = calculateNPSFromScores(scores);
			// Store actual NPS score (-100 to +100)
			coachAvgNPSMap.set(coach.id, npsResult.score);
		}
	});

	// Get open tickets count per coach
	const { data: tickets } = await supabase
		.from("tickets")
		.select("client_id, status")
		.in("status", ["open", "in_progress"]);

	const coachOpenTicketsMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const openTickets =
			tickets?.filter((ticket) =>
				coachClients.includes(ticket.client_id || ""),
			) || [];
		coachOpenTicketsMap.set(coach.id, openTickets.length);
	});

	// Calculate renewal rate per coach
	const { data: clients } = await supabase
		.from("clients")
		.select("id, start_date, end_date, renewal_date, churned_at");

	const coachRenewalRateMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const coachClientData =
			clients?.filter((c) => coachClients.includes(c.id)) || [];

		// Filter clients eligible for renewal (term has ended)
		const now = new Date();
		const eligibleForRenewal = coachClientData.filter((c) => {
			if (!c.end_date) return false;
			const endDate = new Date(c.end_date);
			return endDate < now;
		});

		if (eligibleForRenewal.length > 0) {
			// Count renewed clients
			const renewed = eligibleForRenewal.filter((c) => {
				// Client renewed if they have a renewal_date or no churned_at date
				return c.renewal_date || !c.churned_at;
			}).length;

			const renewalRate = Math.round(
				(renewed / eligibleForRenewal.length) * 100,
			);
			coachRenewalRateMap.set(coach.id, renewalRate);
		} else {
			// No clients eligible for renewal yet
			coachRenewalRateMap.set(coach.id, 0);
		}
	});

	// Get client units for active clients
	const { data: clientUnits } = await supabase
		.from("client_units")
		.select(`
			client_id,
			coach_id,
			calculated_units,
			clients!inner(
				id,
				status
			)
		`)
		.eq("clients.status", "active")
		.in("coach_id", coaches?.map((c) => c.id) || []);

	// Calculate total client units per coach
	const coachTotalUnitsMap = new Map<string, number>();
	
	// Add up all calculated units per coach
	clientUnits?.forEach(unit => {
		if (unit.coach_id && unit.clients?.status === "active") {
			const current = coachTotalUnitsMap.get(unit.coach_id) || 0;
			coachTotalUnitsMap.set(unit.coach_id, current + unit.calculated_units);
		}
	});

	// Get goals data for goals hit rate calculation
	const { data: clientGoals } = await supabase
		.from("client_goals")
		.select("client_id, status")
		.in("client_id", assignments?.map((a) => a.client_id) || []);

	// Calculate goals hit rate per coach
	const coachGoalsHitRateMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const coachGoals =
			clientGoals?.filter((goal) => coachClients.includes(goal.client_id)) ||
			[];

		if (coachGoals.length > 0) {
			// Consider goals with status 'completed' as hit
			const completedGoals = coachGoals.filter(
				(goal) => goal.status === "completed",
			).length;
			const hitRate = Math.round((completedGoals / coachGoals.length) * 100);
			coachGoalsHitRateMap.set(coach.id, hitRate);
		} else {
			// No goals set yet
			coachGoalsHitRateMap.set(coach.id, 0);
		}
	});

	// Get specializations for all coaches
	const coachIds = coaches?.map((c) => c.id) || [];
	const { data: userSpecializations } = await supabase
		.from("user_specializations")
		.select(`
			user_id,
			is_primary,
			specialization:specializations(name, icon)
		`)
		.in("user_id", coachIds)
		.eq("is_primary", true);

	// Get certifications for all coaches
	const { data: userCertifications } = await supabase
		.from("user_certifications")
		.select(`
			user_id,
			verified,
			certification:certifications(
				id,
				name,
				icon
			)
		`)
		.in("user_id", coachIds);

	// Map specializations and certifications
	const specializationMap = new Map<
		string,
		{ name: string; icon: string | null }
	>();
	userSpecializations?.forEach((spec) => {
		if (spec.specialization?.name) {
			specializationMap.set(spec.user_id, {
				name: spec.specialization.name,
				icon: spec.specialization.icon || null,
			});
		}
	});

	const certificationsMap = new Map<string, any[]>();
	userCertifications?.forEach((cert) => {
		if (!certificationsMap.has(cert.user_id)) {
			certificationsMap.set(cert.user_id, []);
		}
		if (cert.certification) {
			certificationsMap.get(cert.user_id)?.push({
				...cert.certification,
				verified: cert.verified,
			});
		}
	});

	// Transform data into table rows
	let coachRows = (coaches || []).map((coach) => ({
		id: coach.id,
		name: coach.name,
		email: coach.email,
		image: coach.image,
		role: coach.role || "coach",
		type:
			coach.role === "premiereCoach"
				? ("Premier" as const)
				: ("Regular" as const),
		specialization: specializationMap.get(coach.id) || {
			name: "-",
			icon: null,
		},
		certifications: certificationsMap.get(coach.id) || [],
		activeClients: clientCountMap.get(coach.id) || 0,
		rating: coachRatingMap.get(coach.id) || 0,
		currentCapacity: clientCountMap.get(coach.id) || 0,
		maxCapacity:
			coach.coach_capacity?.max_client_units || globalDefaultClientUnits,
		status: coach.coach_capacity?.is_paused
			? ("Paused" as const)
			: ("Active" as const),
		lastActivity: new Date().toISOString(), // MOCK DATA: Could be enhanced with real activity tracking
		satisfaction: coachSatisfactionMap.get(coach.id) || 0,
		premierCoach: premierCoachMap.get(coach.id) || undefined,
		// New metrics
		goalsHitRate: coachGoalsHitRateMap.get(coach.id) || 0,
		openTickets: coachOpenTicketsMap.get(coach.id) || 0,
		renewalRate: coachRenewalRateMap.get(coach.id) || 0,
		averageNPS: coachAvgNPSMap.get(coach.id) || 0,
		totalUnits: coachTotalUnitsMap.get(coach.id) || 0,
	}));

	// Apply filters if provided
	if (filters && filters.length > 0) {
		filters.forEach((filter) => {
			const filterValues = filter.values;
			if (filterValues && filterValues.length > 0) {
				switch (filter.columnId) {
					case "type":
						coachRows = coachRows.filter((coach) =>
							filterValues.includes(coach.type),
						);
						break;
					case "specialization":
						coachRows = coachRows.filter((coach) => {
							const specializationName =
								typeof coach.specialization === "string"
									? coach.specialization
									: coach.specialization.name;
							return filterValues.includes(specializationName);
						});
						break;
					case "certifications":
						coachRows = coachRows.filter((coach) =>
							coach.certifications.some((cert) =>
								filterValues.includes(cert.name),
							),
						);
						break;
					case "activeClients":
						// Handle active clients filter - single value or range
						if (filter.operator === "is" && filterValues.length === 1) {
							const value = Number(filterValues[0]);
							coachRows = coachRows.filter(
								(coach) => coach.activeClients === value,
							);
						} else if (
							(filter.operator === "between" ||
								filter.operator === "is between") &&
							filterValues.length === 2
						) {
							const [min, max] = filterValues.map(Number);
							coachRows = coachRows.filter(
								(coach) =>
									coach.activeClients >= min && coach.activeClients <= max,
							);
						}
						break;
				}
			}
			// Handle text filters
			if (
				filter.columnId === "name" &&
				filter.operator === "contains" &&
				filter.values?.[0]
			) {
				coachRows = coachRows.filter((coach) =>
					coach.name.toLowerCase().includes(filter.values[0].toLowerCase()),
				);
			}
		});
	}

	return coachRows;
}

// Get coach metrics for KPI boxes
export async function getCoachMetrics(teamFilter?: {
	premiereCoachId: string;
}): Promise<CoachMetrics> {
	const supabase = await createClient();

	// Get coach IDs to filter by
	let coachIds: string[] = [];
	let uniquePremierCoaches = new Set<string>();

	if (teamFilter) {
		// Get team member IDs for the premier coach
		const { data: teamMembers, error: teamError } = await supabase
			.from("coach_teams")
			.select("coach_id")
			.eq("premier_coach_id", teamFilter.premiereCoachId)
			.is("end_date", null);

		if (teamError) throw teamError;

		coachIds = teamMembers?.map((tm) => tm.coach_id) || [];
		// Don't include the premier coach in their own team metrics
	} else {
		// Get all coaches (including premiere coaches)
		const { data: allCoaches, error: coachError } = await supabase
			.from("user")
			.select("id, role")
			.in("role", ["coach", "premiereCoach"])
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;

		coachIds = allCoaches?.map((coach) => coach.id) || [];
		// Track premiere coaches
		allCoaches?.forEach((coach) => {
			if (coach.role === "premiereCoach") {
				uniquePremierCoaches.add(coach.id);
			}
		});
	}

	const totalCoaches = coachIds.length;

	// Get total active clients for the filtered coaches
	const { count: totalClients, error: clientError } = await supabase
		.from("client_assignments")
		.select("*", { count: "exact", head: true })
		.in("user_id", coachIds)
		.is("end_date", null);

	if (clientError) throw clientError;

	// Get client IDs for the filtered coaches
	const { data: clientAssignments } = await supabase
		.from("client_assignments")
		.select("client_id")
		.in("user_id", coachIds)
		.is("end_date", null);

	const clientIds = clientAssignments?.map((ca) => ca.client_id) || [];

	// Get average rating from call feedback for these clients
	const { data: callFeedback, error: ratingError } = await supabase
		.from("call_feedback")
		.select("rating")
		.in("client_id", clientIds)
		.not("rating", "is", null);

	if (ratingError) throw ratingError;

	const avgRating =
		callFeedback && callFeedback.length > 0
			? callFeedback.reduce((sum, cf) => sum + (cf.rating || 0), 0) /
				callFeedback.length
			: 0;

	// Get sessions this week from client_activity
	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	const { data: weeklyActivities, error: activityError } = await supabase
		.from("client_activity")
		.select("one_on_one_call_attended, team_call_attended")
		.in("client_id", clientIds)
		.gte("activity_date", oneWeekAgo.toISOString())
		.or("one_on_one_call_attended.eq.true,team_call_attended.eq.true");

	if (activityError) throw activityError;

	const sessionsThisWeek = weeklyActivities?.length || 0;

	// Get NPS scores to calculate average satisfaction and distribution
	const { data: npsScores, error: npsError } = await supabase
		.from("client_nps")
		.select("nps_score")
		.in("client_id", clientIds);

	if (npsError) throw npsError;

	// Calculate average NPS (keep it on 0-10 scale)
	const avgSatisfaction =
		npsScores && npsScores.length > 0
			? npsScores.reduce((sum, nps) => sum + nps.nps_score, 0) /
				npsScores.length
			: 0;

	// Calculate NPS distribution
	let detractors = 0;
	let passives = 0;
	let promoters = 0;

	npsScores?.forEach((nps) => {
		if (nps.nps_score <= 6) {
			detractors++;
		} else if (nps.nps_score <= 8) {
			passives++;
		} else {
			promoters++;
		}
	});

	// Calculate actual NPS score from distribution
	const npsResult = calculateNPSFromDistribution({
		detractors,
		passives,
		promoters,
	});

	return {
		totalCoaches: totalCoaches || 0,
		premierCoachCount: uniquePremierCoaches.size,
		regularCoachCount: (totalCoaches || 0) - uniquePremierCoaches.size,
		averageRating: Number(avgRating.toFixed(1)),
		averageSatisfaction: Number(avgSatisfaction.toFixed(1)),
		npsScore: npsResult.score,
		totalClients: totalClients || 0,
		sessionsThisWeek,
		npsResponseCount: npsScores?.length || 0,
		npsDistribution: {
			detractors,
			passives,
			promoters,
		},
	};
}

// Get top performing coaches
export async function getTopPerformers(teamFilter?: {
	premiereCoachId: string;
}): Promise<CoachPerformance[]> {
	const supabase = await createClient();

	let coaches: any[] = [];

	if (teamFilter) {
		// Get team member IDs
		const { data: teamMembers, error: teamError } = await supabase
			.from("coach_teams")
			.select("coach_id")
			.eq("premier_coach_id", teamFilter.premiereCoachId)
			.is("end_date", null);

		if (teamError) throw teamError;

		const teamMemberIds = teamMembers?.map((tm) => tm.coach_id) || [];
		
		// Get coaches for team members
		const { data: teamCoaches, error: coachError } = await supabase
			.from("user")
			.select("id, name, image, role")
			.in("id", teamMemberIds)
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;

		// Don't include the premier coach in their own team views
		coaches = teamCoaches || [];
	} else {
		// Get all coaches (including premiere coaches)
		const { data: allCoaches, error: coachError } = await supabase
			.from("user")
			.select("id, name, image, role")
			.in("role", ["coach", "premiereCoach"])
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;
		coaches = allCoaches || [];
	}

	// Get client assignments for each coach
	const { data: assignments, error: assignmentError } = await supabase
		.from("client_assignments")
		.select("user_id, client_id")
		.is("end_date", null);

	if (assignmentError) throw assignmentError;

	// Get NPS scores for clients
	const { data: npsScores, error: npsError } = await supabase
		.from("client_nps")
		.select("client_id, nps_score");

	if (npsError) throw npsError;

	// Calculate satisfaction for each coach
	const coachPerformance = (coaches || []).map((coach) => {
		// Get client IDs for this coach
		const coachClients =
			assignments
				?.filter((a) => a.user_id === coach.id)
				?.map((a) => a.client_id) || [];

		// Get NPS scores for these clients
		const clientNpsScores =
			npsScores
				?.filter((nps) => coachClients.includes(nps.client_id))
				?.map((nps) => nps.nps_score) || [];

		// Calculate actual NPS score
		const npsResult = calculateNPSFromScores(clientNpsScores);
		// For backward compatibility, convert NPS to a 0-100 satisfaction percentage
		// This maps -100 to +100 NPS range to 0-100 satisfaction range
		const satisfactionPercentage = Math.round((npsResult.score + 100) / 2);

		return {
			coachId: coach.id,
			coachName: coach.name,
			coachImage: coach.image,
			coachType:
				coach.role === "premiereCoach"
					? ("Premier" as const)
					: ("Regular" as const),
			satisfactionPercentage,
			npsScore: npsResult.score, // Add actual NPS score
			clientCount: coachClients.length,
		};
	});

	// Sort by satisfaction percentage and return top 3
	return coachPerformance
		.sort((a, b) => b.satisfactionPercentage - a.satisfactionPercentage)
		.slice(0, 3);
}

// Get renewal rate rankings
export async function getRenewalRateRankings(teamFilter?: {
	premiereCoachId: string;
}): Promise<CoachRenewalRate[]> {
	const supabase = await createClient();

	let coaches: any[] = [];

	if (teamFilter) {
		// Get team member IDs
		const { data: teamMembers, error: teamError } = await supabase
			.from("coach_teams")
			.select("coach_id")
			.eq("premier_coach_id", teamFilter.premiereCoachId)
			.is("end_date", null);

		if (teamError) throw teamError;

		const teamMemberIds = teamMembers?.map((tm) => tm.coach_id) || [];
		
		// Get coaches for team members
		const { data: teamCoaches, error: coachError } = await supabase
			.from("user")
			.select("id, name, image, role")
			.in("id", teamMemberIds)
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;

		// Don't include the premier coach in their own team views
		coaches = teamCoaches || [];
	} else {
		// Get all coaches (including premiere coaches)
		const { data: allCoaches, error: coachError } = await supabase
			.from("user")
			.select("id, name, image, role")
			.in("role", ["coach", "premiereCoach"])
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;
		coaches = allCoaches || [];
	}

	// Get client assignments for the filtered coaches
	const coachIds = coaches.map((coach) => coach.id);
	const { data: assignments, error: assignmentError } = await supabase
		.from("client_assignments")
		.select("user_id, client_id")
		.in("user_id", coachIds)
		.is("end_date", null);

	if (assignmentError) throw assignmentError;

	// Get all clients with renewal information
	const { data: clients, error: clientError } = await supabase
		.from("clients")
		.select("id, start_date, end_date, renewal_date, churned_at");

	if (clientError) throw clientError;

	// Map clients to coaches
	const coachClientMap = new Map<string, string[]>();
	assignments?.forEach((assignment) => {
		const clients = coachClientMap.get(assignment.user_id) || [];
		clients.push(assignment.client_id);
		coachClientMap.set(assignment.user_id, clients);
	});

	// Calculate renewal rate for each coach
	const coachRenewalRates = (coaches || []).map((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const coachClientData = clients?.filter((c) => coachClients.includes(c.id)) || [];

		// Filter clients eligible for renewal (term has ended)
		const now = new Date();
		const eligibleForRenewal = coachClientData.filter((c) => {
			if (!c.end_date) return false;
			const endDate = new Date(c.end_date);
			return endDate < now;
		});

		let renewalRate = 0;
		if (eligibleForRenewal.length > 0) {
			// Count renewed clients
			const renewed = eligibleForRenewal.filter((c) => {
				// Client renewed if they have a renewal_date or no churned_at date
				return c.renewal_date || !c.churned_at;
			}).length;

			renewalRate = Math.round((renewed / eligibleForRenewal.length) * 100);
		}

		return {
			coachId: coach.id,
			coachName: coach.name,
			coachImage: coach.image,
			renewalRate,
			clientCount: coachClients.length,
		};
	});

	// Sort by renewal rate (descending) and return
	return coachRenewalRates
		.filter((coach) => coach.clientCount > 0) // Only include coaches with clients
		.sort((a, b) => b.renewalRate - a.renewalRate);
}

// Get overall renewal rate
export async function getOverallRenewalRate(teamFilter?: {
	premiereCoachId: string;
}): Promise<number> {
	const supabase = await createClient();

	let clientIds: string[] = [];

	if (teamFilter) {
		// Get team member IDs
		const { data: teamMembers, error: teamError } = await supabase
			.from("coach_teams")
			.select("coach_id")
			.eq("premier_coach_id", teamFilter.premiereCoachId)
			.is("end_date", null);

		if (teamError) throw teamError;

		const teamMemberIds = teamMembers?.map((tm) => tm.coach_id) || [];
		// Don't include the premier coach in their own renewal rate

		// Get client assignments for team members
		const { data: assignments, error: assignmentError } = await supabase
			.from("client_assignments")
			.select("client_id")
			.in("user_id", teamMemberIds)
			.is("end_date", null);

		if (assignmentError) throw assignmentError;

		clientIds = [...new Set(assignments?.map((a) => a.client_id) || [])];
	}

	// Get clients with renewal information
	const clientsQuery = supabase
		.from("clients")
		.select("id, start_date, end_date, renewal_date, churned_at");

	// Apply filter if we have specific client IDs
	if (teamFilter && clientIds.length > 0) {
		clientsQuery.in("id", clientIds);
	}

	const { data: clients, error: clientError } = await clientsQuery;

	if (clientError) throw clientError;

	// Filter clients eligible for renewal (term has ended)
	const now = new Date();
	const eligibleForRenewal = (clients || []).filter((c) => {
		if (!c.end_date) return false;
		const endDate = new Date(c.end_date);
		return endDate < now;
	});

	if (eligibleForRenewal.length === 0) {
		return 0;
	}

	// Count renewed clients
	const renewed = eligibleForRenewal.filter((c) => {
		// Client renewed if they have a renewal_date or no churned_at date
		return c.renewal_date || !c.churned_at;
	}).length;

	return Math.round((renewed / eligibleForRenewal.length) * 100);
}

// Get workload distribution
export async function getWorkloadDistribution(teamFilter?: {
	premiereCoachId: string;
}): Promise<CoachWorkload[]> {
	const supabase = await createClient();

	// Get global default client units setting
	const globalDefaultSetting = await getSystemSetting(
		"global_default_client_units_per_coach",
	);
	const globalDefaultClientUnits = getSettingValue(globalDefaultSetting, 20); // fallback to 20

	let coaches: any[] = [];

	if (teamFilter) {
		// Get team member IDs
		const { data: teamMembers, error: teamError } = await supabase
			.from("coach_teams")
			.select("coach_id")
			.eq("premier_coach_id", teamFilter.premiereCoachId)
			.is("end_date", null);

		if (teamError) throw teamError;

		const teamMemberIds = teamMembers?.map((tm) => tm.coach_id) || [];

		// Get coaches with capacity for team members
		const { data: teamCoaches, error: coachError } = await supabase
			.from("user")
			.select(`
				id,
				name,
				image,
				coach_capacity (
					max_client_units
				)
			`)
			.in("id", teamMemberIds)
			.or("banned.is.null,banned.neq.true");

		if (coachError) throw coachError;
		coaches = teamCoaches || [];
	} else {
		// Get all coaches with capacity
		const { data: allCoaches, error: coachError } = await supabase
			.from("user")
			.select(`
				id,
				name,
				image,
				coach_capacity (
					max_client_units
				)
			`)
			.in("role", ["coach", "premiereCoach"])
			.or("banned.is.null,banned.neq.true")
			.limit(5);

		if (coachError) throw coachError;
		coaches = allCoaches || [];
	}

	// Get client assignments for the filtered coaches
	const coachIds = coaches.map((coach) => coach.id);
	const { data: assignments, error: assignmentError } = await supabase
		.from("client_assignments")
		.select("user_id")
		.in("user_id", coachIds)
		.is("end_date", null);

	if (assignmentError) throw assignmentError;

	// Count clients per coach
	const clientCountMap = new Map<string, number>();
	assignments?.forEach((assignment) => {
		const count = clientCountMap.get(assignment.user_id) || 0;
		clientCountMap.set(assignment.user_id, count + 1);
	});

	const workloadData = (coaches || []).map((coach) => {
		const clientCount = clientCountMap.get(coach.id) || 0;
		const maxCapacity =
			coach.coach_capacity?.max_client_units || globalDefaultClientUnits;

		return {
			coachId: coach.id,
			coachName: coach.name,
			coachImage: coach.image,
			clientCount,
			maxCapacity,
			utilizationPercentage: (clientCount / maxCapacity) * 100,
		};
	});

	// Sort by client count (descending)
	return workloadData.sort((a, b) => b.clientCount - a.clientCount);
}

// Get detailed coach profile
export async function getCoachDetails(coachId: string): Promise<CoachProfile> {
	const supabase = await createClient();

	// Get global default client units setting
	const globalDefaultSetting = await getSystemSetting(
		"global_default_client_units_per_coach",
	);
	const globalDefaultClientUnits = getSettingValue(globalDefaultSetting, 20); // fallback to 20

	// Get coach basic info with capacity
	const { data: coach, error: coachError } = await supabase
		.from("user")
		.select(`
			*,
			coach_capacity (*)
		`)
		.eq("id", coachId)
		.single();

	if (coachError) throw coachError;

	// Get premier coach info if this is a regular coach
	let premierCoach = null;
	const { data: teamRelation } = await supabase
		.from("coach_teams")
		.select(`
			premier_coach:user!coach_teams_premier_coach_id_fkey (
				id,
				name,
				email,
				image
			)
		`)
		.eq("coach_id", coachId)
		.is("end_date", null)
		.single();

	if (teamRelation) {
		premierCoach = teamRelation.premier_coach;
	}

	// Get team members if this is a premier coach
	let teamMembers: CoachTeamMember[] = [];
	const { data: teamData } = await supabase
		.from("coach_teams")
		.select(`
			coach:user!coach_teams_coach_id_fkey (
				id,
				name,
				email,
				image,
				role
			)
		`)
		.eq("premier_coach_id", coachId)
		.is("end_date", null);

	if (teamData) {
		// Get client counts for team members
		const { data: assignments } = await supabase
			.from("client_assignments")
			.select("user_id")
			.in(
				"user_id",
				teamData.map((t) => t.coach.id),
			)
			.is("end_date", null);

		const clientCounts = new Map<string, number>();
		assignments?.forEach((a) => {
			const count = clientCounts.get(a.user_id) || 0;
			clientCounts.set(a.user_id, count + 1);
		});

		teamMembers = teamData.map((t) => ({
			id: t.coach.id,
			name: t.coach.name,
			email: t.coach.email,
			image: t.coach.image,
			role: t.coach.role || "coach",
			client_count: clientCounts.get(t.coach.id) || 0,
			capacity_percentage: 0, // Would need capacity data
			joined_team_date: new Date().toISOString(), // Mock
		}));
	}

	// Check if premier coach based on user role
	const isPremier = coach.role === "premiereCoach";

	// Get current clients
	const { data: clientAssignments } = await supabase
		.from("client_assignments")
		.select(`
			client:clients (*)
		`)
		.eq("user_id", coachId)
		.is("end_date", null);

	// Calculate metrics
	const { data: allAssignments } = await supabase
		.from("client_assignments")
		.select("client_id, start_date, end_date")
		.eq("user_id", coachId);

	const totalClientsServed = new Set(
		allAssignments?.map((a) => a.client_id) || [],
	).size;

	// Calculate average rating from call feedback
	const clientIds = clientAssignments?.map((ca) => ca.client.id) || [];
	let avgRating = 0;

	if (clientIds.length > 0) {
		const { data: callFeedback } = await supabase
			.from("call_feedback")
			.select("rating")
			.in("client_id", clientIds)
			.not("rating", "is", null);

		avgRating =
			callFeedback && callFeedback.length > 0
				? callFeedback.reduce((sum, cf) => sum + (cf.rating || 0), 0) /
					callFeedback.length
				: 0;
	}

	// Calculate average client duration
	const completedAssignments = allAssignments?.filter((a) => a.end_date) || [];
	let avgClientDuration = 0;

	if (completedAssignments.length > 0) {
		const durations = completedAssignments.map((a) => {
			const start = new Date(a.start_date);
			const end = new Date(a.end_date!);
			return Math.floor(
				(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
			);
		});
		avgClientDuration = Math.round(
			durations.reduce((sum, d) => sum + d, 0) / durations.length,
		);
	} else {
		// For coaches with only active clients, calculate from start to now
		const activeAssignments = allAssignments?.filter((a) => !a.end_date) || [];
		if (activeAssignments.length > 0) {
			const now = new Date();
			const durations = activeAssignments.map((a) => {
				const start = new Date(a.start_date);
				return Math.floor(
					(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
				);
			});
			avgClientDuration = Math.round(
				durations.reduce((sum, d) => sum + d, 0) / durations.length,
			);
		}
	}

	// Calculate success rate and NPS score based on client NPS scores
	let successRate = 0;
	let npsScore = 0;

	if (clientIds.length > 0) {
		const { data: npsScores } = await supabase
			.from("client_nps")
			.select("nps_score")
			.in("client_id", clientIds);

		if (npsScores && npsScores.length > 0) {
			// Consider NPS >= 7 as success (promoters and passives)
			const successfulClients = npsScores.filter(
				(nps) => nps.nps_score >= 7,
			).length;
			successRate = Math.round((successfulClients / npsScores.length) * 100);

			// Calculate actual NPS score
			const scores = npsScores.map(nps => nps.nps_score);
			const npsResult = calculateNPSFromScores(scores);
			npsScore = npsResult.score;
		}
	}

	// Calculate total client units for active clients
	let totalUnits = 0;
	const { data: clientUnits } = await supabase
		.from("client_units")
		.select(`
			client_id,
			calculated_units,
			calculation_date,
			client:clients!inner(status)
		`)
		.eq("coach_id", coachId)
		.eq("client.status", "active");

	if (clientUnits && clientUnits.length > 0) {
		// Group by client_id and get the latest calculation for each client
		const latestUnitsMap = new Map<string, { units: number; date: string }>();
		
		clientUnits.forEach((unit) => {
			const existing = latestUnitsMap.get(unit.client_id);
			if (!existing || new Date(unit.calculation_date) > new Date(existing.date)) {
				latestUnitsMap.set(unit.client_id, {
					units: unit.calculated_units,
					date: unit.calculation_date
				});
			}
		});
		
		// Sum all latest units
		totalUnits = Array.from(latestUnitsMap.values()).reduce(
			(sum, item) => sum + item.units,
			0
		);
	}

	// MOCK DATA: Performance history - still using mock for now
	const performanceHistory = await generateMockPerformanceHistory();

	return {
		...coach,
		coach_capacity: coach.coach_capacity || undefined,
		team_members: teamMembers,
		premier_coach: premierCoach,
		current_clients: clientAssignments?.map((ca) => ca.client) || [],
		performance_history: performanceHistory,
		// Note: Certifications are now fetched separately via certificationQueries.userCertifications
		total_clients_served: totalClientsServed,
		average_client_duration: avgClientDuration,
		success_rate: successRate,
		isPremier,
		rating: avgRating,
		npsScore,
		totalUnits,
		globalDefaultClientUnits,
	};
}

// Get coach's current clients with details
export async function getCoachClients(coachId: string): Promise<CoachClient[]> {
	const supabase = await createClient();

	const { data: assignments, error } = await supabase
		.from("client_assignments")
		.select(`
			client:clients (*),
			start_date
		`)
		.eq("user_id", coachId)
		.is("end_date", null);

	if (error) throw error;

	// Get additional client data
	const clientIds = assignments?.map((a) => a.client.id) || [];

	// Get latest activity
	const { data: activities } = await supabase
		.from("client_activity")
		.select("client_id, activity_date")
		.in("client_id", clientIds)
		.order("activity_date", { ascending: false });

	// Get NPS scores
	const { data: npsScores } = await supabase
		.from("client_nps")
		.select("client_id, nps_score")
		.in("client_id", clientIds);

	const activityMap = new Map<string, string>();
	const npsMap = new Map<string, number>();

	activities?.forEach((a) => {
		if (!activityMap.has(a.client_id)) {
			activityMap.set(a.client_id, a.activity_date);
		}
	});

	npsScores?.forEach((n) => {
		npsMap.set(n.client_id, n.nps_score);
	});

	return (
		assignments?.map((a) => ({
			id: a.client.id,
			first_name: a.client.first_name,
			last_name: a.client.last_name,
			email: a.client.email,
			start_date: a.start_date,
			status: a.client.status,
			last_activity_date: activityMap.get(a.client.id),
			progress_percentage: Math.floor(Math.random() * 100), // MOCK DATA
			nps_score: npsMap.get(a.client.id),
			total_sessions: Math.floor(Math.random() * 50) + 10, // MOCK DATA
			next_session_date: new Date(
				Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
			).toISOString(), // MOCK DATA
			product_name: "Premium Coaching", // MOCK DATA
		})) || []
	);
}

// Get coach performance history
export async function getCoachPerformanceHistory(
	coachId: string,
): Promise<CoachPerformanceData[]> {
	// MOCK DATA: This entire function returns mock data
	// In real implementation, would aggregate historical data
	return await generateMockPerformanceHistory();
}

// MOCK DATA: Helper function to generate mock performance history
export async function generateMockPerformanceHistory(): Promise<
	CoachPerformanceData[]
> {
	const months = 6;
	const data: CoachPerformanceData[] = [];
	const today = new Date();

	for (let i = months - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setMonth(date.getMonth() - i);

		data.push({
			date: date.toISOString().split("T")[0],
			rating: 4 + Math.random() * 0.8,
			client_count: Math.floor(15 + Math.random() * 10),
			session_count: Math.floor(40 + Math.random() * 20),
			nps_average: 7 + Math.random() * 2,
			completion_rate: 85 + Math.random() * 10,
		});
	}

	return data;
}

// Faceted query functions
export async function getCoachTypes(): Promise<Map<string, number>> {
	const supabase = await createClient();

	const { data: coaches } = await supabase
		.from("user")
		.select("id, role")
		.in("role", ["coach", "premiereCoach"])
		.or("banned.is.null,banned.neq.true");

	const counts = new Map<string, number>();
	let premierCount = 0;
	let regularCount = 0;

	coaches?.forEach((coach) => {
		if (coach.role === "premiereCoach") {
			premierCount++;
		} else {
			regularCount++;
		}
	});

	counts.set("Premier", premierCount);
	counts.set("Regular", regularCount);

	return counts;
}

export async function getCoachSpecializations(): Promise<Map<string, number>> {
	const supabase = await createClient();

	const { data: coaches } = await supabase
		.from("user")
		.select("id")
		.in("role", ["coach", "premiereCoach"])
		.or("banned.is.null,banned.neq.true");

	const coachIds = coaches?.map((c) => c.id) || [];

	const { data: specializations } = await supabase
		.from("user_specializations")
		.select(`
			user_id,
			specialization:specializations(name, icon)
		`)
		.in("user_id", coachIds)
		.eq("is_primary", true);

	const counts = new Map<string, number>();

	specializations?.forEach((spec) => {
		if (spec.specialization?.name) {
			const name = spec.specialization.name;
			counts.set(name, (counts.get(name) || 0) + 1);
		}
	});

	// Also count coaches without specializations
	const coachesWithSpec = new Set(specializations?.map((s) => s.user_id) || []);
	const coachesWithoutSpec = coachIds.filter((id) => !coachesWithSpec.has(id));
	if (coachesWithoutSpec.length > 0) {
		counts.set("-", coachesWithoutSpec.length);
	}

	return counts;
}

export async function getCoachCertifications(): Promise<Map<string, number>> {
	const supabase = await createClient();

	const { data: coaches } = await supabase
		.from("user")
		.select("id")
		.in("role", ["coach", "premiereCoach"])
		.or("banned.is.null,banned.neq.true");

	const coachIds = coaches?.map((c) => c.id) || [];

	const { data: certifications } = await supabase
		.from("user_certifications")
		.select(`
			user_id,
			certification:certifications(name)
		`)
		.in("user_id", coachIds);

	const counts = new Map<string, number>();

	// Count each certification
	certifications?.forEach((cert) => {
		if (cert.certification?.name) {
			const name = cert.certification.name;
			counts.set(name, (counts.get(name) || 0) + 1);
		}
	});

	return counts;
}

export async function getCoachClientCountRange(): Promise<[number, number]> {
	const supabase = await createClient();

	const { data: assignments } = await supabase
		.from("client_assignments")
		.select("user_id")
		.is("end_date", null);

	const countMap = new Map<string, number>();
	assignments?.forEach((a) => {
		const count = countMap.get(a.user_id) || 0;
		countMap.set(a.user_id, count + 1);
	});

	const counts = Array.from(countMap.values());
	const min = counts.length > 0 ? Math.min(...counts) : 0;
	const max = counts.length > 0 ? Math.max(...counts) : 0;

	return [min, max];
}

export async function getCoachTeamMembers(
	coachId: string,
): Promise<CoachTeamMember[]> {
	const supabase = await createClient();

	const { data: teamData, error } = await supabase
		.from("coach_teams")
		.select(`
			coach:user!coach_teams_coach_id_fkey (*),
			start_date
		`)
		.eq("premier_coach_id", coachId)
		.is("end_date", null);

	if (error) throw error;

	// Get client counts for each team member
	const coachIds = teamData?.map((t) => t.coach.id) || [];
	const { data: assignments } = await supabase
		.from("client_assignments")
		.select("user_id")
		.in("user_id", coachIds)
		.is("end_date", null);

	const clientCounts = new Map<string, number>();
	assignments?.forEach((a) => {
		const count = clientCounts.get(a.user_id) || 0;
		clientCounts.set(a.user_id, count + 1);
	});

	// Get capacities
	const { data: capacities } = await supabase
		.from("coach_capacity")
		.select("coach_id, max_client_units")
		.in("coach_id", coachIds);

	const capacityMap = new Map<string, number>();
	capacities?.forEach((c) => {
		capacityMap.set(c.coach_id, c.max_client_units);
	});

	return (
		teamData?.map((t) => ({
			id: t.coach.id,
			name: t.coach.name,
			email: t.coach.email,
			image: t.coach.image,
			role: t.coach.role || "coach",
			client_count: clientCounts.get(t.coach.id) || 0,
			capacity_percentage:
				((clientCounts.get(t.coach.id) || 0) /
					(capacityMap.get(t.coach.id) || 20)) *
				100,
			joined_team_date: t.start_date,
		})) || []
	);
}

export async function getAvailableCoaches(
	excludeCoachId?: string,
): Promise<
	{ id: string; name: string; email: string; image?: string | null }[]
> {
	const supabase = await createClient();

	// Get all coaches (only regular coaches, not premiere coaches)
	const { data: coaches, error: coachError } = await supabase
		.from("user")
		.select("id, name, email, image, role")
		.in("role", ["coach", "premiereCoach"])
		.or("banned.is.null,banned.neq.true");

	if (coachError) throw coachError;

	// Get all coaches who are already in teams
	const { data: coachTeams, error: teamError } = await supabase
		.from("coach_teams")
		.select("coach_id")
		.is("end_date", null);

	if (teamError) throw teamError;

	// Create sets of coaches who are unavailable
	const unavailableCoachIds = new Set<string>();

	coachTeams?.forEach((ct) => {
		// Add regular coaches who are already in teams
		unavailableCoachIds.add(ct.coach_id);
	});

	// Filter to only available coaches
	return (coaches || []).filter(
		(coach) =>
			// Only regular coaches (not premiere coaches)
			coach.role === "coach" &&
			// Not already in a team
			!unavailableCoachIds.has(coach.id) &&
			// Not the coach we want to exclude (usually the current premier coach)
			coach.id !== excludeCoachId,
	);
}

// Get team members as table rows (same format as allCoaches)
export async function getTeamMembersAsTableRows(
	coachId: string,
	filters?: FiltersState,
): Promise<CoachTableRow[]> {
	const supabase = await createClient();

	// Get global default client units setting
	const globalDefaultSetting = await getSystemSetting(
		"global_default_client_units_per_coach",
	);
	const globalDefaultClientUnits = getSettingValue(globalDefaultSetting, 20); // fallback to 20

	// Get team member IDs first
	const { data: teamData } = await supabase
		.from("coach_teams")
		.select("coach_id")
		.eq("premier_coach_id", coachId)
		.is("end_date", null);

	const teamMemberIds = teamData?.map((t) => t.coach_id) || [];

	if (teamMemberIds.length === 0) {
		return [];
	}

	// Get coaches with their capacity
	const { data: coaches, error: coachError } = await supabase
		.from("user")
		.select(`
			*,
			coach_capacity (
				max_client_units,
				is_paused
			)
		`)
		.in("id", teamMemberIds)
		.or("banned.is.null,banned.neq.true");

	if (coachError) throw coachError;

	// Get client assignments for team members
	const { data: assignments, error: assignmentError } = await supabase
		.from("client_assignments")
		.select("user_id, client_id")
		.in("user_id", teamMemberIds)
		.is("end_date", null);

	if (assignmentError) throw assignmentError;

	// Count clients per coach
	const clientCountMap = new Map<string, number>();
	const coachClientMap = new Map<string, string[]>();

	assignments?.forEach((assignment) => {
		const count = clientCountMap.get(assignment.user_id) || 0;
		clientCountMap.set(assignment.user_id, count + 1);

		// Also track client IDs per coach
		const clients = coachClientMap.get(assignment.user_id) || [];
		clients.push(assignment.client_id);
		coachClientMap.set(assignment.user_id, clients);
	});

	// Get call feedback for rating calculation
	const { data: callFeedback } = await supabase
		.from("call_feedback")
		.select("client_id, rating")
		.not("rating", "is", null);

	// Calculate ratings per coach based on their clients' feedback
	const coachRatingMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const clientFeedback =
			callFeedback?.filter((fb) => coachClients.includes(fb.client_id)) || [];

		if (clientFeedback.length > 0) {
			const avgRating =
				clientFeedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
				clientFeedback.length;
			coachRatingMap.set(coach.id, avgRating);
		}
	});

	// Get NPS scores for satisfaction calculation
	const { data: npsScores } = await supabase
		.from("client_nps")
		.select("client_id, nps_score");

	// Calculate satisfaction per coach
	const coachSatisfactionMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const clientNpsScores =
			npsScores?.filter((nps) => coachClients.includes(nps.client_id)) || [];

		if (clientNpsScores.length > 0) {
			const avgNps =
				clientNpsScores.reduce((sum, nps) => sum + nps.nps_score, 0) /
				clientNpsScores.length;
			// Convert NPS (0-10) to percentage (0-100)
			coachSatisfactionMap.set(coach.id, Math.round(avgNps * 10));
		}
	});

	// Get specializations for team members
	const { data: userSpecializations } = await supabase
		.from("user_specializations")
		.select(`
			user_id,
			is_primary,
			specialization:specializations(name, icon)
		`)
		.in("user_id", teamMemberIds)
		.eq("is_primary", true);

	// Get certifications for team members
	const { data: userCertifications } = await supabase
		.from("user_certifications")
		.select(`
			user_id,
			verified,
			certification:certifications(
				id,
				name,
				icon
			)
		`)
		.in("user_id", teamMemberIds);

	// Map specializations and certifications
	const specializationMap = new Map<
		string,
		{ name: string; icon: string | null }
	>();
	userSpecializations?.forEach((spec) => {
		if (spec.specialization?.name) {
			specializationMap.set(spec.user_id, {
				name: spec.specialization.name,
				icon: spec.specialization.icon || null,
			});
		}
	});

	const certificationsMap = new Map<string, any[]>();
	userCertifications?.forEach((cert) => {
		if (!certificationsMap.has(cert.user_id)) {
			certificationsMap.set(cert.user_id, []);
		}
		if (cert.certification) {
			certificationsMap.get(cert.user_id)?.push({
				...cert.certification,
				verified: cert.verified,
			});
		}
	});

	// Get additional metrics for the new fields
	// Get open tickets count per coach
	const { data: tickets } = await supabase
		.from("tickets")
		.select("client_id, status")
		.in("status", ["open", "in_progress"]);

	const coachOpenTicketsMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const openTickets =
			tickets?.filter((ticket) =>
				coachClients.includes(ticket.client_id || ""),
			) || [];
		coachOpenTicketsMap.set(coach.id, openTickets.length);
	});

	// Calculate renewal rate per coach
	const { data: clients } = await supabase
		.from("clients")
		.select("id, start_date, end_date, renewal_date, churned_at");

	const coachRenewalRateMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const coachClientData =
			clients?.filter((c) => coachClients.includes(c.id)) || [];

		// Filter clients eligible for renewal (term has ended)
		const now = new Date();
		const eligibleForRenewal = coachClientData.filter((c) => {
			if (!c.end_date) return false;
			const endDate = new Date(c.end_date);
			return endDate < now;
		});

		if (eligibleForRenewal.length > 0) {
			// Count renewed clients
			const renewed = eligibleForRenewal.filter((c) => {
				// Client renewed if they have a renewal_date or no churned_at date
				return c.renewal_date || !c.churned_at;
			}).length;

			const renewalRate = Math.round(
				(renewed / eligibleForRenewal.length) * 100,
			);
			coachRenewalRateMap.set(coach.id, renewalRate);
		} else {
			// No clients eligible for renewal yet
			coachRenewalRateMap.set(coach.id, 0);
		}
	});

	// Calculate actual NPS score per coach
	const coachAvgNPSMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const clientNpsScores =
			npsScores?.filter((nps) => coachClients.includes(nps.client_id)) || [];

		if (clientNpsScores.length > 0) {
			// Extract the raw scores and calculate actual NPS
			const scores = clientNpsScores.map(nps => nps.nps_score);
			const npsResult = calculateNPSFromScores(scores);
			// Store actual NPS score (-100 to +100)
			coachAvgNPSMap.set(coach.id, npsResult.score);
		}
	});

	// Get client units for active clients
	const { data: clientUnits } = await supabase
		.from("client_units")
		.select(`
			client_id,
			coach_id,
			calculated_units,
			clients!inner(
				id,
				status
			)
		`)
		.eq("clients.status", "active")
		.in("coach_id", coaches?.map((c) => c.id) || []);

	// Calculate total client units per coach
	const coachTotalUnitsMap = new Map<string, number>();
	
	// Add up all calculated units per coach
	clientUnits?.forEach(unit => {
		if (unit.coach_id && unit.clients?.status === "active") {
			const current = coachTotalUnitsMap.get(unit.coach_id) || 0;
			coachTotalUnitsMap.set(unit.coach_id, current + unit.calculated_units);
		}
	});

	// Get goals data for team members' goals hit rate calculation
	const { data: clientGoals } = await supabase
		.from("client_goals")
		.select("client_id, status")
		.in("client_id", assignments?.map((a) => a.client_id) || []);

	// Calculate goals hit rate per coach
	const coachGoalsHitRateMap = new Map<string, number>();
	coaches?.forEach((coach) => {
		const coachClients = coachClientMap.get(coach.id) || [];
		const coachGoals =
			clientGoals?.filter((goal) => coachClients.includes(goal.client_id)) ||
			[];

		if (coachGoals.length > 0) {
			// Consider goals with status 'completed' as hit
			const completedGoals = coachGoals.filter(
				(goal) => goal.status === "completed",
			).length;
			const hitRate = Math.round((completedGoals / coachGoals.length) * 100);
			coachGoalsHitRateMap.set(coach.id, hitRate);
		} else {
			// No goals set yet
			coachGoalsHitRateMap.set(coach.id, 0);
		}
	});

	// Transform data into table rows
	let coachRows = (coaches || []).map((coach) => ({
		id: coach.id,
		name: coach.name,
		email: coach.email,
		image: coach.image,
		role: coach.role || "coach",
		type: "Regular" as const, // Team members are always regular coaches
		specialization: specializationMap.get(coach.id) || {
			name: "-",
			icon: null,
		},
		certifications: certificationsMap.get(coach.id) || [],
		activeClients: clientCountMap.get(coach.id) || 0,
		rating: coachRatingMap.get(coach.id) || 0,
		currentCapacity: clientCountMap.get(coach.id) || 0,
		maxCapacity:
			coach.coach_capacity?.max_client_units || globalDefaultClientUnits,
		status: coach.coach_capacity?.is_paused
			? ("Paused" as const)
			: ("Active" as const),
		lastActivity: new Date().toISOString(), // MOCK DATA
		satisfaction: coachSatisfactionMap.get(coach.id) || 0,
		// New metrics
		goalsHitRate: coachGoalsHitRateMap.get(coach.id) || 0,
		openTickets: coachOpenTicketsMap.get(coach.id) || 0,
		renewalRate: coachRenewalRateMap.get(coach.id) || 0,
		averageNPS: coachAvgNPSMap.get(coach.id) || 0,
		totalUnits: coachTotalUnitsMap.get(coach.id) || 0,
	}));

	// Apply filters if provided
	if (filters && filters.length > 0) {
		filters.forEach((filter) => {
			const filterValues = filter.values;
			if (filterValues && filterValues.length > 0) {
				switch (filter.columnId) {
					case "type":
						coachRows = coachRows.filter((coach) =>
							filterValues.includes(coach.type),
						);
						break;
					case "specialization":
						coachRows = coachRows.filter((coach) => {
							const specializationName =
								typeof coach.specialization === "string"
									? coach.specialization
									: coach.specialization.name;
							return filterValues.includes(specializationName);
						});
						break;
					case "certifications":
						coachRows = coachRows.filter((coach) =>
							coach.certifications.some((cert) =>
								filterValues.includes(cert.name),
							),
						);
						break;
					case "activeClients":
						// Handle active clients filter - single value or range
						if (filter.operator === "is" && filterValues.length === 1) {
							const value = Number(filterValues[0]);
							coachRows = coachRows.filter(
								(coach) => coach.activeClients === value,
							);
						} else if (
							(filter.operator === "between" ||
								filter.operator === "is between") &&
							filterValues.length === 2
						) {
							const [min, max] = filterValues.map(Number);
							coachRows = coachRows.filter(
								(coach) =>
									coach.activeClients >= min && coach.activeClients <= max,
							);
						}
						break;
				}
			}
			// Handle text filters
			if (
				filter.columnId === "name" &&
				filter.operator === "contains" &&
				filter.values?.[0]
			) {
				coachRows = coachRows.filter((coach) =>
					coach.name.toLowerCase().includes(filter.values[0].toLowerCase()),
				);
			}
		});
	}

	return coachRows;
}

// Team-specific queries for premiere coaches
export async function getTeamMetrics(
	premiereCoachId: string,
): Promise<CoachMetrics> {
	const supabase = await createClient();

	// Get team member IDs
	const { data: teamMembers, error: teamError } = await supabase
		.from("coach_teams")
		.select("coach_id")
		.eq("premier_coach_id", premiereCoachId)
		.is("end_date", null);

	if (teamError) throw teamError;

	const teamMemberIds = teamMembers?.map((tm) => tm.coach_id) || [];

	// Include the premiere coach themselves
	const allCoachIds = [...teamMemberIds, premiereCoachId];

	// Get total coaches in team
	const totalCoaches = allCoachIds.length;

	// Count premiere coaches in the team (should be 1 - the current user)
	const uniquePremierCoaches = new Set([premiereCoachId]);

	// Get total active clients for team members
	const { count: totalClients, error: clientError } = await supabase
		.from("client_assignments")
		.select("*", { count: "exact", head: true })
		.in("user_id", allCoachIds)
		.is("end_date", null);

	if (clientError) throw clientError;

	// Get average rating from call feedback for team's clients
	const { data: clientAssignments } = await supabase
		.from("client_assignments")
		.select("client_id")
		.in("user_id", allCoachIds)
		.is("end_date", null);

	const teamClientIds = clientAssignments?.map((ca) => ca.client_id) || [];

	const { data: callFeedback, error: ratingError } = await supabase
		.from("call_feedback")
		.select("rating")
		.in("client_id", teamClientIds)
		.not("rating", "is", null);

	if (ratingError) throw ratingError;

	const avgRating =
		callFeedback && callFeedback.length > 0
			? callFeedback.reduce((sum, cf) => sum + (cf.rating || 0), 0) /
				callFeedback.length
			: 0;

	// Get sessions this week for team's clients
	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	const { count: sessionsThisWeek, error: sessionsError } = await supabase
		.from("client_activity")
		.select("*", { count: "exact", head: true })
		.in("client_id", teamClientIds)
		.gte("activity_date", oneWeekAgo.toISOString())
		.eq("type", "session");

	if (sessionsError) throw sessionsError;

	// Get NPS scores for team's clients
	const { data: npsScores, error: npsError } = await supabase
		.from("client_nps")
		.select("nps_score")
		.in("client_id", teamClientIds);

	if (npsError) throw npsError;

	// Calculate average NPS (keep it on 0-10 scale)
	const avgSatisfaction =
		npsScores && npsScores.length > 0
			? npsScores.reduce((sum, nps) => sum + nps.nps_score, 0) /
				npsScores.length
			: 0;

	// Calculate NPS distribution
	let detractors = 0;
	let passives = 0;
	let promoters = 0;

	npsScores?.forEach((nps) => {
		if (nps.nps_score <= 6) {
			detractors++;
		} else if (nps.nps_score <= 8) {
			passives++;
		} else {
			promoters++;
		}
	});

	// Calculate actual NPS score from distribution
	const npsResult = calculateNPSFromDistribution({
		detractors,
		passives,
		promoters,
	});

	return {
		totalCoaches: totalCoaches || 0,
		premierCoachCount: uniquePremierCoaches.size,
		regularCoachCount: (totalCoaches || 0) - uniquePremierCoaches.size,
		averageRating: Number.parseFloat(avgRating.toFixed(1)),
		averageSatisfaction: Number(avgSatisfaction.toFixed(1)),
		npsScore: npsResult.score,
		totalClients: totalClients || 0,
		sessionsThisWeek: sessionsThisWeek || 0,
		npsResponseCount: npsScores?.length || 0,
		npsDistribution: {
			detractors,
			passives,
			promoters,
		},
	};
}

export async function getTeamTopPerformers(
	premiereCoachId: string,
): Promise<CoachPerformance[]> {
	const supabase = await createClient();

	// Get team member IDs
	const { data: teamMembers, error: teamError } = await supabase
		.from("coach_teams")
		.select("coach_id")
		.eq("premier_coach_id", premiereCoachId)
		.is("end_date", null);

	if (teamError) throw teamError;

	const teamMemberIds = teamMembers?.map((tm) => tm.coach_id) || [];

	// Get team coaches
	const { data: coaches, error: coachError } = await supabase
		.from("user")
		.select("id, name, email, image")
		.in("id", teamMemberIds)
		.or("banned.is.null,banned.neq.true");

	if (coachError) throw coachError;

	// Get client assignments for team
	const { data: assignments, error: assignmentError } = await supabase
		.from("client_assignments")
		.select("user_id, client_id")
		.in("user_id", teamMemberIds)
		.is("end_date", null);

	if (assignmentError) throw assignmentError;

	// Count clients per coach
	const clientCountMap = new Map<string, string[]>();
	assignments?.forEach((assignment) => {
		const clients = clientCountMap.get(assignment.user_id) || [];
		clients.push(assignment.client_id);
		clientCountMap.set(assignment.user_id, clients);
	});

	// Get ratings from call feedback
	const coachRatings = new Map<string, number>();

	for (const [coachId, clientIds] of clientCountMap.entries()) {
		const { data: feedback } = await supabase
			.from("call_feedback")
			.select("rating")
			.in("client_id", clientIds)
			.not("rating", "is", null);

		if (feedback && feedback.length > 0) {
			const avgRating =
				feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
				feedback.length;
			coachRatings.set(coachId, avgRating);
		}
	}

	// Transform and sort by rating
	const performances = (coaches || [])
		.map((coach) => ({
			coachId: coach.id,
			coachName: coach.name,
			coachImage: coach.image,
			coachType: "Regular" as const, // Team members are regular coaches
			satisfactionPercentage: Math.floor(75 + Math.random() * 20), // MOCK DATA
			npsScore: 0, // TODO: Not currently using NPS score - just satisfying the type requirement
			clientCount: clientCountMap.get(coach.id)?.length || 0,
		}))
		.sort((a, b) => {
			// Sort by client count for now since we don't have satisfaction data
			return b.clientCount - a.clientCount;
		})
		.slice(0, 5);

	return performances;
}

export async function getTeamWorkloadDistribution(
	premiereCoachId: string,
): Promise<CoachWorkload[]> {
	const supabase = await createClient();

	// Get global default client units setting
	const globalDefaultSetting = await getSystemSetting(
		"global_default_client_units_per_coach",
	);
	const globalDefaultClientUnits = getSettingValue(globalDefaultSetting, 20); // fallback to 20

	// Get team member IDs
	const { data: teamMembers, error: teamError } = await supabase
		.from("coach_teams")
		.select("coach_id")
		.eq("premier_coach_id", premiereCoachId)
		.is("end_date", null);

	if (teamError) throw teamError;

	const teamMemberIds = teamMembers?.map((tm) => tm.coach_id) || [];

	// Get team coaches with capacity
	const { data: coaches, error: coachError } = await supabase
		.from("user")
		.select(`
			id,
			name,
			coach_capacity (
				max_client_units,
				is_paused
			)
		`)
		.in("id", teamMemberIds)
		.or("banned.is.null,banned.neq.true");

	if (coachError) throw coachError;

	// Get client assignments
	const { data: assignments, error: assignmentError } = await supabase
		.from("client_assignments")
		.select("user_id")
		.in("user_id", teamMemberIds)
		.is("end_date", null);

	if (assignmentError) throw assignmentError;

	// Count clients per coach
	const clientCountMap = new Map<string, number>();
	assignments?.forEach((assignment) => {
		const count = clientCountMap.get(assignment.user_id) || 0;
		clientCountMap.set(assignment.user_id, count + 1);
	});

	// Transform data
	return (coaches || []).map((coach) => ({
		coachId: coach.id,
		coachName: coach.name,
		coachImage: null, // Not fetched in this query
		clientCount: clientCountMap.get(coach.id) || 0,
		maxCapacity:
			coach.coach_capacity?.max_client_units || globalDefaultClientUnits,
		utilizationPercentage:
			((clientCountMap.get(coach.id) || 0) /
				(coach.coach_capacity?.max_client_units || globalDefaultClientUnits)) *
			100,
	}));
}
