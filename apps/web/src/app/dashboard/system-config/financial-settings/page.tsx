import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import FinancialSettingsHeader from "@/features/system-config/layout/financial-settings-header";
import FinancialSettingsContent from "@/features/system-config/components/financial-settings-content";
import FinancialSettingsLoading from "./loading";

export default function FinancialSettingsPage() {
  return (
    <Suspense fallback={<FinancialSettingsLoading />}>
      <FinancialSettingsPageAsync />
    </Suspense>
  );
}

async function FinancialSettingsPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <FinancialSettingsHeader key="financial-settings-header" />,
        ]}
      >
        <FinancialSettingsContent />
      </MainLayout>
    </HydrationBoundary>
  );
}