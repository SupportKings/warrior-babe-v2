"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentSlotsForClient, getAllAvailablePaymentSlots } from "../actions/getPaymentSlots";

// React Query hook for client-specific payment slots
export function usePaymentSlotsForClient(clientId?: string) {
	return useQuery({
		queryKey: ["payment-slots", "client", clientId],
		queryFn: () => clientId ? getPaymentSlotsForClient(clientId) : [],
		enabled: !!clientId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// React Query hook for all available payment slots
export function useAllAvailablePaymentSlots() {
	return useQuery({
		queryKey: ["payment-slots", "available", "all"],
		queryFn: getAllAvailablePaymentSlots,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}