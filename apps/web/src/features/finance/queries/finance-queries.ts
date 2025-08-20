import { queryOptions } from "@tanstack/react-query";
import {
	getActiveSubscriptions,
	getCashCollectionMetrics,
	getChurnMetrics,
	getCustomerMetrics,
	getKPIMetrics,
	getMRR,
	getRevenueChartData,
	getRevenueMetrics,
} from "./server-queries";

// Define a client-side DateRange type that accepts Date objects
interface ClientDateRange {
	from: Date | string;
	to: Date | string;
}

// Helper to convert client dates to server-safe values including timestamps
function serializeDateRange(dateRange: ClientDateRange): {
	from: string;
	to: string;
	fromTimestamp: number;
	toTimestamp: number;
} {
	// Try to handle the case where dateRange might be a client reference
	try {
		// Handle Date objects
		let fromTimestamp: number;
		let toTimestamp: number;
		let from: string;
		let to: string;

		if (dateRange.from instanceof Date) {
			fromTimestamp = Math.floor(dateRange.from.getTime() / 1000);
			from = dateRange.from.toISOString();
		} else {
			from = String(dateRange.from);
			const fromDate = new Date(from);
			fromTimestamp = Math.floor(fromDate.getTime() / 1000);
		}

		if (dateRange.to instanceof Date) {
			toTimestamp = Math.floor(dateRange.to.getTime() / 1000);
			to = dateRange.to.toISOString();
		} else {
			to = String(dateRange.to);
			const toDate = new Date(to);
			toTimestamp = Math.floor(toDate.getTime() / 1000);
		}

		// Validate timestamps
		if (Number.isNaN(fromTimestamp) || Number.isNaN(toTimestamp)) {
			throw new Error("Invalid timestamps");
		}

		return {
			from,
			to,
			fromTimestamp,
			toTimestamp,
		};
	} catch (error) {
		console.error("Error in serializeDateRange:", error);
		// Fallback to current date range (last 30 days)
		const now = Date.now();
		const toTimestamp = Math.floor(now / 1000);
		const fromTimestamp = toTimestamp - 30 * 24 * 60 * 60; // 30 days ago
		const to = new Date(now).toISOString();
		const from = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

		return {
			from,
			to,
			fromTimestamp,
			toTimestamp,
		};
	}
}

// Revenue metrics query
export const revenueMetricsQuery = (dateRange: ClientDateRange) =>
	queryOptions({
		queryKey: ["finance", "revenue-metrics", dateRange],
		queryFn: () => getRevenueMetrics(serializeDateRange(dateRange)),
	});

// Active subscriptions query
export const activeSubscriptionsQuery = (dateRange: ClientDateRange) =>
	queryOptions({
		queryKey: ["finance", "active-subscriptions", dateRange],
		queryFn: () => getActiveSubscriptions(serializeDateRange(dateRange)),
	});

// Monthly recurring revenue query
export const mrrQuery = () =>
	queryOptions({
		queryKey: ["finance", "mrr"],
		queryFn: () => getMRR(),
	});

// Customer metrics query
export const customerMetricsQuery = (dateRange: ClientDateRange) =>
	queryOptions({
		queryKey: ["finance", "customer-metrics", dateRange],
		queryFn: () => getCustomerMetrics(serializeDateRange(dateRange)),
	});

// Chart data query for revenue over time
export const revenueChartQuery = (dateRange: ClientDateRange) =>
	queryOptions({
		queryKey: ["finance", "revenue-chart", dateRange],
		queryFn: () => getRevenueChartData(serializeDateRange(dateRange)),
	});

// KPI metrics query
export const kpiMetricsQuery = (dateRange: ClientDateRange) =>
	queryOptions({
		queryKey: ["finance", "kpi-metrics", dateRange],
		queryFn: () => getKPIMetrics(serializeDateRange(dateRange)),
	});

// Cash collection metrics query
export const cashCollectionQuery = (dateRange: ClientDateRange) =>
	queryOptions({
		queryKey: ["finance", "cash-collection", dateRange],
		queryFn: () => getCashCollectionMetrics(serializeDateRange(dateRange)),
	});

// Churn metrics query
export const churnMetricsQuery = (dateRange: ClientDateRange) =>
	queryOptions({
		queryKey: ["finance", "churn-metrics", dateRange],
		queryFn: () => getChurnMetrics(serializeDateRange(dateRange)),
	});

// Export the client date range type
export type DateRange = ClientDateRange;
