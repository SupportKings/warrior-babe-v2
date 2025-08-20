export interface CoachCapacity {
	coach_id: string;
	client_units: number;
	is_paused: boolean;
	created_at: string;
	updated_at: string;
}

export interface CoachWithCapacity {
	id: string;
	name: string;
	email: string;
	team_id: string | null;
	team_name?: string;
	capacity?: CoachCapacity;
	default_capacity: number;
	actual_capacity: number;
	current_client_units: number;
	is_over_capacity: boolean;
	utilization_percentage: number;
}

export interface CapacityMetrics {
	total_capacity: number;
	total_utilized: number;
	total_available: number;
	coaches_over_capacity: number;
	total_coaches: number;
	average_utilization: number;
}

export interface GlobalCapacitySettings {
	default_client_units: number;
}

export interface ProductDistribution {
	product_id: string | null;
	product_name: string;
	client_count: number;
	percentage: number;
}

export interface Product {
	id: string;
	name: string;
	client_unit: number;
	description: string | null;
	is_active: boolean | null;
}