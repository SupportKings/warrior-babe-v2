import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";
import ClientDetailHeader from "@/features/clients/layout/client-detail-header";
import ClientDetailView from "@/features/clients/components/client-detail-view";
import ClientDetailSkeleton from "@/features/clients/components/client-detail-skeleton";
import { getClient } from "@/features/clients/actions/getClient";

interface ClientDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
	return (
		<Suspense fallback={<ClientDetailSkeleton clientId="" />}>
			<ClientDetailPageAsync params={params} />
		</Suspense>
	);
}

async function ClientDetailPageAsync({ params }: ClientDetailPageProps) {
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

	// Prefetch the client data
	await queryClient.prefetchQuery({
		queryKey: ["clients", "detail", id],
		queryFn: () => getClient(id),
	});

	// Get the prefetched data to check if client exists
	const client = queryClient.getQueryData(["clients", "detail", id]);

	if (!client) {
		notFound();
	}

	// Extract client name for header
	const clientName = client ? `${(client as any).first_name} ${(client as any).last_name}` : undefined;

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MainLayout
				headers={[
					<ClientDetailHeader key="client-detail-header" clientId={id} clientName={clientName} />,
				]}
			>
				<ClientDetailView client={client as any} />
			</MainLayout>
		</HydrationBoundary>
	);
}