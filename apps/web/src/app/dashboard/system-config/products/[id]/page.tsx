import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getProduct } from "@/features/products/actions/getProducts";
import ProductDetailSkeleton from "@/features/products/components/product.detail.skeleton";
import ProductDetailView from "@/features/products/components/product.detail.view";
import ProductDetailHeader from "@/features/products/layout/product.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ProductDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
	return (
		<Suspense fallback={<ProductDetailSkeleton productId="" />}>
			<ProductDetailPageAsync params={params} />
		</Suspense>
	);
}

async function ProductDetailPageAsync({ params }: ProductDetailPageProps) {
	const { id } = await params;

	// Validate that id is provided
	if (!id) {
		notFound();
	}

	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Prefetch the product data
	await queryClient.prefetchQuery({
		queryKey: ["products", "detail", id],
		queryFn: () => getProduct(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ProductDetailHeader key="product-detail-header" productId={id} />,
				]}
			>
				<ProductDetailView productId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
