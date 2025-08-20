// Types for Stripe metrics materialized views

export interface ActiveSubscriptionsByPlan {
	plan_name: string;
	stripe_product_id: string | null;
	plan_description: string | null;
	stripe_price_id: string | null;
	price_cents: number | null;
	currency: string | null;
	billing_interval: "monthly" | "yearly" | "weekly" | "daily" | "one_time" | "custom";
	active_subscription_count: number;
	unique_customer_count: number;
	monthly_recurring_revenue_cents: number | null;
	total_revenue_cents: number | null;
	customer_emails: string[] | null;
	stripe_customer_ids: string[] | null;
	earliest_subscription_date: string | null;
	latest_period_end_date: string | null;
	canceling_at_period_end_count: number;
}

// Helper type for formatted display
export interface FormattedSubscriptionMetrics {
	planName: string;
	productId: string | null;
	description: string | null;
	pricing: {
		amount: number;
		currency: string;
		interval: string;
		formattedAmount: string;
	} | null;
	metrics: {
		activeSubscriptions: number;
		uniqueCustomers: number;
		mrr: number;
		formattedMrr: string;
		cancelingCount: number;
		churnRisk: number; // percentage
	};
	customers: {
		emails: string[];
		stripeIds: string[];
	};
	dates: {
		earliestSubscription: Date | null;
		latestPeriodEnd: Date | null;
	};
}

// Utility function to format currency
export function formatCurrency(cents: number | null, currency: string | null): string {
	if (cents === null || currency === null) return "N/A";
	
	const amount = cents / 100;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.toUpperCase(),
	}).format(amount);
}

// Transform raw data to formatted metrics
export function formatSubscriptionMetrics(
	raw: ActiveSubscriptionsByPlan
): FormattedSubscriptionMetrics {
	const mrr = raw.monthly_recurring_revenue_cents || 0;
	const churnRisk = raw.active_subscription_count > 0
		? (raw.canceling_at_period_end_count / raw.active_subscription_count) * 100
		: 0;

	return {
		planName: raw.plan_name,
		productId: raw.stripe_product_id,
		description: raw.plan_description,
		pricing: raw.price_cents !== null && raw.currency !== null
			? {
					amount: raw.price_cents / 100,
					currency: raw.currency,
					interval: raw.billing_interval,
					formattedAmount: formatCurrency(raw.price_cents, raw.currency),
			  }
			: null,
		metrics: {
			activeSubscriptions: raw.active_subscription_count,
			uniqueCustomers: raw.unique_customer_count,
			mrr: mrr / 100,
			formattedMrr: formatCurrency(mrr, raw.currency || "usd"),
			cancelingCount: raw.canceling_at_period_end_count,
			churnRisk: Math.round(churnRisk * 100) / 100,
		},
		customers: {
			emails: raw.customer_emails || [],
			stripeIds: raw.stripe_customer_ids || [],
		},
		dates: {
			earliestSubscription: raw.earliest_subscription_date
				? new Date(raw.earliest_subscription_date)
				: null,
			latestPeriodEnd: raw.latest_period_end_date
				? new Date(raw.latest_period_end_date)
				: null,
		},
	};
}