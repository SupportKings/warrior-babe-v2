"use server";

import { createClient } from "@/utils/supabase/server";

export interface DateRange {
	from: string;
	to: string;
	fromTimestamp: number;
	toTimestamp: number;
}

export async function getRevenueMetrics(dateRange: DateRange) {
	const supabase = await createClient();

	// Use pre-calculated timestamps from client
	const { fromTimestamp, toTimestamp } = dateRange;

	// Get total revenue from charges
	const { data: charges, error: chargesError } = await supabase
		.schema("stripe")
		.from("charges")
		.select("amount, currency, created")
		.eq("paid", true)
		.gte("created", fromTimestamp)
		.lte("created", toTimestamp);

	if (chargesError) throw chargesError;

	// Calculate total revenue
	const totalRevenue =
		charges?.reduce((sum, charge) => {
			return sum + (charge.amount || 0) / 100; // Convert from cents
		}, 0) || 0;

	// Get previous period for comparison
	const periodDuration = toTimestamp - fromTimestamp;
	const previousFromTimestamp = fromTimestamp - periodDuration;
	const previousToTimestamp = fromTimestamp;

	const { data: previousCharges, error: previousError } = await supabase
		.schema("stripe")
		.from("charges")
		.select("amount")
		.eq("paid", true)
		.gte("created", previousFromTimestamp)
		.lt("created", previousToTimestamp);

	if (previousError) throw previousError;

	const previousRevenue =
		previousCharges?.reduce((sum, charge) => {
			return sum + (charge.amount || 0) / 100;
		}, 0) || 0;

	const growth = totalRevenue - previousRevenue;
	const growthPercentage =
		previousRevenue > 0 ? (growth / previousRevenue) * 100 : 0;

	return {
		totalRevenue,
		previousRevenue,
		growth,
		growthPercentage,
		chargeCount: charges?.length || 0,
	};
}

export async function getActiveSubscriptions(_dateRange: DateRange) {
	const supabase = await createClient();

	// First get all active subscriptions with their items
	const { data: subscriptions, error } = await supabase
		.schema("stripe")
		.from("subscriptions")
		.select(`
			id, 
			status, 
			current_period_end, 
			customer, 
			metadata,
			created,
			subscription_items!inner(
				price,
				prices!inner(
					product,
					products!inner(
						name
					)
				)
			)
		`)
		.in("status", ["active", "trialing"]);

	if (error) throw error;

	// Group by actual product name
	const subscriptionsByProduct = subscriptions?.reduce(
		(acc, sub) => {
			// Get the first product name from the subscription items
			const productName =
				sub.subscription_items?.[0]?.prices?.products?.name ||
				"Unknown Product";

			if (!acc[productName]) {
				acc[productName] = { count: 0, subscriptions: [] };
			}
			acc[productName].count++;
			acc[productName].subscriptions.push(sub);
			return acc;
		},
		{} as Record<
			string,
			{ count: number; subscriptions: typeof subscriptions }
		>,
	);

	return {
		totalActive: subscriptions?.length || 0,
		byType: subscriptionsByProduct || {},
	};
}

export async function getMRR() {
	const supabase = await createClient();

	// Get all active subscriptions
	const { data: subscriptions, error } = await supabase
		.schema("stripe")
		.from("subscriptions")
		.select("*")
		.in("status", ["active", "trialing"]);

	if (error) throw error;

	// Get subscription items for pricing info
	const subscriptionIds = subscriptions?.map((sub) => sub.id) || [];

	if (subscriptionIds.length === 0) {
		return {
			mrr: 0,
			activeSubscriptions: 0,
		};
	}

	const { data: subscriptionItems, error: itemsError } = await supabase
		.schema("stripe")
		.from("subscription_items")
		.select("subscription, quantity, price")
		.in("subscription", subscriptionIds);

	if (itemsError) throw itemsError;

	// Get price details
	const priceIds = [
		...new Set(
			subscriptionItems?.map((item) => item.price).filter(Boolean) || [],
		),
	] as string[];

	if (priceIds.length === 0) {
		return {
			mrr: 0,
			activeSubscriptions: subscriptions?.length || 0,
		};
	}

	const { data: prices, error: pricesError } = await supabase
		.schema("stripe")
		.from("prices")
		.select("id, unit_amount, recurring")
		.in("id", priceIds);

	if (pricesError) throw pricesError;

	// Calculate MRR
	let totalMRR = 0;
	const priceMap = new Map(prices?.map((p) => [p.id, p]) || []);

	subscriptionItems?.forEach((item) => {
		if (!item.price) return;
		const price = priceMap.get(item.price);
		if (price) {
			const recurring = price.recurring as Record<
				string,
				string | number
			> | null;
			if (recurring?.interval === "month") {
				totalMRR += ((price.unit_amount || 0) * (item.quantity || 1)) / 100;
			} else if (recurring?.interval === "year") {
				totalMRR +=
					((price.unit_amount || 0) * (item.quantity || 1)) / 100 / 12;
			}
		}
	});

	return {
		mrr: totalMRR,
		activeSubscriptions: subscriptions?.length || 0,
	};
}

export async function getCustomerMetrics(dateRange: DateRange) {
	const supabase = await createClient();

	// Use pre-calculated timestamps from client
	const { fromTimestamp, toTimestamp } = dateRange;

	// Get new customers in date range
	const { data: newCustomers, error } = await supabase
		.schema("stripe")
		.from("customers")
		.select("id, email, created")
		.gte("created", fromTimestamp)
		.lte("created", toTimestamp)
		.eq("deleted", false);

	if (error) throw error;

	// Get total customers
	const { count: totalCustomers, error: countError } = await supabase
		.schema("stripe")
		.from("customers")
		.select("id", { count: "exact", head: true })
		.eq("deleted", false);

	if (countError) throw countError;

	return {
		newCustomers: newCustomers?.length || 0,
		totalCustomers: totalCustomers || 0,
		newCustomersList: newCustomers || [],
	};
}

export async function getRevenueChartData(dateRange: DateRange) {
	const supabase = await createClient();

	// Use pre-calculated timestamps from client
	const { fromTimestamp, toTimestamp } = dateRange;

	// First get all product names from active subscriptions to use as categories
	const { data: subscriptions } = await supabase
		.schema("stripe")
		.from("subscriptions")
		.select(`
			subscription_items!inner(
				price,
				prices!inner(
					product,
					products!inner(
						name
					)
				)
			)
		`)
		.in("status", ["active", "trialing"]);

	// Get unique product names
	const productNames = new Set<string>();
	subscriptions?.forEach((sub) => {
		const productName = sub.subscription_items?.[0]?.prices?.products?.name;
		if (productName) {
			productNames.add(productName);
		}
	});

	const categories = Array.from(productNames);

	// If no products found, fall back to generic categories
	if (categories.length === 0) {
		categories.push("Group A", "Group B", "Group C");
	}

	// Get charges data - use simpler query without complex joins
	const { data: charges, error } = await supabase
		.schema("stripe")
		.from("charges")
		.select("amount, created, metadata")
		.eq("paid", true)
		.gte("created", fromTimestamp)
		.lte("created", toTimestamp)
		.order("created", { ascending: true });

	if (error) throw error;

	// Group charges by day and distribute across categories
	// Since we can't easily link charges to specific products without complex joins,
	// we'll distribute them proportionally based on subscription counts
	const subscriptionCounts = subscriptions?.reduce(
		(acc, sub) => {
			const productName =
				sub.subscription_items?.[0]?.prices?.products?.name || "Unknown";
			acc[productName] = (acc[productName] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const totalSubs = Object.values(subscriptionCounts || {}).reduce(
		(sum, count) => sum + count,
		0,
	);

	const chartData = charges?.reduce(
		(acc, charge, index) => {
			if (!charge.created) return acc;

			const milliseconds = charge.created * 1000;
			const dateKey = new Date(milliseconds).toISOString().split("T")[0];

			if (!acc[dateKey]) {
				acc[dateKey] = { date: dateKey };
				categories.forEach((category) => {
					acc[dateKey][category] = 0;
				});
			}

			const amount = (charge.amount || 0) / 100;

			// Distribute charge amount across categories based on subscription proportions
			// or use round-robin if no subscription data
			if (totalSubs > 0 && subscriptionCounts) {
				categories.forEach((category) => {
					const proportion = (subscriptionCounts[category] || 0) / totalSubs;
					(acc[dateKey][category] as number) += amount * proportion;
				});
			} else {
				// Fallback: round-robin distribution
				const categoryIndex = index % categories.length;
				const category = categories[categoryIndex];
				(acc[dateKey][category] as number) += amount;
			}

			return acc;
		},
		{} as Record<string, Record<string, number | string>>,
	);

	return Object.values(chartData || {});
}

export async function getKPIMetrics(dateRange: DateRange) {
	const supabase = await createClient();

	// Use pre-calculated timestamps from client
	const { fromTimestamp, toTimestamp } = dateRange;

	// Get monthly revenue from charges
	const { data: charges, error: chargesError } = await supabase
		.schema("stripe")
		.from("charges")
		.select("amount, currency, created")
		.eq("paid", true)
		.gte("created", fromTimestamp)
		.lte("created", toTimestamp);

	if (chargesError) throw chargesError;

	const monthlyRevenue =
		charges?.reduce((sum, charge) => {
			return sum + (charge.amount || 0) / 100; // Convert from cents
		}, 0) || 0;

	// Get previous month for growth calculation
	const periodDuration = toTimestamp - fromTimestamp;
	const previousFromTimestamp = fromTimestamp - periodDuration;
	const previousToTimestamp = fromTimestamp;

	const { data: previousCharges, error: previousError } = await supabase
		.schema("stripe")
		.from("charges")
		.select("amount")
		.eq("paid", true)
		.gte("created", previousFromTimestamp)
		.lt("created", previousToTimestamp);

	if (previousError) throw previousError;

	const previousRevenue =
		previousCharges?.reduce((sum, charge) => {
			return sum + (charge.amount || 0) / 100;
		}, 0) || 0;

	const revenueGrowthPercentage =
		previousRevenue > 0
			? ((monthlyRevenue - previousRevenue) / previousRevenue) * 100
			: 0;

	// Get active subscriptions by product type
	const { data: subscriptions, error: subsError } = await supabase
		.schema("stripe")
		.from("subscriptions")
		.select(`
			id, 
			status, 
			subscription_items!inner(
				price,
				prices!inner(
					product,
					products!inner(
						name
					)
				)
			)
		`)
		.in("status", ["active", "trialing"]);

	if (subsError) throw subsError;

	// Group subscriptions by product name
	const subscriptionsByProduct = subscriptions?.reduce(
		(acc, sub) => {
			const productName =
				sub.subscription_items?.[0]?.prices?.products?.name || "Unknown";
			if (!acc[productName]) {
				acc[productName] = 0;
			}
			acc[productName]++;
			return acc;
		},
		{} as Record<string, number>,
	);

	// Get total active subscriptions and calculate growth
	const totalActiveSubscriptions = subscriptions?.length || 0;

	// Get previous month subscriptions for growth calculation
	const { data: previousSubs, error: prevSubsError } = await supabase
		.schema("stripe")
		.from("subscriptions")
		.select("id")
		.in("status", ["active", "trialing"])
		.lte("created", previousToTimestamp);

	if (prevSubsError) throw prevSubsError;

	const previousActiveSubscriptions = previousSubs?.length || 0;
	const subscriptionGrowth =
		totalActiveSubscriptions - previousActiveSubscriptions;

	// Calculate average order value
	const averageOrderValue =
		charges && charges.length > 0 ? monthlyRevenue / charges.length : 0;

	// Get previous AOV for growth calculation
	const previousAverageOrderValue =
		previousCharges && previousCharges.length > 0
			? previousRevenue / previousCharges.length
			: 0;

	const aovGrowthPercentage =
		previousAverageOrderValue > 0
			? ((averageOrderValue - previousAverageOrderValue) /
					previousAverageOrderValue) *
				100
			: 0;

	return {
		monthlyRevenue,
		revenueGrowthPercentage,
		totalActiveSubscriptions,
		subscriptionGrowth,
		subscriptionsByProduct: subscriptionsByProduct || {},
		averageOrderValue,
		aovGrowthPercentage,
	};
}

export async function getCashCollectionMetrics(dateRange: DateRange) {
	const supabase = await createClient();

	// Use pre-calculated timestamps from client
	const { fromTimestamp, toTimestamp } = dateRange;

	// Get all invoices in the date range
	const { data: invoices, error: invoicesError } = await supabase
		.schema("stripe")
		.from("invoices")
		.select("id, total, amount_paid, amount_due, status, created")
		.gte("created", fromTimestamp)
		.lte("created", toTimestamp)
		.neq("status", "draft");

	if (invoicesError) throw invoicesError;

	// Calculate totals
	const totalSales =
		invoices?.reduce((sum, invoice) => {
			return sum + (invoice.total || 0) / 100; // Convert from cents
		}, 0) || 0;

	const cashCollected =
		invoices?.reduce((sum, invoice) => {
			return sum + (invoice.amount_paid || 0) / 100; // Convert from cents
		}, 0) || 0;

	const outstanding =
		invoices?.reduce((sum, invoice) => {
			return sum + (invoice.amount_due || 0) / 100; // Convert from cents
		}, 0) || 0;

	// Calculate percentages for the category bar
	const collectedPercentage =
		totalSales > 0 ? Math.round((cashCollected / totalSales) * 100) : 0;
	const outstandingPercentage = 100 - collectedPercentage;

	return {
		totalSales,
		cashCollected,
		outstanding,
		split: [collectedPercentage, outstandingPercentage] as [number, number],
	};
}

export async function getChurnMetrics(dateRange: DateRange) {
	const supabase = await createClient();

	// Use pre-calculated timestamps from client
	const { fromTimestamp, toTimestamp } = dateRange;

	// Get subscriptions that were canceled during the period
	const { data: canceledSubs, error: canceledError } = await supabase
		.schema("stripe")
		.from("subscriptions")
		.select(`
			id,
			canceled_at,
			subscription_items!inner(
				price,
				prices!inner(
					product,
					products!inner(
						name
					)
				)
			)
		`)
		.not("canceled_at", "is", null)
		.gte("canceled_at", fromTimestamp)
		.lte("canceled_at", toTimestamp);

	if (canceledError) throw canceledError;

	// Get total active subscriptions at the start of the period
	const { data: activeSubs, error: activeError } = await supabase
		.schema("stripe")
		.from("subscriptions")
		.select(`
			id,
			subscription_items!inner(
				price,
				prices!inner(
					product,
					products!inner(
						name
					)
				)
			)
		`)
		.in("status", ["active", "trialing"])
		.lte("created", fromTimestamp);

	if (activeError) throw activeError;

	// Calculate churn rate by product
	const churnByProduct: Record<
		string,
		{ churned: number; total: number; churnRate: number }
	> = {};

	// Count active subscriptions by product at the start
	activeSubs?.forEach((sub) => {
		const productName =
			sub.subscription_items?.[0]?.prices?.products?.name || "Unknown";
		if (!churnByProduct[productName]) {
			churnByProduct[productName] = { churned: 0, total: 0, churnRate: 0 };
		}
		churnByProduct[productName].total++;
	});

	// Count canceled subscriptions by product during the period
	canceledSubs?.forEach((sub) => {
		const productName =
			sub.subscription_items?.[0]?.prices?.products?.name || "Unknown";
		if (!churnByProduct[productName]) {
			churnByProduct[productName] = { churned: 0, total: 0, churnRate: 0 };
		}
		churnByProduct[productName].churned++;
	});

	// Calculate churn rates
	Object.keys(churnByProduct).forEach((product) => {
		const data = churnByProduct[product];
		data.churnRate = data.total > 0 ? (data.churned / data.total) * 100 : 0;
	});

	return churnByProduct;
}
