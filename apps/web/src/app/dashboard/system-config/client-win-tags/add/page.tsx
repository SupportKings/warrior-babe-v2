import { Suspense } from "react";

import { redirect } from "next/navigation";



import { WinTagsAddSkeleton } from "@/features/system-config/components/win-tags.add.skeleton";
import { WinTagsForm } from "@/features/system-config/components/win-tags-form";
import { WinTagsAddHeader } from "@/features/system-config/layout/win-tags.add.header";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

export default async function WinTagsAddPage() {
	// Check authentication
	const user = await getUser();
	if (!user) {
		redirect("/sign-in");
	}

	// Create QueryClient for prefetching if needed
	const queryClient = new QueryClient();

	// No data prefetching needed for creating a new win tag
	// If you need to prefetch any related data (like categories, etc.), do it here with Promise.all

	return (
		<Suspense fallback={<WinTagsAddSkeleton />}>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<MainLayout headers={[<WinTagsAddHeader />]}>
					<div className="p-6">
						<WinTagsForm mode="create" />
					</div>
				</MainLayout>
			</HydrationBoundary>
		</Suspense>
	);
}
