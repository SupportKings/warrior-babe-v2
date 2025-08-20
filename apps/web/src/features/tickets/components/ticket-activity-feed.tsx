"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { TicketWithRelations } from "../queries/getTicket";

interface TicketActivityFeedProps {
  ticket: TicketWithRelations;
}

export default function TicketActivityFeed({
  ticket,
}: TicketActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={ticket.created_by_user?.image || ""} />
              <AvatarFallback>
                {ticket.created_by_user?.name?.[0] ||
                  ticket.created_by_user?.email?.[0] ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {ticket.created_by_user?.name ||
                    ticket.created_by_user?.email}
                </span>
                <span className="text-gray-500 text-xs">
                  created this ticket
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                {ticket.created_at
                  ? new Date(ticket.created_at).toLocaleString()
                  : "Unknown time"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
