import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getClients } from "@/features/clients/actions";
import { clientQueryKeys } from "@/features/clients/queries/keys";
import { ClientsPageContent } from "@/features/clients/pages/ClientsPageContent";

export default async function ClientsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: clientQueryKeys.lists(),
    queryFn: async () => {
      const result = await getClients();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientsPageContent />
    </HydrationBoundary>
  );
}
