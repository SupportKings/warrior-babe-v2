import { useQuery } from "@tanstack/react-query";
import {
	getCoachBasicInfo,
	getCoachClientAssignments,
	getCoachPayments,
} from "../actions/get-coach";

// Query keys factory
export const coachDetailsKeys = {
	all: ["coach-details"] as const,
	basicInfo: (id: string) =>
		[...coachDetailsKeys.all, "basic-info", id] as const,
	clientAssignments: (id: string) =>
		[...coachDetailsKeys.all, "client-assignments", id] as const,
	payments: (id: string) => [...coachDetailsKeys.all, "payments", id] as const,
};

// Hook for fetching coach basic info
export function useCoachBasicInfo(coachId: string) {
	return useQuery({
		queryKey: coachDetailsKeys.basicInfo(coachId),
		queryFn: () => getCoachBasicInfo(coachId),
		enabled: !!coachId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Hook for fetching coach client assignments
export function useCoachClientAssignments(coachId: string) {
	return useQuery({
		queryKey: coachDetailsKeys.clientAssignments(coachId),
		queryFn: () => getCoachClientAssignments(coachId),
		enabled: !!coachId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Hook for fetching coach payments
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
