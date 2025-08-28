import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import ProductsAddSkeleton from "@/features/products/components/products.add.skeleton";
import ProductsForm from "@/features/products/components/products-form";
import ProductsAddHeader from "@/features/products/layout/products.add.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function ProductAddPage() {
	return (
		<Suspense fallback={<ProductsAddSkeleton />}>
			<ProductAddPageAsync />
		</Suspense>
	);
}

async function ProductAddPageAsync() {
	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Products don't have complex related entities to prefetch
	// but we could prefetch existing products for validation if needed

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<ProductsAddHeader key="products-add-header" />]}>
				<div className="p-6">
					<ProductsForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
