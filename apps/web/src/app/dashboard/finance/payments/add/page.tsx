import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import PaymentAddSkeleton from "@/features/finance/components/payment.add.skeleton";
import PaymentForm from "@/features/finance/components/payment-form";
import PaymentAddHeader from "@/features/finance/layout/payment.add.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function AddPaymentPage() {
	return (
		<Suspense fallback={<PaymentAddSkeleton />}>
			<AddPaymentPageAsync />
		</Suspense>
	);
}

async function AddPaymentPageAsync() {
	// Authentication check
	const session = await getUser();
	if (!session) {
		redirect("/auth/login");
	}

	const queryClient = new QueryClient();

	// Prefetch any related data if needed (e.g., clients, products)
	// For now, we don't need to prefetch anything for the basic payment form
	// Future: could prefetch client emails, payment plans, etc.

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<PaymentAddHeader key="payment-add-header" />]}>
				<div className="p-6">
					<PaymentForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
