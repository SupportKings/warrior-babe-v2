import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchCoachesWithFacetedServer } from "@/features/coaches/actions/getCoaches";
import CoachesContent from "@/features/coaches/components/coaches-content";
import CoachesHeader from "@/features/coaches/layout/coaches-header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import CoachesLoading from "./loading";

export default function CoachesPage() {
	return (
		<Suspense fallback={<CoachesLoading />}>
			<CoachesPageAsync />
		</Suspense>
	);
}

/**
 * Server-side async React component that prefetches coaches data (including facets) and returns a hydrated page.
 *
 * Prefetches a combined coaches query (list/tableWithFaceted) into a new React Query client using
 * prefetchCoachesWithFacetedServer, including faceted columns ["contract_type", "premier_coach_id"], then
 * hydrates that cache into the client via HydrationBoundary. Renders the page layout with CoachesHeader and CoachesContent.
 *
 * The prefetched query uses a 2-minute stale time and fetches the first page (offset 0, limit 25) with default filters/sorting.
 *
 * @returns A React element wrapped in a HydrationBoundary containing MainLayout, CoachesHeader, and CoachesContent.
 */
async function CoachesPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["contract_type", "premier_coach_id"];
	const combinedDataKey = [
		"coaches",
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
			prefetchCoachesWithFacetedServer(
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
			<MainLayout headers={[<CoachesHeader key="coaches-header" />]}>
				<CoachesContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
