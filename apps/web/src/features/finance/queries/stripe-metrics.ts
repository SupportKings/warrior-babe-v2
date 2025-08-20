import { createClient } from "@/utils/supabase/serviceRole";
import type { ActiveSubscriptionsByPlan } from "../types/stripe-metrics";

// Server-side query using service role
export async function getActiveSubscriptionsByPlan() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("active_subscriptions_by_plan")
		.select("*")
		.order("active_subscription_count", { ascending: false });

	if (error) {
		console.error("Error fetching active subscriptions:", error);
		throw new Error(`Failed to fetch active subscriptions: ${error.message}`);
	}

	return data as ActiveSubscriptionsByPlan[];
}

// Refresh the materialized view
export async function refreshActiveSubscriptionsView() {
	const supabase = await createClient();

	const { error } = await supabase.rpc("refresh_active_subscriptions_view_concurrent");

	if (error) {
		console.error("Error refreshing view:", error);
		throw new Error(`Failed to refresh subscriptions view: ${error.message}`);
	}

	return { success: true, refreshedAt: new Date().toISOString() };
}

// Get subscriptions for a specific plan
export async function getSubscriptionsByPlanId(stripeProductId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("active_subscriptions_by_plan")
		.select("*")
		.eq("stripe_product_id", stripeProductId)
		.single();

	if (error) {
		console.error("Error fetching plan subscriptions:", error);
		throw new Error(`Failed to fetch plan subscriptions: ${error.message}`);
	}

	return data as ActiveSubscriptionsByPlan;
}

// Get total MRR across all plans
export async function getTotalMRR() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("active_subscriptions_by_plan")
		.select("monthly_recurring_revenue_cents, currency");

	if (error) {
		console.error("Error fetching total MRR:", error);
		throw new Error(`Failed to fetch total MRR: ${error.message}`);
	}

	// Group by currency
	const mrrByCurrency = data.reduce((acc, row) => {
		const currency = row.currency || "usd";
		const mrr = row.monthly_recurring_revenue_cents || 0;
		
		if (!acc[currency]) {
			acc[currency] = 0;
		}
		acc[currency] += mrr;
		
		return acc;
	}, {} as Record<string, number>);

	return mrrByCurrency;
}

// Get subscription metrics summary
export async function getSubscriptionMetricsSummary() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("active_subscriptions_by_plan")
		.select("*");

	if (error) {
		console.error("Error fetching metrics summary:", error);
		throw new Error(`Failed to fetch metrics summary: ${error.message}`);
	}

	const summary = {
		totalPlans: data.length,
		totalActiveSubscriptions: data.reduce((sum, row) => sum + row.active_subscription_count, 0),
		totalUniqueCustomers: new Set(data.flatMap(row => row.stripe_customer_ids || [])).size,
		totalMrrCents: data.reduce((sum, row) => sum + (row.monthly_recurring_revenue_cents || 0), 0),
		plansWithCancellations: data.filter(row => row.canceling_at_period_end_count > 0).length,
		totalCancellations: data.reduce((sum, row) => sum + row.canceling_at_period_end_count, 0),
	};

	return summary;
}