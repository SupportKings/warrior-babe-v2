import { Suspense } from "react";
import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import ProductsHeader from "@/features/system-config/layout/products-header";
import ProductsContent from "@/features/system-config/components/products-content";
import ProductsLoading from "./loading";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsPageAsync />
    </Suspense>
  );
}

async function ProductsPageAsync() {
  const queryClient = new QueryClient();
  const session = await getUser();

  if (!session) {
    redirect("/");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <ProductsHeader key="products-header" />,
        ]}
      >
        <ProductsContent />
      </MainLayout>
    </HydrationBoundary>
  );
}