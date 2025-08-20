import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import TestimonialsHeader from "@/features/clients/layout/testimonials-header";
import TestimonialsContent from "@/features/clients/components/testimonials-content";
import TestimonialsLoading from "./loading";

export default function TestimonialsPage() {
  return (
    <Suspense fallback={<TestimonialsLoading />}>
      <TestimonialsPageAsync />
    </Suspense>
  );
}

async function TestimonialsPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <TestimonialsHeader key="testimonials-header" />,
        ]}
      >
        <TestimonialsContent />
      </MainLayout>
    </HydrationBoundary>
  );
}