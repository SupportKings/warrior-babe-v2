"use client";

import { useQuery } from "@tanstack/react-query";
import { getClientTestimonial } from "../actions/getClientTestimonial";

export const clientTestimonialQueries = {
	detail: (id: string) => ({
		queryKey: ["client-testimonials", "detail", id],
		queryFn: () => getClientTestimonial(id),
	}),
};

export function useClientTestimonial(id: string) {
	return useQuery(clientTestimonialQueries.detail(id));
}