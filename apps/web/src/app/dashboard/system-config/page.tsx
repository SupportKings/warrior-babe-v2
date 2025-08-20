import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import SystemConfigHeader from "@/features/system-config/layout/system-config-header";
import SystemConfigContent from "@/features/system-config/components/system-config-content";
import SystemConfigLoading from "./loading";

export default function SystemConfigPage() {
  return (
    <Suspense fallback={<SystemConfigLoading />}>
      <SystemConfigPageAsync />
    </Suspense>
  );
}

async function SystemConfigPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <SystemConfigHeader key="system-config-header" />,
        ]}
      >
        <SystemConfigContent />
      </MainLayout>
    </HydrationBoundary>
  );
}