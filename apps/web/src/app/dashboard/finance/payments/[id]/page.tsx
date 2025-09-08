import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getPayment } from "@/features/finance/actions/getPayments";
import PaymentDetailSkeleton from "@/features/finance/components/payment.detail.skeleton";
import PaymentDetailView from "@/features/finance/components/payment.detail.view";
import PaymentDetailHeader from "@/features/finance/layout/payment.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface PaymentDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function PaymentDetailPage({ params }: PaymentDetailPageProps) {
	return (
		<Suspense fallback={<PaymentDetailSkeleton paymentId="" />}>
			<PaymentDetailPageAsync params={params} />
		</Suspense>
	);
}

async function PaymentDetailPageAsync({ params }: PaymentDetailPageProps) {
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

	// Prefetch the payment data
	await queryClient.prefetchQuery({
		queryKey: ["payments", "detail", id],
		queryFn: () => getPayment(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<PaymentDetailHeader key="payment-detail-header" paymentId={id} />,
				]}
			>
				<PaymentDetailView paymentId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
