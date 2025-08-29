import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchCoachPaymentsWithFacetedServer } from "@/features/finance/actions/getCoachPayments";
import CoachPaymentsContent from "@/features/finance/components/coach-payments-content";
import CoachPaymentsHeader from "@/features/finance/layout/coach-payments-header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import CoachPaymentsLoading from "./loading";

export default function CoachPaymentsPage() {
	return (
		<Suspense fallback={<CoachPaymentsLoading />}>
			<CoachPaymentsPageAsync />
		</Suspense>
	);
}

async function CoachPaymentsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["status"];
	const combinedDataKey = [
		"coachPayments",
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
			prefetchCoachPaymentsWithFacetedServer(
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
				headers={[<CoachPaymentsHeader key="coach-payments-header" />]}
			>
				<CoachPaymentsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
