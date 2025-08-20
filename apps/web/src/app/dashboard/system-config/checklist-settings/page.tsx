import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import ChecklistSettingsHeader from "@/features/system-config/layout/checklist-settings-header";
import ChecklistSettingsContent from "@/features/system-config/components/checklist-settings-content";
import ChecklistSettingsLoading from "./loading";

export default function ChecklistSettingsPage() {
  return (
    <Suspense fallback={<ChecklistSettingsLoading />}>
      <ChecklistSettingsPageAsync />
    </Suspense>
  );
}

async function ChecklistSettingsPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <ChecklistSettingsHeader key="checklist-settings-header" />,
        ]}
      >
        <ChecklistSettingsContent />
      </MainLayout>
    </HydrationBoundary>
  );
}