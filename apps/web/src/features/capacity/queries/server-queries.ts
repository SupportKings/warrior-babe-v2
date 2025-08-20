"use server";

import { createClient } from "@/utils/supabase/server";

import type {
	CapacityMetrics,
	CoachWithCapacity,
	GlobalCapacitySettings,
	Product,
	ProductDistribution,
} from "../types/capacity";

export async function getGlobalCapacitySettings(): Promise<GlobalCapacitySettings> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("system_settings")
		.select("setting_value")
		.eq("setting_key", "global_default_client_units_per_coach")
		.single();

	if (error) {
		console.error("Error fetching global capacity settings:", error);
		return { default_client_units: 8 };
	}

	return { default_client_units: Number.parseInt(data?.setting_value || "8") };
}

export async function getAllCoachesCapacity(teamFilter?: { premiereCoachId: string }): Promise<CoachWithCapacity[]> {
	const supabase = await createClient();
	const globalSettings = await getGlobalCapacitySettings();

	// If teamFilter is provided, get the team members first
	let coachIds: string[] | undefined;
	if (teamFilter) {
		const { data: teamMembers } = await supabase
			.from("coach_teams")
			.select("coach_id")
			.eq("premier_coach_id", teamFilter.premiereCoachId)
			.is("end_date", null);
		
		coachIds = teamMembers?.map(tm => tm.coach_id) || [];
	}

	// Build the coach query
	let coachQuery = supabase
		.from("user")
		.select(`
			id,
			name,
			email,
			coach_capacity!left(
				coach_id,
				max_client_units,
				is_paused,
				created_at,
				updated_at
			)
		`)
		.in("role", ["coach", "premiereCoach"])
		.is("banned", null);

	// Apply team filter if provided
	if (coachIds !== undefined) {
		coachQuery = coachQuery.in("id", coachIds);
	}

	const { data: coaches, error: coachesError } = await coachQuery;

	if (coachesError) {
		console.error("Error fetching coaches:", coachesError);
		return [];
	}

	// Fetch client units for active clients
	let clientUnitsQuery = supabase
		.from("client_units")
		.select(`
			client_id,
			coach_id,
			calculated_units,
			clients!inner(
				id,
				status
			)
		`)
		.eq("clients.status", "active");

	// Apply team filter to client units if provided
	if (coachIds !== undefined) {
		clientUnitsQuery = clientUnitsQuery.in("coach_id", coachIds);
	}

	const { data: clientUnits, error: unitsError } = await clientUnitsQuery;

	if (unitsError) {
		console.error("Error fetching client units:", unitsError);
	}

	// Calculate total client units per coach
	const coachClientUnits: Record<string, number> = {};
	
	// Add up all calculated units per coach
	clientUnits?.forEach(unit => {
		if (unit.coach_id && unit.clients?.status === "active") {
			coachClientUnits[unit.coach_id] = (coachClientUnits[unit.coach_id] || 0) + unit.calculated_units;
		}
	});

	return (
		coaches?.map((coach: any) => {
			const capacity = coach.coach_capacity;
			const actualCapacity =
				capacity?.max_client_units || globalSettings.default_client_units;
			const currentUnits = coachClientUnits[coach.id] || 0;
			const isPaused = capacity?.is_paused || false;

			return {
				id: coach.id,
				name: coach.name || "",
				email: coach.email || "",
				team_id: null,
				team_name: undefined,
				capacity: capacity
					? {
							coach_id: capacity.coach_id,
							client_units: capacity.max_client_units,
							is_paused: capacity.is_paused,
							created_at: capacity.created_at,
							updated_at: capacity.updated_at,
						}
					: undefined,
				default_capacity: globalSettings.default_client_units,
				actual_capacity: isPaused ? 0 : actualCapacity,
				current_client_units: currentUnits,
				is_over_capacity: !isPaused && currentUnits > actualCapacity,
				utilization_percentage: isPaused
					? 0
					: Math.round((currentUnits / actualCapacity) * 100),
			};
		}) || []
	);
}

export async function getCapacityMetrics(teamFilter?: { premiereCoachId: string }): Promise<CapacityMetrics> {
	const coaches = await getAllCoachesCapacity(teamFilter);

	const activeCoaches = coaches.filter((c) => !c.capacity?.is_paused);
	const totalCapacity = activeCoaches.reduce(
		(sum, coach) => sum + coach.actual_capacity,
		0,
	);
	const totalUtilized = coaches.reduce(
		(sum, coach) => sum + coach.current_client_units,
		0,
	);
	const totalAvailable = Math.max(0, totalCapacity - totalUtilized);
	const coachesOverCapacity = coaches.filter(
		(coach) => coach.is_over_capacity,
	).length;
	const averageUtilization =
		activeCoaches.length > 0
			? Math.round(
					activeCoaches.reduce(
						(sum, coach) => sum + coach.utilization_percentage,
						0,
					) / activeCoaches.length,
				)
			: 0;

	return {
		total_capacity: totalCapacity,
		total_utilized: totalUtilized,
		total_available: totalAvailable,
		coaches_over_capacity: coachesOverCapacity,
		total_coaches: coaches.length,
		average_utilization: averageUtilization,
	};
}

export async function getProductDistribution(): Promise<ProductDistribution[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("clients")
		.select(`
			product_id,
			products(
				id,
				name
			)
		`)
		.eq("status", "active");

	if (error) {
		console.error("Error fetching product distribution:", error);
		return [];
	}

	// Group clients by product
	const productCounts = data.reduce((acc: Record<string, { name: string; count: number }>, client: any) => {
		const productId = client.product_id || 'no-product';
		const productName = client.products?.name || 'No Product Assigned';
		
		if (!acc[productId]) {
			acc[productId] = { name: productName, count: 0 };
		}
		acc[productId].count++;
		
		return acc;
	}, {});

	const totalClients = Object.values(productCounts).reduce((sum, product) => sum + product.count, 0);

	// Convert to array format with percentages
	return Object.entries(productCounts).map(([productId, { name, count }]) => ({
		product_id: productId === 'no-product' ? null : productId,
		product_name: name,
		client_count: count,
		percentage: totalClients > 0 ? Math.round((count / totalClients) * 100) : 0,
	})).sort((a, b) => b.client_count - a.client_count); // Sort by count descending
}

export async function getAllProducts(): Promise<Product[]> {
	const supabase = await createClient();

	const { data: products, error } = await supabase
		.from("products")
		.select(`
			id,
			name,
			client_unit,
			description,
			is_active
		`)
		.eq("is_active", true)
		.order("name");

	if (error) {
		console.error("Error fetching products:", error);
		return [];
	}

	return products || [];
}
