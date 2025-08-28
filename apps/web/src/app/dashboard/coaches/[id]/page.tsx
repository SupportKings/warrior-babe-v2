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

/**
 * Default exported page component for the coach detail route.
 *
 * Wraps the async server-side page in a React Suspense boundary and displays a
 * CoachDetailSkeleton while the async content (CoachDetailPageAsync) resolves.
 *
 * @param params - A promise that resolves to route params (expected to include `id`) passed from Next.js App Router.
 */
export default function CoachDetailPage({ params }: CoachDetailPageProps) {
	return (
		<Suspense fallback={<CoachDetailSkeleton coachId="" />}>
			<CoachDetailPageAsync params={params} />
		</Suspense>
	);
}

/**
 * Server-rendered async page that prefetches coach data, guards access, and returns the hydrated coach detail layout.
 *
 * Awaits the route `params` to extract the coach `id`. If `id` is missing, triggers a 404 via `notFound()`. Requires an authenticated user session; if none is found redirects to `/`. Prefetches basic coach info, client assignments, and payments into a fresh React Query client, then returns a HydrationBoundary containing `MainLayout` with `CoachDetailHeader` and `CoachDetailView` rendered for the given `coachId`.
 *
 * @param params - A promise resolving to route parameters; must resolve to an object with a string `id`.
 */
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