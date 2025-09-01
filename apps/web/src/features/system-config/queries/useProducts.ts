"use client";

import { createClient } from "@/utils/supabase/client";

import { useQuery } from "@tanstack/react-query";

export const productsQueries = {
	all: () => ["products"] as const,
	active: () => ["products", "active"] as const,
	detail: (id: string) => ["products", id] as const,
};

export function useProducts() {
	const supabase = createClient();

	return useQuery({
		queryKey: productsQueries.all(),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("products")
				.select(`
					id,
					name,
					description,
					client_unit,
					default_duration_months,
					is_active,
					created_at,
					updated_at
				`)
				.order("name");

			if (error) {
				throw new Error(`Failed to fetch products: ${error.message}`);
			}

			return data;
		},
	});
}

export function useActiveProducts() {
	const supabase = createClient();

	return useQuery({
		queryKey: productsQueries.active(),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("products")
				.select(`
					id,
					name,
					description,
					client_unit,
					default_duration_months,
					is_active,
					created_at,
					updated_at
				`)
				.eq("is_active", true)
				.order("name");

			if (error) {
				throw new Error(`Failed to fetch active products: ${error.message}`);
			}

			return data;
		},
	});
}

export function useProduct(id: string) {
	const supabase = createClient();

	return useQuery({
		queryKey: productsQueries.detail(id),
		queryFn: async () => {
			const { data, error } = await supabase
				.from("products")
				.select(`
					id,
					name,
					description,
					client_unit,
					default_duration_months,
					is_active,
					created_at,
					updated_at
				`)
				.eq("id", id)
				.single();

			if (error) {
				throw new Error(`Failed to fetch product: ${error.message}`);
			}

			return data;
		},
		enabled: !!id,
	});
}
