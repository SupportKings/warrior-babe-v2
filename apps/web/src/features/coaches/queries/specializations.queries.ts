import { getAllSpecializations, getUserSpecializations, getUserPrimarySpecialization } from "./specializations.server";

// Export query options for prefetching or manual use
export const specializationQueries = {
	allSpecializations: () => ({
		queryKey: ["specializations", "all"],
		queryFn: () => getAllSpecializations(),
	}),
	userSpecializations: (userId: string) => ({
		queryKey: ["specializations", "user", userId],
		queryFn: () => getUserSpecializations(userId),
	}),
	userPrimarySpecialization: (userId: string) => ({
		queryKey: ["specializations", "user", userId, "primary"],
		queryFn: () => getUserPrimarySpecialization(userId),
	}),
};