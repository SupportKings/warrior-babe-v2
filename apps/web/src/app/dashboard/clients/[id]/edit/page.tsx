import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getClient } from "@/features/clients/actions/getClient";
import ClientEditContent from "@/features/clients/components/client.edit.content";
import ClientEditSkeleton from "@/features/clients/components/client.edit.skeleton";
import ClientEditHeader from "@/features/clients/layout/client.edit.header";
import { getActiveCoaches } from "@/features/coaches/actions/getCoaches";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface ClientEditPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ClientEditPage({ params }: ClientEditPageProps) {
	return (
		<Suspense fallback={<ClientEditSkeleton clientId="" />}>
			<ClientEditPageAsync params={params} />
		</Suspense>
	);
}

async function ClientEditPageAsync({ params }: ClientEditPageProps) {
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

	// Prefetch the full client data for the form and coaches data
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["clients", "detail", id],
			queryFn: () => getClient(id),
		}),
		queryClient.prefetchQuery({
			queryKey: ["coaches", "list", "active"],
			queryFn: () => getActiveCoaches(),
		}),
	]);

	// Get the prefetched data to check if client exists
	const client = queryClient.getQueryData(["clients", "detail", id]);

	if (!client) {
		notFound();
	}

	// Extract client name for header
	const clientName = client ? (client as any).name : undefined;

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ClientEditHeader
						key="client-edit-header"
						clientId={id}
						clientName={clientName}
					/>,
				]}
			>
				<ClientEditContent clientId={id} />
			</MainLayout>
		</HydrationBoundary>
	);
}
