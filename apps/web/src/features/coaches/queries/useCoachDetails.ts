import { useQuery } from "@tanstack/react-query";
import { 
	getCoachBasicInfo, 
	getCoachClientAssignments, 
	getCoachPayments 
} from "../actions/get-coach";

// Query keys factory
export const coachDetailsKeys = {
	all: ["coach-details"] as const,
	basicInfo: (id: string) => [...coachDetailsKeys.all, "basic-info", id] as const,
	clientAssignments: (id: string) => [...coachDetailsKeys.all, "client-assignments", id] as const,
	payments: (id: string) => [...coachDetailsKeys.all, "payments", id] as const,
};

/**
 * React Query hook to fetch a coach's basic profile information.
 *
 * Runs only when `coachId` is truthy and caches results for 5 minutes.
 *
 * @param coachId - Identifier of the coach to fetch
 * @returns React Query result object (data, status, error, etc.)
 */
export function useCoachBasicInfo(coachId: string) {
	return useQuery({
		queryKey: coachDetailsKeys.basicInfo(coachId),
		queryFn: () => getCoachBasicInfo(coachId),
		enabled: !!coachId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * React Query hook to fetch a coach's client assignments.
 *
 * Runs `getCoachClientAssignments(coachId)` and returns the query result. The query is enabled only when `coachId` is truthy and uses a 5-minute stale time.
 *
 * @param coachId - Coach identifier; query will not run if falsy.
 * @returns The React Query result object for the client assignments query.
 */
export function useCoachClientAssignments(coachId: string) {
	return useQuery({
		queryKey: coachDetailsKeys.clientAssignments(coachId),
		queryFn: () => getCoachClientAssignments(coachId),
		enabled: !!coachId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * React Query hook to fetch payments for a specific coach.
 *
 * Fetches coach payments via `getCoachPayments` and caches the result for 5 minutes.
 *
 * @param coachId - The coach's unique identifier; the query is disabled when falsy.
 * @returns The React Query result for the payments query (data, status, error, etc.).
 */
export function useCoachPayments(coachId: string) {
	return useQuery({
		queryKey: coachDetailsKeys.payments(coachId),
		queryFn: () => getCoachPayments(coachId),
		enabled: !!coachId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Server-side prefetch queries for coach details page
export const coachDetailsQueries = {
	basicInfo: (id: string) => ({
		queryKey: coachDetailsKeys.basicInfo(id),
		queryFn: () => getCoachBasicInfo(id),
		staleTime: 5 * 60 * 1000,
	}),
	clientAssignments: (id: string) => ({
		queryKey: coachDetailsKeys.clientAssignments(id),
		queryFn: () => getCoachClientAssignments(id),
		staleTime: 5 * 60 * 1000,
	}),
	payments: (id: string) => ({
		queryKey: coachDetailsKeys.payments(id),
		queryFn: () => getCoachPayments(id),
		staleTime: 5 * 60 * 1000,
	}),
};