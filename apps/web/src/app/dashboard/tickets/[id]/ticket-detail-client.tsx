"use client";

import { useEffect, useState } from "react";

import { notFound } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

import { ActivityLog } from "@/features/tickets/components/activity-log";
import { TicketCommentInput } from "@/features/tickets/components/ticket-comment-input";
import { TicketDescription } from "@/features/tickets/components/ticket-description";
import TicketSidebar from "@/features/tickets/components/ticket-sidebar";
import { MobilePropertyBar } from "@/features/tickets/components/mobile-property-bar";
import type { TicketWithRelations } from "@/features/tickets/queries/getTicket";
import { useUpdateTicket } from "@/features/tickets/queries/useTicketMutations";
import {
  useCombinedActivity,
  useTicket,
} from "@/features/tickets/queries/useTickets";

import { ScrollArea } from "@base-ui-components/react/scroll-area";
import { LayoutGroup } from "motion/react";

// Type assertions to fix TypeScript issues in client components
const ScrollAreaRoot = ScrollArea.Root as React.ComponentType<any>;
const ScrollAreaViewport = ScrollArea.Viewport as React.ComponentType<any>;
const ScrollAreaScrollbar = ScrollArea.Scrollbar as React.ComponentType<any>;
const ScrollAreaThumb = ScrollArea.Thumb as React.ComponentType<any>;

import { useDebounce } from "@uidotdev/usehooks";

interface TicketDetailClientProps {
  ticketId: string;
}

export default function TicketDetailClient({
  ticketId,
}: TicketDetailClientProps) {
  const { data: ticketData, isLoading, error } = useTicket(ticketId);
  const { data: combinedActivity, isLoading: activityLoading } =
    useCombinedActivity(ticketId);
  const updateTicketMutation = useUpdateTicket();
  const ticket = ticketData as TicketWithRelations | null;
  
  // Initialize state from ticket data
  const [title, setTitle] = useState(() => ticket?.title || "");
  const [description, setDescription] = useState(() => ticket?.description || "");

  // Debounce title and description updates (1 second delay)
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedDescription = useDebounce(description, 1000);

  // Sync local state with ticket data on initial load
  useEffect(() => {
    if (ticket && !title && !description) {
      setTitle(ticket.title || "");
      setDescription(ticket.description || "");
    }
  }, [ticket]); // Only run when ticket data changes

  // Handle debounced updates
  useEffect(() => {
    if (!ticket) return;
    
    // Update server when debounced values change
    const updates: { title?: string; description?: string } = {};
    let hasUpdates = false;
    
    if (debouncedTitle && debouncedTitle !== ticket.title) {
      updates.title = debouncedTitle;
      hasUpdates = true;
    }
    
    if (debouncedDescription && debouncedDescription !== ticket.description) {
      updates.description = debouncedDescription;
      hasUpdates = true;
    }
    
    if (hasUpdates) {
      updateTicketMutation.mutate({
        ticketId: ticket.id,
        ...updates,
      });
    }
  }, [debouncedTitle, debouncedDescription, ticket, updateTicketMutation]);


  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-1/4 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden lg:flex-row">
      {/* Mobile Property Bar - Only visible on mobile */}
      <div className="lg:hidden">
        <MobilePropertyBar ticket={ticket} />
      </div>

      {/* Main Content with ScrollArea */}
      <div className="flex-1 overflow-hidden lg:w-[calc(100%-250px)]">
        <ScrollAreaRoot className="h-full w-full">
          <ScrollAreaViewport className="h-full overscroll-contain">
            <div className="mx-auto mb-[38px] w-full max-w-5xl space-y-6 px-4 pt-6 pb-20 lg:w-[calc(100%-120px)] lg:pt-[38px] lg:pb-8 lg:pr-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-full space-y-2">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="m-0 w-full resize-none border-none bg-transparent p-0 font-bold text-2xl text-gray-900 outline-none placeholder:text-placeholder dark:text-gray-100"
                    placeholder="Enter ticket title..."
                  />
                </div>
              </div>

              {/* Description */}
              <TicketDescription
                description={description}
                isEditable={true}
                onChange={setDescription}
              />

              {/* Activity Log */}
              <div>
                <span className="m-0 mb-4 block border-0 p-0 text-left align-baseline font-medium text-[15px] text-gray-900 leading-[1.4375rem] dark:text-gray-100">
                  Activity
                </span>
                {activityLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <LayoutGroup>
                    <ActivityLog items={combinedActivity || []} entityType="ticket" />
                    <TicketCommentInput ticketId={ticketId} />
                  </LayoutGroup>
                )}
              </div>
            </div>
          </ScrollAreaViewport>
          <div className="hidden sm:block">
            <ScrollAreaScrollbar className="z-50 m-2 flex w-1 justify-center rounded bg-gray-200 opacity-0 transition-opacity delay-300 duration-150 data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[hovering]:delay-0 data-[scrolling]:delay-0 data-[hovering]:duration-150 data-[scrolling]:duration-100 dark:bg-gray-800">
              <ScrollAreaThumb className="w-full rounded bg-gray-500 dark:bg-gray-600" />
            </ScrollAreaScrollbar>
          </div>
        </ScrollAreaRoot>
      </div>

      {/* Desktop Sidebar - Only visible on desktop */}
      <div className="hidden h-full w-[250px] shrink-0 lg:block">
        <TicketSidebar ticket={ticket} />
      </div>
    </div>
  );
}
