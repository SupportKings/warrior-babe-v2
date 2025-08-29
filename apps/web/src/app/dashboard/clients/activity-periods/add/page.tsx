import { Suspense } from "react";

import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

import MainLayout from "@/components/layout/main-layout";

import ClientActivityPeriodAddSkeleton from "@/features/client_activity_period/components/client_activity_period.add.skeleton";
import { ClientActivityPeriodForm } from "@/features/client_activity_period/components/client_activity_period-form";
import ClientActivityPeriodAddHeader from "@/features/client_activity_period/layout/client_activity_period.add.header";
import { getAllPaymentPlansWithClients } from "@/features/client_activity_period/actions/getPaymentPlans";
import { getActiveCoaches } from "@/features/coaches/actions/getCoaches";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function AddClientActivityPeriodPage() {
	return (
		<Suspense fallback={<ClientActivityPeriodAddSkeleton />}>
			<AddClientActivityPeriodPageAsync />
		</Suspense>
	);
}

async function AddClientActivityPeriodPageAsync() {
	// Check authentication
	const user = await getUser();
	if (!user) {
		redirect("/auth/signin");
	}

	const queryClient = new QueryClient();

	// Prefetch related data
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["payment_plans", "with_clients"],
			queryFn: () => getAllPaymentPlansWithClients(),
			staleTime: 5 * 60 * 1000, // 5 minutes
		}),
		queryClient.prefetchQuery({
			queryKey: ["coaches", "list", "active"],
			queryFn: () => getActiveCoaches(),
			staleTime: 5 * 60 * 1000, // 5 minutes
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<ClientActivityPeriodAddHeader key="header" />]}>
				<div className="p-6">
					<ClientActivityPeriodForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}
