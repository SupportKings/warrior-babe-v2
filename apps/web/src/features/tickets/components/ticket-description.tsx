"use client";

import { TextEditor } from "@/features/editor/components/editor";

interface TicketDescriptionProps {
  description?: string;
  isEditable?: boolean;
  onChange?: (content: string) => void;
}

export function TicketDescription({
  description = "",
  isEditable = true,
  onChange,
}: TicketDescriptionProps) {
  if (isEditable) {
    return (
      <div>
        <TextEditor
          defaultContent={description}
          onChange={onChange}
          placeholder="Enter ticket description..."
        />
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{
        __html: description || "No description provided.",
      }}
    />
  );
}
