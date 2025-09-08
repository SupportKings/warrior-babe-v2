import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import { getCoachPayment } from "@/features/finance/actions/getCoachPayments";
import CoachPaymentDetailSkeleton from "@/features/finance/components/coach-payment.detail.skeleton";
import CoachPaymentDetailView from "@/features/finance/components/coach-payment.detail.view";
import CoachPaymentDetailHeader from "@/features/finance/layout/coach-payment.detail.header";
import { getUser } from "@/queries/getUser";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface CoachPaymentDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function CoachPaymentDetailPage({ params }: CoachPaymentDetailPageProps) {
	return (
		<Suspense fallback={<CoachPaymentDetailSkeleton coachPaymentId="" />}>
			<CoachPaymentDetailPageAsync params={params} />
		</Suspense>
	);
}

async function CoachPaymentDetailPageAsync({ params }: CoachPaymentDetailPageProps) {
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

	// Prefetch the coach payment data
	await queryClient.prefetchQuery({
		queryKey: ["coachPayments", "detail", id],
		queryFn: () => getCoachPayment(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<CoachPaymentDetailHeader key="coach-payment-detail-header" coachPaymentId={id} />,
				]}
			>
				<CoachPaymentDetailView coachPaymentId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}