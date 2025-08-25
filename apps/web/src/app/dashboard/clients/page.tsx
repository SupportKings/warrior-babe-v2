import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { prefetchClientsWithFacetedServer } from "@/features/clients/actions/getClient";
import ClientsContent from "@/features/clients/components/clients.content";
import ClientsHeader from "@/features/clients/layout/clients.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import ClientsLoading from "./loading";

export default function ClientsPage() {
	return (
		<Suspense fallback={<ClientsLoading />}>
			<ClientsPageAsync />
		</Suspense>
	);
}

async function ClientsPageAsync() {
	const queryClient = new QueryClient();

	// Default filters for initial load
	const defaultFilters: any[] = [];
	const defaultSorting: any[] = [];

	// Create query keys directly (matching client-side keys)
	const facetedColumns = ["overall_status"];
	const combinedDataKey = [
		"clients",
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
			prefetchClientsWithFacetedServer(
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
			<MainLayout headers={[<ClientsHeader key="clients-header" />]}>
				<ClientsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
