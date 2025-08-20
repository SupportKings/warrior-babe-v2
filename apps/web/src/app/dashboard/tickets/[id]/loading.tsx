import MainLayout from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";

import SupportTicketsHeader from "@/features/tickets/layout/tickets-detail-header";

export default function TicketDetailLoading() {
  return (
    <MainLayout
      headers={[<SupportTicketsHeader key="support-tickets-header" />]}
      disableScrollArea={true}
    >
      <div className="flex h-full">
        <div className="flex-1 space-y-6 p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>

        <div className="w-80 space-y-4 border-l p-6">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
