"use client";

import { CommentInput } from "@/features/shared/components/comment-input";
import { useCreateTicketComment } from "../queries/useTickets";

interface TicketCommentInputProps {
  ticketId: string;
}

export function TicketCommentInput({ ticketId }: TicketCommentInputProps) {
  const { mutate, isPending, error, data } = useCreateTicketComment();

  const handleSubmit = ({ entityId, comment }: { entityId: string; comment: string }) => {
    mutate({ ticketId: entityId, comment });
  };

  return (
    <CommentInput
      entityId={ticketId}
      entityType="ticket"
      onSubmit={handleSubmit}
      isPending={isPending}
      error={error}
      data={data}
      placeholder="Leave a comment on this ticket..."
    />
  );
}