import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchPaymentsWithFacetedServer } from "@/features/finance/actions/getPayments";
import PaymentsContent from "@/features/finance/components/payments-content";
import PaymentsHeader from "@/features/finance/layout/payments-header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import PaymentsLoading from "./loading";

export default function PaymentsPage() {
	return (
		<Suspense fallback={<PaymentsLoading />}>
			<PaymentsPageAsync />
		</Suspense>
	);
}

async function PaymentsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["status", "disputed_status", "platform"];
	const combinedDataKey = [
		"payments",
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
			prefetchPaymentsWithFacetedServer(
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
			<MainLayout headers={[<PaymentsHeader key="payments-header" />]}>
				<PaymentsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
