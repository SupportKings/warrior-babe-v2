import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import PaymentPlanTemplatesHeader from "@/features/system-config/layout/payment-plan-templates-header";
import PaymentPlanTemplatesContent from "@/features/system-config/components/payment-plan-templates-content";
import PaymentPlanTemplatesLoading from "./loading";

export default function PaymentPlanTemplatesPage() {
  return (
    <Suspense fallback={<PaymentPlanTemplatesLoading />}>
      <PaymentPlanTemplatesPageAsync />
    </Suspense>
  );
}

async function PaymentPlanTemplatesPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <PaymentPlanTemplatesHeader key="payment-plan-templates-header" />,
        ]}
      >
        <PaymentPlanTemplatesContent />
      </MainLayout>
    </HydrationBoundary>
  );
}