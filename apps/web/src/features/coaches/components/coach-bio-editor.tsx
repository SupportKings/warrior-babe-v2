"use client";

import { useEffect, useState } from "react";

import { TextEditor } from "@/features/editor/components/editor";

import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { toast } from "sonner";
import { updateCoachBio } from "../actions/updateCoachBio";

interface CoachBioEditorProps {
  userId: string;
  initialBio?: string | null;
  isEditable?: boolean;
}

export default function CoachBioEditor({
  userId,
  initialBio,
  isEditable = true,
}: CoachBioEditorProps) {
  const [bio, setBio] = useState(initialBio || "");
  const debouncedBio = useDebounce(bio, 1000);
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Save bio when debounced value changes
  useEffect(() => {
    if (debouncedBio !== initialBio && isEditable) {
      const saveBio = async () => {
        setIsSaving(true);
        try {
          const result = await updateCoachBio({
            userId,
            bio: debouncedBio || null,
          });

          if (result?.data?.success) {
            // Invalidate coach details to refresh the data
            /* queryClient.invalidateQueries({
              queryKey: ["coaches", "detail", userId],
            }); */
          } else {
            toast.error("Failed to save bio");
          }
        } catch (error) {
          toast.error("Failed to save bio");
        } finally {
          setIsSaving(false);
        }
      };

      saveBio();
    }
  }, [debouncedBio, initialBio, userId, isEditable, queryClient]);

  return (
    <div className="prose prose-sm max-w-none">
      {initialBio || isEditable ? (
        <TextEditor
          defaultContent={initialBio || ""}
          onChange={isEditable ? setBio : undefined}
          placeholder={isEditable ? "Add a bio..." : ""}
          editable={isEditable}
        />
      ) : (
        <p className="text-center text-muted-foreground text-sm">
          No bio added yet
        </p>
      )}
    </div>
  );
}
