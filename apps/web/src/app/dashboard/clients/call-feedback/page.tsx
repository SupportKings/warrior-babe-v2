import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import CallFeedbackHeader from "@/features/clients/layout/call-feedback-header";
import CallFeedbackContent from "@/features/clients/components/call-feedback-content";
import CallFeedbackLoading from "./loading";

export default function CallFeedbackPage() {
  return (
    <Suspense fallback={<CallFeedbackLoading />}>
      <CallFeedbackPageAsync />
    </Suspense>
  );
}

async function CallFeedbackPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <CallFeedbackHeader key="call-feedback-header" />,
        ]}
      >
        <CallFeedbackContent />
      </MainLayout>
    </HydrationBoundary>
  );
}