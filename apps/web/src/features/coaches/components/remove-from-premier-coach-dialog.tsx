"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenuIconWrapper,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useQueryClient } from "@tanstack/react-query";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import { removeFromPremierCoach } from "../actions/removeFromPremierCoach";

interface RemoveFromPremierCoachDialogProps {
  coachId: string;
  coachName: string;
  premierCoachName: string;
  onSuccess?: () => void;
}

export function RemoveFromPremierCoachDialog({
  coachId,
  coachName,
  premierCoachName,
  onSuccess,
}: RemoveFromPremierCoachDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const result = await removeFromPremierCoach({ coachId });

      if (result.data) {
        toast.success(
          result.data.message || "Coach successfully removed from premier coach"
        );
        setIsOpen(false);

        // Invalidate all coach-related queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: ["coaches"],
        });

        // Also invalidate available coaches since one was just unassigned
        queryClient.invalidateQueries({
          queryKey: ["coaches", "available"],
        });

        onSuccess?.();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove coach from premier coach"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
        >
          <DropdownMenuIconWrapper>
            <UserMinus className="h-4 w-4" />
          </DropdownMenuIconWrapper>
          Remove from Premier Coach
        </DropdownMenuItem>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from Premier Coach</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{coachName}</strong> from{" "}
            <strong>{premierCoachName}</strong>'s team? This will end their
            current team assignment and the coach will no longer be managed by
            this premier coach.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
