"use client";

import { useQuery } from "@tanstack/react-query";
import type { Certification, UserCertification } from "./certifications.server";
import {
	getAllCertifications,
	getUserCertifications,
} from "./certifications.server";

// Export types for use in components
export type { Certification, UserCertification };

// Client hook to get all certifications
export function useAllCertifications() {
	return useQuery({
		queryKey: ["certifications", "all"],
		queryFn: () => getAllCertifications(),
	});
}

// Client hook to get user's certifications
export function useUserCertifications(userId: string) {
	return useQuery({
		queryKey: ["certifications", "user", userId],
		queryFn: () => getUserCertifications(userId),
		enabled: !!userId,
	});
}
