import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import CoachesContent from "@/features/coaches/components/coaches-content";
import CoachesHeader from "@/features/coaches/layout/coaches-header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import CoachesLoading from "./loading";

export default function CoachesPage() {
	return (
		<Suspense fallback={<CoachesLoading />}>
			<CoachesPageAsync />
		</Suspense>
	);
}

async function CoachesPageAsync() {
	const queryClient = new QueryClient();

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<CoachesHeader key="coaches-header" />]}>
				<CoachesContent />
			</MainLayout>
		</HydrationBoundary>
	);
}
