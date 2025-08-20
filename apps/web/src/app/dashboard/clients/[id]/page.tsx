import { Suspense } from "react";

import { notFound } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import { getClientById } from "@/features/clients/actions";
import ClientProfileHeader from "@/features/clients/layout/client-profile-header";
import { ClientProfileContent } from "@/features/clients/pages/ClientProfileContent";
import { clientQueryKeys } from "@/features/clients/queries/keys";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientProfilePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPageAsync clientId={id} />
    </Suspense>
  );
}

async function ClientPageAsync({ clientId }: { clientId: string }) {
  const queryClient = new QueryClient();

  // Prefetch client data
  try {
    await queryClient.prefetchQuery({
      queryKey: clientQueryKeys.detail(clientId),
      queryFn: async () => {
        const result = await getClientById(clientId);
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data;
      },
    });
  } catch {
    // If client doesn't exist, return not found
    notFound();
  }

  // Get client data for header
  const clientData = queryClient.getQueryData(
    clientQueryKeys.detail(clientId)
  ) as any;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        disableScrollArea
        headers={[
          <ClientProfileHeader
            key="client-profile-header"
            client={clientData}
          />,
        ]}
      >
        <ClientProfileContent clientId={clientId} />
      </MainLayout>
    </HydrationBoundary>
  );
}
