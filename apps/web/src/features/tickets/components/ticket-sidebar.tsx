"use client";

import { useUsers } from "@/features/team/queries/useUsers";
import { useClients } from "@/features/clients/queries/useClients";

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
import { ClientSelector } from "./properties/clientSelector";

interface TicketSidebarProps {
  ticket: TicketWithRelations;
}

export default function TicketSidebar({ ticket }: TicketSidebarProps) {
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: clientsData } = useClients();
  const updateTicketMutation = useUpdateTicket();
  
  // Get the ticket's client's coach assignments
  const ticketClient = clientsData?.find((c) => c.id === ticket.client_id);
  const clientCoachAssignments = ticketClient?.assignments?.filter(
    (assignment) => assignment.end_date === null // Only active assignments
  ) || [];

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

  const handleClientChange = (clientId: string) => {
    updateTicketMutation.mutate({
      ticketId: ticket.id,
      client_id: clientId === "no-client" ? null : clientId,
    });
  };

  return (
    <div className="h-full border-border border-l p-6">
      <div className="space-y-6">
        {/* Properties Group */}
        <div>
          <div className="mb-3 font-medium text-gray-500 text-xs tracking-wider dark:text-gray-400">
            Properties
          </div>
          <div className="flex flex-col gap-3">
            {/* Status */}
            <StatusSelector
              value={mapStatusValue(ticket.status)}
              onChange={handleStatusChange}
              showNoStatus={false}
            />

            {/* Priority */}
            <PrioritySelector
              value={mapPriorityValue(ticket.priority)}
              onChange={handlePriorityChange}
              showNoPriority={false}
            />

            {/* Assignee */}
            <UserSelector
              users={users}
              value={ticket.assigned_to || undefined}
              onChange={handleUserChange}
              placeholder="Unassigned"
              showUnassigned={false}
              clientAssignments={clientCoachAssignments.map((assignment) => ({
                user_id: assignment.user_id,
                assignment_type: assignment.assignment_type,
              }))}
            />

            {/* Client */}
            <ClientSelector
              clients={clientsData || []}
              value={ticket.client_id || undefined}
              onChange={handleClientChange}
              placeholder="No client"
              showNoClient={false}
            />

            {/* Type */}
            <TypeSelector
              value={mapTypeValue(ticket.ticket_type)}
              onChange={handleTypeChange}
              showNoType={false}
            />
          </div>
        </div>

        {/* Planning Group */}
        <div>
          <div className="mb-3 font-medium text-gray-500 text-xs tracking-wider dark:text-gray-400">
            Planning
          </div>
          <div className="flex flex-col gap-3">
            {/* Follow Up Date */}
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
    </div>
  );
}
