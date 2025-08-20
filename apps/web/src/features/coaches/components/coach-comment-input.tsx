"use client";

import { CommentInput } from "@/features/shared/components/comment-input";
import { useCreateCoachComment } from "../queries/useCoachComments";

interface CoachCommentInputProps {
  coachId: string;
}

export function CoachCommentInput({ coachId }: CoachCommentInputProps) {
  const { mutate, isPending, error, data } = useCreateCoachComment();

  const handleSubmit = ({ entityId, comment }: { entityId: string; comment: string }) => {
    mutate({ coachId: entityId, comment });
  };

  return (
    <CommentInput
      entityId={coachId}
      entityType="coach"
      onSubmit={handleSubmit}
      isPending={isPending}
      error={error}
      data={data}
      placeholder="Leave a comment on this coach..."
    />
  );
}