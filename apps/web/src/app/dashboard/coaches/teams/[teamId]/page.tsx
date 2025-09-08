import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getCoachTeam } from "@/features/coach-teams/actions/getcoach-teams";
import CoachTeamDetailSkeleton from "@/features/coach-teams/components/coach-team.detail.skeleton";
import CoachTeamDetailView from "@/features/coach-teams/components/coach-team.detail.view";
import CoachTeamDetailHeader from "@/features/coach-teams/layout/coach-team.detail.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface CoachTeamDetailPageProps {
	params: Promise<{
		teamId: string;
	}>;
}

export default function CoachTeamDetailPage({
	params,
}: CoachTeamDetailPageProps) {
	return (
		<Suspense fallback={<CoachTeamDetailSkeleton teamId="" />}>
			<CoachTeamDetailPageAsync params={params} />
		</Suspense>
	);
}

async function CoachTeamDetailPageAsync({ params }: CoachTeamDetailPageProps) {
	const { teamId } = await params;

	// Validate that teamId is provided
	if (!teamId) {
		notFound();
	}

	const queryClient = new QueryClient();
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Prefetch the coach team data
	await queryClient.prefetchQuery({
		queryKey: ["coach-teams", "detail", teamId],
		queryFn: () => getCoachTeam(teamId),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<CoachTeamDetailHeader
						key="coach-team-detail-header"
						teamId={teamId}
					/>,
				]}
			>
				<CoachTeamDetailView teamId={teamId} />
			</MainLayout>
		</HydrationBoundary>
	);
}
