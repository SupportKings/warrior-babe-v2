import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getUser } from "@/queries/getUser";
import { redirect } from "next/navigation";
import { OnboardingHeader } from "@/features/onboarding/layout/onboarding-header";
import { OnboardingMetrics } from "@/features/onboarding/components/OnboardingMetrics";
import { OnboardingOverviewList } from "@/features/onboarding/components/OnboardingOverviewList";
import { onboardingQueries } from "@/features/onboarding/queries";

export default async function OnboardingDashboardPage() {
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(onboardingQueries.overview()),
    queryClient.prefetchQuery(onboardingQueries.metrics()),
    queryClient.prefetchQuery(onboardingQueries.template()),
  ]);


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-8">
        <OnboardingHeader />

        <div className="p-6">
          <OnboardingOverviewList />
        </div>
      </div>
    </HydrationBoundary>
  );
}
