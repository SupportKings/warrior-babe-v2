import { Suspense } from "react";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import CoachPaymentAddSkeleton from "@/features/finance/components/coach-payment.add.skeleton";
import CoachPaymentForm from "@/features/finance/components/coach-payment-form";
import CoachPaymentAddHeader from "@/features/finance/layout/coach-payment.add.header";
import { getUser } from "@/queries/getUser";
import { createClient } from "@/utils/supabase/server";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default function CoachPaymentAddPage() {
	return (
		<Suspense fallback={<CoachPaymentAddSkeleton />}>
			<CoachPaymentAddPageAsync />
		</Suspense>
	);
}

async function CoachPaymentAddPageAsync() {
	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	const supabase = await createClient();

	// Prefetch coaches and other related data
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["coaches", "active"],
			queryFn: async () => {
				const { data, error } = await supabase
					.from("team_members")
					.select("id, name, contract_type")
					.order("name");
				
				if (error) throw error;
				return data || [];
			},
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[<CoachPaymentAddHeader key="coach-payment-add-header" />]}
			>
				<div className="p-6">
					<CoachPaymentForm mode="create" />
				</div>
			</MainLayout>
		</HydrationBoundary>
	);
}