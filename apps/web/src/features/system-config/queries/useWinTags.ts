"use client";

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const winTagQueries = {
	all: ["win-tags"] as const,
	list: () => [...winTagQueries.all, "list"] as const,
};

export async function getWinTags() {
	const supabase = createClient();
	
	const { data, error } = await supabase
		.from("win_tags")
		.select("*")
		.order("name");
		
	if (error) {
		throw new Error(`Failed to fetch win tags: ${error.message}`);
	}
	
	return data || [];
}

export function useWinTags() {
	return useQuery({
		queryKey: winTagQueries.list(),
		queryFn: getWinTags,
	});
}