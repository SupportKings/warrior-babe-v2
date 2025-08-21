"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getClient, getClientBasic, getAllClients } from "@/features/clients/actions/getClient";
import { createClientAction } from "@/features/clients/actions/createClient";
import { updateClientAction } from "@/features/clients/actions/updateClient";
import { deleteClient } from "@/features/clients/actions/deleteClient";

import type { ClientFormInput, ClientEditFormInput } from "@/features/clients/types/client";

// Query keys
export const clientQueries = {
	all: ["clients"] as const,
	lists: () => [...clientQueries.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...clientQueries.lists(), filters] as const,
	details: () => [...clientQueries.all, "detail"] as const,
	detail: (id: string) => [...clientQueries.details(), id] as const,
	basic: (id: string) => [...clientQueries.all, "basic", id] as const,
};

// Query hooks
export function useClients() {
	return useQuery({
		queryKey: clientQueries.lists(),
		queryFn: getAllClients,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useClient(id: string) {
	return useQuery({
		queryKey: clientQueries.detail(id),
		queryFn: () => getClient(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export function useClientBasic(id: string) {
	return useQuery({
		queryKey: clientQueries.basic(id),
		queryFn: () => getClientBasic(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Mutation hooks
export function useCreateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientFormInput) => createClientAction(data),
		onSuccess: () => {
			// Invalidate and refetch clients list
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
		},
	});
}

export function useUpdateClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClientEditFormInput) => updateClientAction(data),
		onSuccess: (result, variables) => {
			// Invalidate and refetch both the list and the specific client
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
			queryClient.invalidateQueries({ queryKey: clientQueries.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: clientQueries.basic(variables.id) });
		},
	});
}

export function useDeleteClient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteClient(id),
		onSuccess: (result, deletedId) => {
			// Remove the deleted client from the cache
			queryClient.removeQueries({ queryKey: clientQueries.detail(deletedId) });
			queryClient.removeQueries({ queryKey: clientQueries.basic(deletedId) });
			
			// Invalidate the clients list to refetch
			queryClient.invalidateQueries({ queryKey: clientQueries.lists() });
		},
	});
}

// Prefetch helpers
export function prefetchClients(queryClient: ReturnType<typeof useQueryClient>) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.lists(),
		queryFn: getAllClients,
		staleTime: 5 * 60 * 1000,
	});
}

export function prefetchClient(queryClient: ReturnType<typeof useQueryClient>, id: string) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.detail(id),
		queryFn: () => getClient(id),
		staleTime: 2 * 60 * 1000,
	});
}

export function prefetchClientBasic(queryClient: ReturnType<typeof useQueryClient>, id: string) {
	return queryClient.prefetchQuery({
		queryKey: clientQueries.basic(id),
		queryFn: () => getClientBasic(id),
		staleTime: 2 * 60 * 1000,
	});
}