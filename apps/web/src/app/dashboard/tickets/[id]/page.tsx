import { Suspense } from "react";

import { notFound, redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import SupportTicketsHeader from "@/features/tickets/layout/tickets-detail-header";
import { getCombinedActivity } from "@/features/tickets/queries/getCombinedActivity";
import { getTicket } from "@/features/tickets/queries/getTicket";

import { getUser } from "@/queries/getUser";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import TicketDetailClient from "./ticket-detail-client";

interface TicketPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TicketDetailPage({ params }: TicketPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<TicketDetailLoading ticketId={id} />}>
      <TicketDetailPageAsync ticketId={id} />
    </Suspense>
  );
}

async function TicketDetailPageAsync({ ticketId }: { ticketId: string }) {
  const queryClient = new QueryClient();

  // Parallelize queries
  const [session] = await Promise.all([
    getUser(),
    queryClient.prefetchQuery({
      queryKey: ["ticket", ticketId],
      queryFn: () => getTicket(ticketId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["combined-activity", ticketId],
      queryFn: () => getCombinedActivity(ticketId),
    }),
  ]);

  if (!session) {
    redirect("/");
  }

  // Check if ticket exists
  const ticket = queryClient.getQueryData(["ticket", ticketId]);
  if (!ticket) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout
        headers={[
          <SupportTicketsHeader
            key="support-tickets-header"
            ticketId={ticketId}
          />,
        ]}
        disableScrollArea={true}
      >
        <TicketDetailClient ticketId={ticketId} />
      </MainLayout>
    </HydrationBoundary>
  );
}

function TicketDetailLoading({ ticketId }: { ticketId: string }) {
  return (
    <MainLayout
      headers={[
        <SupportTicketsHeader
          key="support-tickets-header"
          ticketId={ticketId}
        />,
      ]}
      disableScrollArea={true}
    >
      <div className="flex h-full">
        <div className="flex-1 p-6">
          <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="w-80 border-l p-6">
          <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </MainLayout>
  );
}
