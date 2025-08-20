import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import PremiereCoachesHeader from "@/features/coaches/layout/premiere-coaches-header";
import PremiereCoachesContent from "@/features/coaches/components/premiere-coaches-content";
import PremiereCoachesLoading from "./loading";

export default function PremiereCoachesPage() {
  return (
    <Suspense fallback={<PremiereCoachesLoading />}>
      <PremiereCoachesPageAsync />
    </Suspense>
  );
}

async function PremiereCoachesPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <PremiereCoachesHeader key="premiere-coaches-header" />,
        ]}
      >
        <PremiereCoachesContent />
      </MainLayout>
    </HydrationBoundary>
  );
}