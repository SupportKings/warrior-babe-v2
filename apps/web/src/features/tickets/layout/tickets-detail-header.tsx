"use client";

import { useState } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DeleteTicketDialog } from "../components/delete-ticket-dialog";

import { MoreHorizontal, Trash2 } from "lucide-react";

interface SupportTicketsHeaderProps {
  ticketId?: string;
}

export default function SupportTicketsHeader({ ticketId }: SupportTicketsHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-medium text-[13px] ">Support Tickets</h1>
        </div>
        {ticketId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-md p-1 hover:bg-gray-100 focus:outline-none">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {ticketId && (
        <DeleteTicketDialog
          ticketId={ticketId}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </>
  );
}
