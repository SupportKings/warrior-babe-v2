import { Suspense } from "react";

import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

import { createClient } from "@/utils/supabase/server";

import MainLayout from "@/components/layout/main-layout";

import { CoachTeamsAddSkeleton } from "@/features/coach-teams/components/coach-teams.add.skeleton";
import { CoachTeamsForm } from "@/features/coach-teams/components/coach-teams-form";
import { CoachTeamsAddHeader } from "@/features/coach-teams/layout/coach-teams.add.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

async function CoachTeamsAddContent() {
	const supabase = await createClient();

	// Fetch all team members for the dropdowns
	const { data: teamMembers, error } = await supabase
		.from("team_members")
		.select("*")
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching team members:", error);
	}

	return (
		<MainLayout headers={[<CoachTeamsAddHeader key="coach-teams-add-header" />]}>
			<div className="p-6">
				<CoachTeamsForm mode="create" teamMembers={teamMembers || []} />
			</div>
		</MainLayout>
	);
}

export default async function AddCoachTeamPage() {
	// Check authentication
	const user = await getUser();
	if (!user) {
		redirect("/sign-in");
	}

	const queryClient = new QueryClient();

	// Prefetch related data
	await Promise.all([
		// Add any queries that need to be prefetched
		// For now, we're fetching team members directly in the component
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<CoachTeamsAddSkeleton />}>
				<CoachTeamsAddContent />
			</Suspense>
		</HydrationBoundary>
	);
}
