import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import ActivityPeriodsContent from "@/features/clients/components/activity.periods.content";
import ActivityPeriodsHeader from "@/features/clients/layout/activity.periods.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import ActivityPeriodsLoading from "./loading";

export default function ActivityPeriodsPage() {
	return (
		<Suspense fallback={<ActivityPeriodsLoading />}>
			<ActivityPeriodsPageAsync />
		</Suspense>
	);
}

async function ActivityPeriodsPageAsync() {
	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[<ActivityPeriodsHeader key="activity-periods-header" />]}
			>
				<ActivityPeriodsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
