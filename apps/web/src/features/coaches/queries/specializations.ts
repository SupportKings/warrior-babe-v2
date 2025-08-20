"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserSpecializations, getUserPrimarySpecialization, getAllSpecializations } from "./specializations.server";
import type { Specialization, UserSpecialization } from "./specializations.server";

// Export types for use in components
export type { Specialization, UserSpecialization };

// Client hook to get user's specializations
export function useUserSpecializations(userId: string) {
	return useQuery({
		queryKey: ["specializations", "user", userId],
		queryFn: () => getUserSpecializations(userId),
		enabled: !!userId,
	});
}

// Client hook to get user's primary specialization
export function useUserPrimarySpecialization(userId: string) {
	return useQuery({
		queryKey: ["specializations", "user", userId, "primary"],
		queryFn: () => getUserPrimarySpecialization(userId),
		enabled: !!userId,
	});
}

// Client hook to get all specializations
export function useAllSpecializations() {
	return useQuery({
		queryKey: ["specializations", "all"],
		queryFn: () => getAllSpecializations(),
	});
}