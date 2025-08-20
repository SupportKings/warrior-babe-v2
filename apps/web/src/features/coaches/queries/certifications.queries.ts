import { getAllCertifications, getUserCertifications } from "./certifications.server";

// Export query options for prefetching or manual use
export const certificationQueries = {
	allCertifications: () => ({
		queryKey: ["certifications", "all"],
		queryFn: () => getAllCertifications(),
	}),
	userCertifications: (userId: string) => ({
		queryKey: ["certifications", "user", userId],
		queryFn: () => getUserCertifications(userId),
	}),
};