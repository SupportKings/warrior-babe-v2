"use client";

import { Link } from "@/components/fastLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { useTickets } from "../queries/useTickets";

interface TicketsListProps {
  assignedToUserId?: string;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800",
  paused: "bg-purple-100 text-purple-800",
};

const typeLabels = {
  billing: "Billing",
  tech_problem: "Technical Problem",
  escalation: "Escalation",
  coaching_transfer: "Coaching Transfer",
  retention: "Retention",
  pausing: "Pausing",
  other: "Other",
};

export function TicketsList({ assignedToUserId }: TicketsListProps) {
  const { data: tickets, isLoading, error } = useTickets(assignedToUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">Failed to load tickets</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No tickets found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{ticket.title}</div>
                  {ticket.is_executive && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Executive
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {typeLabels[ticket.ticket_type as keyof typeof typeLabels]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    priorityColors[
                      ticket.priority as keyof typeof priorityColors
                    ]
                  }
                >
                  {ticket.priority
                    ? ticket.priority.charAt(0).toUpperCase() +
                      ticket.priority.slice(1)
                    : "Unknown"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    statusColors[ticket.status as keyof typeof statusColors]
                  }
                >
                  {ticket.status
                    ?.replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.created_at &&
                  formatDistanceToNow(new Date(ticket.created_at), {
                    addSuffix: true,
                  })}
              </TableCell>
              <TableCell>
                {(ticket as any).assigned_to_user ? (
                  <span className="text-sm">
                    {(ticket as any).assigned_to_user.first_name}{" "}
                    {(ticket as any).assigned_to_user.last_name}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/tickets/${ticket.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
