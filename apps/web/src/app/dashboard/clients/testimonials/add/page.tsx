import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";

import { ClientTestimonialsAddHeader } from "@/features/client-testimonials/layout/client-testimonials.add.header";
import { ClientTestimonialsAddSkeleton } from "@/features/client-testimonials/components/client-testimonials.add.skeleton";
import { ClientTestimonialsForm } from "@/features/client-testimonials/components/client-testimonials-form";

import { getClientsBasic } from "@/features/clients/actions/getClient";
import { getUsers } from "@/features/team/queries/getUsers";
import MainLayout from "@/components/layout/main-layout";
import { getUser } from "@/queries/getUser";

async function ClientTestimonialsAddContent() {
  // Fetch data for dropdowns
  const [clients, users] = await Promise.all([getClientsBasic(), getUsers()]);

  // Transform data for the form
  const clientOptions = clients?.map((client: any) => ({
    id: client.id,
    name: client.name,
  }));

  const userOptions = users.users.map((user) => ({
    id: user.id,
    name: user.name,
  }));

  return (
    <MainLayout headers={[<ClientTestimonialsAddHeader />]}>
      <div className="p-6">
        <ClientTestimonialsForm clients={clientOptions} users={userOptions} />
      </div>
    </MainLayout>
  );
}

export default async function ClientTestimonialsAddPage() {
  // Authentication check
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  // Create query client and prefetch data
  const queryClient = new QueryClient();

  // Prefetch related data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["clients", "list"],
      queryFn: getClientsBasic,
    }),
    queryClient.prefetchQuery({
      queryKey: ["users"],
      queryFn: getUsers,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ClientTestimonialsAddSkeleton />}>
        <ClientTestimonialsAddContent />
      </Suspense>
    </HydrationBoundary>
  );
}
