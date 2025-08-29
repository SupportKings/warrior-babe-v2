import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchCoachTeamsWithFacetedServer } from "@/features/coach-teams/actions/getcoach-teams";
import CoachTeamsContent from "@/features/coach-teams/components/coach-teams.content";
import CoachTeamsHeader from "@/features/coach-teams/layout/coach-teams.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function CoachTeamsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CoachTeamsPageAsync />
		</Suspense>
	);
}

async function CoachTeamsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns: string[] = [];
	const combinedDataKey = [
		"coach-teams",
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
			prefetchCoachTeamsWithFacetedServer(
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
			<MainLayout headers={[<CoachTeamsHeader key="coach-teams-header" />]}>
				<CoachTeamsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
