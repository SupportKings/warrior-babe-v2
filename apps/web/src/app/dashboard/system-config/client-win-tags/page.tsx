import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import ClientWinTagsHeader from "@/features/system-config/layout/client-win-tags-header";
import ClientWinTagsContent from "@/features/system-config/components/client-win-tags-content";
import ClientWinTagsLoading from "./loading";

export default function ClientWinTagsPage() {
  return (
    <Suspense fallback={<ClientWinTagsLoading />}>
      <ClientWinTagsPageAsync />
    </Suspense>
  );
}

async function ClientWinTagsPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <ClientWinTagsHeader key="client-win-tags-header" />,
        ]}
      >
        <ClientWinTagsContent />
      </MainLayout>
    </HydrationBoundary>
  );
}