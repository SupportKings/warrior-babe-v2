"use client";

import { getUser } from "@/queries/getUser";

import { useQuery } from "@tanstack/react-query";

export function useUser() {
	const { data: session, isLoading: isPending } = useQuery({
		queryKey: ["user"],
		queryFn: getUser,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	return {
		user: session?.user,
		isPending,
		role: session?.user?.role as string | undefined,
	};
}

export function usePermissions() {
	const { user, role } = useUser();
	const isPremiereCoach = role === "premiereCoach";
	const isCPO = role === "cpo";
	const isCSManager = role === "csManager";
	const isCoach = role === "coach";
	const isCSC = role === "csc";
	const isAdmin = role === "admin";

	// Client permissions
	const canEditClients = isPremiereCoach || isCPO || isCSManager || isAdmin;
	const canAssignCoaches = isPremiereCoach || isCPO || isCSManager || isAdmin;
	const canStartOffboarding =
		isPremiereCoach || isCPO || isCSManager || isAdmin;

	// Onboarding permissions
	const canEditOnboardingTemplates =
		isPremiereCoach || isCPO || isCSManager || isAdmin;
	const canEditAnyOnboarding =
		isPremiereCoach || isCPO || isCSManager || isAdmin;
	const canViewOnboardingDashboard = true; // All roles except basic user

	// Offboarding permissions
	const canEditAnyOffboarding =
		isPremiereCoach || isCPO || isCSManager || isAdmin;
	const canViewOffboardingDashboard = !isCSC; // All roles except CSC

	return {
		user,
		role,
		isPremiereCoach,
		isCPO,
		isCSManager,
		isCoach,
		isCSC,
		isAdmin,
		// Client permissions
		canEditClients,
		canAssignCoaches,
		canStartOffboarding,
		// Onboarding permissions
		canEditOnboardingTemplates,
		canEditAnyOnboarding,
		canViewOnboardingDashboard,
		// Offboarding permissions
		canEditAnyOffboarding,
		canViewOffboardingDashboard,
	};
}

// Helper to check if user can edit specific client's onboarding/offboarding
export function useCanEditClientProgress(clientId: string, assignments: any[]) {
	const { user, role } = useUser();
	const { canEditAnyOnboarding, canEditAnyOffboarding } = usePermissions();

	// Admin roles can edit any client
	if (canEditAnyOnboarding) {
		return {
			canEditOnboarding: true,
			canEditOffboarding: canEditAnyOffboarding,
		};
	}

	// Coach/CSC can only edit assigned clients' onboarding
	const isAssigned = assignments?.some(
		(assignment) =>
			assignment.client_id === clientId &&
			(assignment.coach_id === user?.id || assignment.csc_id === user?.id),
	);

	return {
		canEditOnboarding: (role === "coach" || role === "csc") && isAssigned,
		canEditOffboarding: false, // Only admin roles can edit offboarding
	};
}
