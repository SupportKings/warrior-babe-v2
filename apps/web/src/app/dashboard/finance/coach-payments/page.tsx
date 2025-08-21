import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import CoachPaymentsContent from "@/features/finance/components/coach-payments-content";
import CoachPaymentsHeader from "@/features/finance/layout/coach-payments-header";

import { getUser } from "@/queries/getUser";

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
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

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
