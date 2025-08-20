import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import CoachesHeader from "@/features/coaches/layout/coaches-header";
import CoachesContent from "@/features/coaches/components/coaches-content";
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
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <CoachesHeader key="coaches-header" />,
        ]}
      >
        <CoachesContent />
      </MainLayout>
    </HydrationBoundary>
  );
}