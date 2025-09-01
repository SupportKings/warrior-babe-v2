import { useMemo } from "react";

import { useClient } from "./useClients";

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
