import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchCoachesServer } from "@/features/coaches/actions/getCoaches";
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

async function CoachesPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const tableDataKey = [
		"coaches",
		"list",
		"table",
		defaultFilters,
		0,
		25,
		defaultSorting,
	];

	// Prefetch data using server-side function
	await queryClient.prefetchQuery({
		queryKey: tableDataKey,
		queryFn: () => prefetchCoachesServer(defaultFilters, 0, 25, defaultSorting),
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
