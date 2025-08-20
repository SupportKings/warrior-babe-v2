import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	getAllCoachesCapacity,
	getAllProducts,
	getCapacityMetrics,
	getGlobalCapacitySettings,
	getProductDistribution,
} from "./server-queries";

export const capacityQueries = {
	metrics: (teamFilter?: { premiereCoachId: string }) =>
		queryOptions({
			queryKey: ["capacity", "metrics", teamFilter],
			queryFn: () => getCapacityMetrics(teamFilter),
		}),

	coaches: (teamFilter?: { premiereCoachId: string }) =>
		queryOptions({
			queryKey: ["capacity", "coaches", teamFilter],
			queryFn: () => getAllCoachesCapacity(teamFilter),
		}),

	globalSettings: () =>
		queryOptions({
			queryKey: ["capacity", "global-settings"],
			queryFn: () => getGlobalCapacitySettings(),
		}),

	productDistribution: () =>
		queryOptions({
			queryKey: ["capacity", "product-distribution"],
			queryFn: () => getProductDistribution(),
		}),

	products: () =>
		queryOptions({
			queryKey: ["capacity", "products"],
			queryFn: () => getAllProducts(),
		}),
};

export function useCapacityMetrics(teamFilter?: { premiereCoachId: string }) {
	return useQuery(capacityQueries.metrics(teamFilter));
}

export function useCoachesCapacity() {
	return useQuery(capacityQueries.coaches());
}

export function useGlobalCapacitySettings() {
	return useQuery(capacityQueries.globalSettings());
}

export function useProductDistribution() {
	return useQuery(capacityQueries.productDistribution());
}

export function useProducts() {
	return useQuery(capacityQueries.products());
}
