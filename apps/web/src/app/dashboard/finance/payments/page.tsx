import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import PaymentsHeader from "@/features/finance/layout/payments-header";
import PaymentsContent from "@/features/finance/components/payments-content";
import PaymentsLoading from "./loading";

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PaymentsLoading />}>
      <PaymentsPageAsync />
    </Suspense>
  );
}

async function PaymentsPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <PaymentsHeader key="payments-header" />,
        ]}
      >
        <PaymentsContent />
      </MainLayout>
    </HydrationBoundary>
  );
}