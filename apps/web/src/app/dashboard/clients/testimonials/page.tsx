import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchClientTestimonialsWithFacetedServer } from "@/features/clients/actions/getClientTestimonials";
import ClientTestimonialsContent from "@/features/clients/components/client-testimonials.content";
import ClientTestimonialsHeader from "@/features/clients/layout/client-testimonials.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import ClientTestimonialsLoading from "./loading";

export default function ClientTestimonialsPage() {
	return (
		<Suspense fallback={<ClientTestimonialsLoading />}>
			<ClientTestimonialsPageAsync />
		</Suspense>
	);
}

async function ClientTestimonialsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["testimonial_type"];
	const combinedDataKey = [
		"clientTestimonials",
		"list",
		"tableWithFaceted",
		defaultFilters,
		0,
		25,
		defaultSorting,
		facetedColumns,
	];

	// Prefetch optimized combined data using server-side functions
	await queryClient.prefetchQuery({
		queryKey: combinedDataKey,
		queryFn: () =>
			prefetchClientTestimonialsWithFacetedServer(
				defaultFilters,
				0,
				25,
				defaultSorting,
				facetedColumns,
			),
		staleTime: 2 * 60 * 1000,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ClientTestimonialsHeader key="client-testimonials-header" />,
				]}
			>
				<ClientTestimonialsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
