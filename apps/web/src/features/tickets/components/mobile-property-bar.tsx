"use client";

import { useUsers } from "@/features/team/queries/useUsers";

import type { TicketWithRelations } from "../queries/getTicket";
import { useUpdateTicket } from "../queries/useTicketMutations";
import { FollowUpDateSelector } from "./properties/followUpDateSelector";
import {
  PrioritySelector,
  type PriorityValue,
} from "./properties/prioritySelector";
import { StatusSelector, type StatusValue } from "./properties/statusSelector";
import { TypeSelector, type TypeValue } from "./properties/typeSelector";
import { type User, UserSelector } from "./properties/userSelector";

interface MobilePropertyBarProps {
  ticket: TicketWithRelations;
}

export function MobilePropertyBar({ ticket }: MobilePropertyBarProps) {
  const { data: usersData } = useUsers();
  const updateTicketMutation = useUpdateTicket();

  // Map ticket data values to selector values
  const mapPriorityValue = (
    priority: string | null
  ): PriorityValue | undefined => {
    if (!priority) return undefined;
    return priority as PriorityValue;
  };

  const mapStatusValue = (status: string | null): StatusValue | undefined => {
    if (!status) return undefined;
    return status as StatusValue;
  };

  const mapTypeValue = (type: string | null): TypeValue | undefined => {
    if (!type) return undefined;
    return type as TypeValue;
  };

  // Prepare users data for UserSelector
  const users: User[] =
    usersData?.users?.map((user) => ({
      id: user.id,
      name: user.name || user.email || "Unknown",
      email: user.email || "",
      image: user.image,
      role: user.role,
    })) || [];

  // Mutation handlers
  const handlePriorityChange = (priority: PriorityValue) => {
    updateTicketMutation.mutate({
      ticketId: ticket.id,
      priority: priority === "no-priority" ? undefined : priority,
    });
  };

  const handleStatusChange = (status: StatusValue) => {
    updateTicketMutation.mutate({
      ticketId: ticket.id,
      status: status === "no-status" ? undefined : status,
    });
  };

  const handleTypeChange = (type: TypeValue) => {
    updateTicketMutation.mutate({
      ticketId: ticket.id,
      ticket_type: type === "no-type" ? undefined : type,
    });
  };

  const handleUserChange = (userId: string) => {
    updateTicketMutation.mutate({
      ticketId: ticket.id,
      assigned_to: userId === "unassigned" ? null : userId,
    });
  };

  const handleFollowUpDateChange = (date: Date | undefined) => {
    updateTicketMutation.mutate({
      ticketId: ticket.id,
      reminder_date: date?.toISOString() || null,
    });
  };

  return (
    <div className="w-full border-b border-border bg-background p-4">
      <div className="flex flex-wrap gap-2">
        {/* First row - Status, Priority, Assignee */}
        <div className="flex flex-wrap gap-2">
          <StatusSelector
            value={mapStatusValue(ticket.status)}
            onChange={handleStatusChange}
            showNoStatus={false}
          />
          <PrioritySelector
            value={mapPriorityValue(ticket.priority)}
            onChange={handlePriorityChange}
            showNoPriority={false}
          />
          <UserSelector
            users={users}
            value={ticket.assigned_to || undefined}
            onChange={handleUserChange}
            placeholder="Unassigned"
            showUnassigned={false}
          />
        </div>
        
        {/* Second row - Type and Follow Up */}
        <div className="flex flex-wrap gap-2">
          <TypeSelector
            value={mapTypeValue(ticket.ticket_type)}
            onChange={handleTypeChange}
            showNoType={false}
          />
          <FollowUpDateSelector
            value={
              ticket.reminder_date
                ? new Date(ticket.reminder_date)
                : undefined
            }
            onChange={handleFollowUpDateChange}
            placeholder="Set follow up date"
          />
        </div>
      </div>
    </div>
  );
}