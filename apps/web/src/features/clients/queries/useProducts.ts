"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export type Product = {
	id: string;
	name: string;
	description: string | null;
	is_active: boolean | null;
};

export async function getProducts(): Promise<Product[]> {
	const { data, error } = await supabase
		.from("products")
		.select("id, name, description, is_active")
		.eq("is_active", true)
		.order("name");

	if (error) {
		throw error;
	}

	return data || [];
}

export function useProducts() {
	return useQuery({
		queryKey: ["products"],
		queryFn: getProducts,
	});
}

export const productQueries = {
	all: ["products"] as const,
};