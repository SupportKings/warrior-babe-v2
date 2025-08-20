import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import SecurityHeader from "@/features/security/layout/security-header";
import { getPasskeys } from "@/features/security/queries/getPasskeys";
import { getSessions } from "@/features/security/queries/getSessions";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import SecurityClient from "./security-client";
import SecuritySettingsLoading from "./loading";

export default function SecurityPage() {
  return (
    <Suspense fallback={<SecuritySettingsLoading />}>
      <SecurityPageAsync />
    </Suspense>
  );
}

async function SecurityPageAsync() {
  const queryClient = new QueryClient();

  const [session] = await Promise.all([
    getUser(),
    queryClient.prefetchQuery({
      queryKey: ["sessions"],
      queryFn: getSessions,
    }),
    queryClient.prefetchQuery({
      queryKey: ["passkeys"],
      queryFn: getPasskeys,
    }),
  ]);

  if (!session) redirect("/");

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout headers={[<SecurityHeader key="security-header" />]}>
        <SecurityClient />
      </MainLayout>
    </HydrationBoundary>
  );
}
