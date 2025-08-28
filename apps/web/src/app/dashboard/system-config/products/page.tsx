import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { prefetchProductsWithFacetedServer } from "@/features/products/actions/getProducts";
import ProductsContent from "@/features/products/components/products.content";
import ProductsHeader from "@/features/products/layout/products.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import ProductsLoading from "./loading";

export default function ProductsPage() {
	return (
		<Suspense fallback={<ProductsLoading />}>
			<ProductsPageAsync />
		</Suspense>
	);
}

async function ProductsPageAsync() {
	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Prefetch products data with faceted filters
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: [
				"products",
				"list",
				"tableWithFaceted",
				[],
				0,
				25,
				[],
				["is_active"],
			],
			queryFn: () =>
				prefetchProductsWithFacetedServer([], 0, 25, [], ["is_active"]),
			staleTime: 2 * 60 * 1000, // 2 minutes
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<ProductsHeader key="products-header" />]}>
				<ProductsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
