import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import FinanceContent from "@/features/finance/components/finance-content";
import FinanceHeader from "@/features/finance/layout/finance-header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import FinanceLoading from "./loading";

export default function FinancePage() {
	return (
		<Suspense fallback={<FinanceLoading />}>
			<FinancePageAsync />
		</Suspense>
	);
}

async function FinancePageAsync() {
	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<FinanceHeader key="finance-header" />]}>
				<FinanceContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
