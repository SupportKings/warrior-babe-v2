import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import SupportTicketsHeader from "@/features/tickets/layout/tickets-header";

export default function AllTicketsLoading() {
  return (
    <MainLayout
      headers={[
        <SupportTicketsHeader key="support-tickets-header" permissions={[]} />,
      ]}
    >
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="rounded-lg border">
            <div className="border-b p-4">
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="border-b p-4 last:border-b-0">
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
