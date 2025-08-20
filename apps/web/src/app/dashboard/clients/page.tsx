import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import ClientsHeader from "@/features/clients/layout/clients-header";
import ClientsContent from "@/features/clients/components/clients-content";
import ClientsLoading from "./loading";

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientsLoading />}>
      <ClientsPageAsync />
    </Suspense>
  );
}

async function ClientsPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <ClientsHeader key="clients-header" />,
        ]}
      >
        <ClientsContent />
      </MainLayout>
    </HydrationBoundary>
  );
}