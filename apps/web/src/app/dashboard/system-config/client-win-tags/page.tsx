import { Suspense } from "react";

import MainLayout from "@/components/layout/main-layout";

import { getWinTagsWithFaceted } from "@/features/system-config/actions/getWinTags";
import { WinTagsContent } from "@/features/system-config/components/win-tags.content";
import { WinTagsHeader } from "@/features/system-config/layout/win-tags.header";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

async function WinTagsPageContent() {
	const queryClient = new QueryClient();

	// Get session once at page level
	const session = await getUser();

	// Prefetch all queries with Promise.all for parallel fetching
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: [
				"win-tags",
				"table-with-faceted",
				{
					filters: [],
					page: 0,
					pageSize: 25,
					sorting: [],
					facetedColumns: ["color"],
				},
			],
			queryFn: () => getWinTagsWithFaceted([], 0, 25, [], ["color"]),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout headers={[<WinTagsHeader key="win-tags-header" />]}>
				<WinTagsContent />
			</MainLayout>
		</HydrationBoundary>
	);
}

export default function WinTagsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<WinTagsPageContent />
		</Suspense>
	);
}
