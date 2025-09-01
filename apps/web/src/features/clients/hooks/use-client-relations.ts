import { useMemo } from "react";

import { useClient } from "../queries/useClients";

/**
 * Standardized hooks for client relations
 * Extracts specific relation data from the main client query to avoid redundant API calls
 */

export function useClientPaymentPlans(clientId: string) {
	const { data: client, ...rest } = useClient(clientId);

	const paymentPlans = useMemo(() => {
		return client?.payment_plans || [];
	}, [client?.payment_plans]);

	return {
		...rest,
		data: paymentPlans,
	};
}

export function useClientAssignedCoaches(clientId: string) {
	const { data: client, ...rest } = useClient(clientId);

	const assignedCoaches = useMemo(() => {
		if (!client?.client_assignments) return [];

		// Extract unique coaches from assignments
		const coaches = client.client_assignments
			.map((assignment) => assignment.coach)
			.filter(Boolean);

		// Remove duplicates based on coach id
		const uniqueCoaches = coaches.filter(
			(coach, index, self) =>
				self.findIndex((c) => c?.id === coach?.id) === index,
		);

		return uniqueCoaches;
	}, [client?.client_assignments]);

	return {
		...rest,
		data: assignedCoaches,
	};
}

// Extract other relation data from main client query
export function useClientGoals(clientId: string) {
	const { data: client, ...rest } = useClient(clientId);

	const goals = useMemo(() => {
		return client?.client_goals || [];
	}, [client?.client_goals]);

	return {
		...rest,
		data: goals,
	};
}

export function useClientWins(clientId: string) {
	const { data: client, ...rest } = useClient(clientId);

	const wins = useMemo(() => {
		return client?.client_wins || [];
	}, [client?.client_wins]);

	return {
		...rest,
		data: wins,
	};
}

export function useClientActivityPeriods(clientId: string) {
	const { data: client, ...rest } = useClient(clientId);

	const activityPeriods = useMemo(() => {
		return client?.client_activity_periods || [];
	}, [client?.client_activity_periods]);

	return {
		...rest,
		data: activityPeriods,
	};
}

export function useClientNPSScores(clientId: string) {
	const { data: client, ...rest } = useClient(clientId);

	const npsScores = useMemo(() => {
		return client?.client_nps || [];
	}, [client?.client_nps]);

	return {
		...rest,
		data: npsScores,
	};
}

export function useClientTestimonials(clientId: string) {
	const { data: client, ...rest } = useClient(clientId);

	const testimonials = useMemo(() => {
		return client?.client_testimonials || [];
	}, [client?.client_testimonials]);

	return {
		...rest,
		data: testimonials,
	};
}
