"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { updateCoachCapacity } from "../../actions/update-coach-capacity";

interface CapacitySettingsDialogProps {
  coachId: string;
  coachName: string;
  currentCapacity: number;
  globalDefault: number;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function CapacitySettingsDialog({
  coachId,
  coachName,
  currentCapacity,
  globalDefault,
  trigger,
  onSuccess,
}: CapacitySettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [customCapacity, setCustomCapacity] = useState(
    currentCapacity.toString()
  );
  const [useGlobalDefault, setUseGlobalDefault] = useState(
    currentCapacity === globalDefault
  );
  const queryClient = useQueryClient();

  const { execute, isExecuting } = useAction(updateCoachCapacity, {
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
      // Invalidate coach queries to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coaches", "detail", coachId] });
      // Invalidate capacity queries as well
      queryClient.invalidateQueries({ queryKey: ["capacity"] });
      queryClient.invalidateQueries({ queryKey: ["capacity", "metrics"] });
    },
    onError: ({ error }) => {
      console.error("Failed to update capacity:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCapacity = useGlobalDefault
      ? null
      : Number.parseInt(customCapacity);

    execute({
      coachId,
      maxClientUnits: newCapacity,
    });
  };

  const effectiveCapacity = useGlobalDefault
    ? globalDefault
    : Number.parseInt(customCapacity) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Capacity Settings</DialogTitle>
          <DialogDescription>
            Manage the client unit capacity for {coachName}. The global default
            is {globalDefault} units.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="use-global"
                checked={useGlobalDefault}
                onChange={(e) => setUseGlobalDefault(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="use-global" className="font-medium text-sm">
                Use global default ({globalDefault} units)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="use-custom"
                checked={!useGlobalDefault}
                onChange={(e) => setUseGlobalDefault(!e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="use-custom" className="font-medium text-sm">
                Set custom capacity
              </Label>
            </div>

            {!useGlobalDefault && (
              <div className="ml-6 grid gap-2">
                <Label htmlFor="capacity" className="text-sm">
                  Maximum Client Units
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="1000"
                  value={customCapacity}
                  onChange={(e) => setCustomCapacity(e.target.value)}
                  placeholder="Enter capacity..."
                  className="w-full"
                />
              </div>
            )}

            <div className="rounded-md border p-3 text-muted-foreground text-sm">
              <strong>Current setting:</strong> {effectiveCapacity} units
              {useGlobalDefault && " (using global default)"}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Capacity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
