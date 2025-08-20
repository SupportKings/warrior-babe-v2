"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useClients } from "@/features/clients/queries/useClients";
import { TextEditor } from "@/features/editor/components/editor";
import { useUsers } from "@/features/team/queries/useUsers";

import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { useCreateTicketMutation } from "../queries/useTicketMutations";
import { ClientSelector } from "./properties/clientSelector";
import { FollowUpDateSelector } from "./properties/followUpDateSelector";
import {
  PrioritySelector,
  type PriorityValue,
} from "./properties/prioritySelector";
import { StatusSelector, type StatusValue } from "./properties/statusSelector";
import { TypeSelector, type TypeValue } from "./properties/typeSelector";
import { type User, UserSelector } from "./properties/userSelector";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTicketDialog({
  open,
  onOpenChange,
}: CreateTicketDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketType, setTicketType] = useState<TypeValue | undefined>(
    undefined
  );
  const [priority, setPriority] = useState<PriorityValue | undefined>("medium");
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [isExecutive, setIsExecutive] = useState(false);
  const [status, setStatus] = useState<StatusValue>("open");
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);

  const { createTicket, isPending } = useCreateTicketMutation();
  const { data: usersData } = useUsers();
  const { data: clientsData } = useClients();
  const editorRef = useRef<Editor | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title input when dialog opens
  useEffect(() => {
    if (open && titleRef.current) {
      // Small delay to ensure dialog is fully rendered
      const timeout = setTimeout(() => {
        titleRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Prepare users data for UserSelector
  const users: User[] =
    usersData?.users?.map((user) => ({
      id: user.id,
      name: user.name || user.email || "Unknown",
      email: user.email || "",
      image: user.image,
      role: user.role,
    })) || [];

  // Get the selected client's coach assignments
  const selectedClient = clientsData?.find((c) => c.id === clientId);
  const clientCoachAssignments =
    selectedClient?.assignments?.filter(
      (assignment) => assignment.end_date === null // Only active assignments
    ) || [];

  const handleCreateTicket = () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }
    if (!ticketType) {
      toast.error("Type is required");
      return;
    }

    createTicket({
      title,
      description: description || undefined,
      ticket_type: ticketType as any,
      priority: priority as any,
      assigned_to: assignedTo || undefined,
      client_id: clientId === "no-client" ? undefined : clientId,
      is_executive: isExecutive,
      reminder_date: followUpDate?.toISOString() || undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setTicketType(undefined);
    setPriority("medium");
    setAssignedTo(undefined);
    setClientId(undefined);
    setIsExecutive(false);
    setStatus("open");
    setFollowUpDate(undefined);
    onOpenChange(false);
  };

  const handleContainerClick = () => {
    if (editorRef.current) {
      editorRef.current.commands.focus();
    }
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    // Only handle keyboard events if the editor is not focused
    if (!editorRef.current?.isFocused && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleContainerClick();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto p-0 shadow-xl sm:max-w-[750px]">
        <div className="w-full space-y-3 px-4 pt-4 pb-0">
          <input
            ref={titleRef}
            className="mb-0 h-auto w-full overflow-hidden text-ellipsis whitespace-normal break-words border-none px-0 align-baseline font-bold text-lg leading-[calc(1.2)] tracking-[-0.02em] shadow-none outline-none placeholder:text-placeholder focus-visible:ring-0"
            placeholder="Ticket title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div
            className="min-h-[80px] cursor-text px-0 py-2"
            onClick={handleContainerClick}
            onKeyDown={handleContainerKeyDown}
          >
            <TextEditor
              defaultContent={description}
              onChange={setDescription}
              placeholder="Add description..."
              editorRef={editorRef}
            />
          </div>

          <div className="flex w-full flex-wrap items-center justify-start gap-1.5">
            <StatusSelector
              value={status}
              onChange={setStatus}
              showNoStatus={false}
            />
            <TypeSelector
              value={ticketType}
              onChange={setTicketType}
              showNoType={false}
            />
            <PrioritySelector
              value={priority}
              onChange={setPriority}
              showNoPriority={false}
            />
            <ClientSelector
              clients={clientsData || []}
              value={clientId}
              onChange={setClientId}
              placeholder="Select client"
              showNoClient={true}
            />
            <UserSelector
              users={users}
              value={assignedTo}
              onChange={setAssignedTo}
              placeholder="Select team member"
              showUnassigned={true}
              clientAssignments={clientCoachAssignments.map((assignment) => ({
                user_id: assignment.user_id,
                assignment_type: assignment.assignment_type,
              }))}
            />

            <FollowUpDateSelector
              value={followUpDate}
              onChange={setFollowUpDate}
              placeholder="Set follow up date"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex w-full items-center justify-between border-t bg-background px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="executive"
                checked={isExecutive}
                onCheckedChange={(checked) => setIsExecutive(checked === true)}
              />
              <label htmlFor="executive" className="text-sm">
                Executive escalation
              </label>
            </div>
          </div>
          <Button size="sm" onClick={handleCreateTicket} disabled={isPending}>
            {isPending ? "Creating..." : "Create ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
