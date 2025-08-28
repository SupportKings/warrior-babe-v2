import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchClientActivityPeriodsWithFacetedServer } from "@/features/client_activity_period/actions/getClientActivityPeriod";
import ClientActivityPeriodsContent from "@/features/client_activity_period/components/client-activity-periods-content";
import ClientActivityPeriodHeader from "@/features/client_activity_period/layout/client-activity-period-header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import ClientActivityPeriodsLoading from "./loading";

export default function ClientActivityPeriodsPage() {
	return (
		<Suspense fallback={<ClientActivityPeriodsLoading />}>
			<ClientActivityPeriodsPageAsync />
		</Suspense>
	);
}

async function ClientActivityPeriodsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: never[] = [];
	const defaultSorting: never[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns: string[] = [];
	const combinedDataKey = [
		"client_activity_periods",
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
			prefetchClientActivityPeriodsWithFacetedServer(
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
					<ClientActivityPeriodHeader key="client-activity-period-header" />,
				]}
			>
				<ClientActivityPeriodsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
