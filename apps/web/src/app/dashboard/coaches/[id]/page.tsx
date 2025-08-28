import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { coachDetailsQueries } from "@/features/coaches/queries/useCoachDetails";
import CoachDetailSkeleton from "@/features/coaches/components/coach-detail-skeleton";
import CoachDetailView from "@/features/coaches/components/coach-detail-view";
import CoachDetailHeader from "@/features/coaches/layout/coach-detail-header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface CoachDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function CoachDetailPage({ params }: CoachDetailPageProps) {
	return (
		<Suspense fallback={<CoachDetailSkeleton coachId="" />}>
			<CoachDetailPageAsync params={params} />
		</Suspense>
	);
}

async function CoachDetailPageAsync({ params }: CoachDetailPageProps) {
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

	// Prefetch all coach data in parallel
	await Promise.all([
		queryClient.prefetchQuery(coachDetailsQueries.basicInfo(id)),
		queryClient.prefetchQuery(coachDetailsQueries.clientAssignments(id)),
		queryClient.prefetchQuery(coachDetailsQueries.payments(id)),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<CoachDetailHeader key="coach-detail-header" coachId={id} />,
				]}
			>
				<CoachDetailView coachId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}