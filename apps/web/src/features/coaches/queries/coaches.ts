import type { FiltersState } from "@/components/data-table-filter/core/types";
import {
	getAllCoaches,
	getAvailableCoaches,
	getCoachCertifications,
	getCoachClientCountRange,
	getCoachClients,
	getCoachDetails,
	getCoachMetrics,
	getCoachPerformanceHistory,
	getCoachSpecializations,
	getCoachTeamMembers,
	getCoachTypes,
	getOverallRenewalRate,
	getRenewalRateRankings,
	getTopPerformers,
	getWorkloadDistribution,
} from "./server-queries";
import { getCoachCombinedActivity } from "./getCoachCombinedActivity";

export const coachQueries = {
	// Get all coaches with their capacity and client count
	allCoaches: (filters?: FiltersState, teamFilter?: { premiereCoachId: string }) => ({
		queryKey: ["coaches", "all", filters, teamFilter],
		queryFn: () => getAllCoaches(filters, teamFilter),
	}),

	// Get coach metrics for KPI boxes
	metrics: (teamFilter?: { premiereCoachId: string }) => ({
		queryKey: ["coaches", "metrics", teamFilter],
		queryFn: () => getCoachMetrics(teamFilter),
	}),

	// Get top performing coaches
	topPerformers: (teamFilter?: { premiereCoachId: string }) => ({
		queryKey: ["coaches", "top-performers", teamFilter],
		queryFn: () => getTopPerformers(teamFilter),
	}),

	// Get workload distribution
	workloadDistribution: (teamFilter?: { premiereCoachId: string }) => ({
		queryKey: ["coaches", "workload", teamFilter],
		queryFn: () => getWorkloadDistribution(teamFilter),
	}),

	// Get renewal rate rankings
	renewalRateRankings: (teamFilter?: { premiereCoachId: string }) => ({
		queryKey: ["coaches", "renewal-rate-rankings", teamFilter],
		queryFn: () => getRenewalRateRankings(teamFilter),
	}),

	// Get overall renewal rate
	overallRenewalRate: (teamFilter?: { premiereCoachId: string }) => ({
		queryKey: ["coaches", "overall-renewal-rate", teamFilter],
		queryFn: () => getOverallRenewalRate(teamFilter),
	}),

	// Faceted queries for filtering
	faceted: {
		// Get unique coach types with counts
		types: () => ({
			queryKey: ["coaches", "faceted", "types"],
			queryFn: getCoachTypes,
		}),

		// Get unique specializations with counts
		specializations: () => ({
			queryKey: ["coaches", "faceted", "specializations"],
			queryFn: getCoachSpecializations,
		}),

		// Get unique certifications with counts
		certifications: () => ({
			queryKey: ["coaches", "faceted", "certifications"],
			queryFn: getCoachCertifications,
		}),

		// Get client count range
		clientCounts: () => ({
			queryKey: ["coaches", "faceted", "clientCounts"],
			queryFn: getCoachClientCountRange,
		}),
	},

	// Get detailed coach profile
	coachDetails: (coachId: string) => ({
		queryKey: ["coaches", "detail", coachId],
		queryFn: () => getCoachDetails(coachId),
	}),

	// Get coach's current clients with details
	coachClients: (coachId: string) => ({
		queryKey: ["coaches", "clients", coachId],
		queryFn: () => getCoachClients(coachId),
	}),

	// Get coach performance history
	coachPerformanceHistory: (coachId: string) => ({
		queryKey: ["coaches", "performance-history", coachId],
		queryFn: () => getCoachPerformanceHistory(coachId),
	}),

	// Get coach team members (for premier coaches)
	coachTeamMembers: (coachId: string) => ({
		queryKey: ["coaches", "team-members", coachId],
		queryFn: () => getCoachTeamMembers(coachId),
	}),

	// Get available coaches (not in any team and not premier coaches)
	availableCoaches: (excludeCoachId?: string) => ({
		queryKey: ["coaches", "available", excludeCoachId],
		queryFn: () => getAvailableCoaches(excludeCoachId),
	}),


	// Get combined activity for coach (comments + audit logs)
	coachCombinedActivity: (coachId: string) => ({
		queryKey: ["coaches", "combined-activity", coachId],
		queryFn: () => getCoachCombinedActivity(coachId),
	}),
};
