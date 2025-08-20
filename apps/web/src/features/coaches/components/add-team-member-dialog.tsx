"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { addTeamMember } from "../actions/addTeamMember";
import { coachQueries } from "../queries/coaches";

interface AddTeamMemberDialogProps {
  premierCoachId: string;
}

export function AddTeamMemberDialog({
  premierCoachId,
}: AddTeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: availableCoaches = [], isLoading } = useQuery(
    coachQueries.availableCoaches(premierCoachId)
  );

  const { execute, isExecuting } = useAction(addTeamMember, {
    onSuccess: () => {
      toast.success("Team member added successfully");
      setOpen(false);
      setSelectedCoachId("");

      // Invalidate the coaches query with team filter to refresh the table
      queryClient.invalidateQueries({
        queryKey: ["coaches", "all", undefined, { premiereCoachId: premierCoachId }],
      });

      // Also invalidate available coaches since one was just assigned
      queryClient.invalidateQueries({
        queryKey: ["coaches", "available"],
      });
    },
    onError: (error) => {
      console.error("Client error:", error);
      toast.error(error.error.serverError || "Failed to add team member");
    },
  });

  const handleSubmit = () => {
    if (!selectedCoachId) {
      toast.error("Please select a coach");
      return;
    }

    execute({
      premierCoachId,
      coachId: selectedCoachId,
    });
  };

  const selectedCoach = availableCoaches.find(
    (coach) => coach.id === selectedCoachId
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" />
          Add Coach
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Select a coach to add to your team. Only coaches not currently in
            any team are available.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                aria-expanded={comboboxOpen}
                className="w-full justify-between"
                disabled={isLoading}
              >
                {selectedCoach ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={selectedCoach.image || undefined}
                        alt={selectedCoach.name}
                      />
                      <AvatarFallback>
                        {selectedCoach.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-medium">{selectedCoach.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {selectedCoach.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {isLoading ? "Loading coaches..." : "Select a coach..."}
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search coaches..." />
                <CommandEmpty>
                  {availableCoaches.length === 0
                    ? "No available coaches found."
                    : "No coach found."}
                </CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {availableCoaches.map((coach) => (
                      <CommandItem
                        key={coach.id}
                        value={coach.name}
                        onSelect={() => {
                          setSelectedCoachId(coach.id);
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCoachId === coach.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-1 items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={coach.image || undefined}
                              alt={coach.name}
                            />
                            <AvatarFallback>
                              {coach.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{coach.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {coach.email}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCoachId || isExecuting}
          >
            {isExecuting && (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {isExecuting ? "Adding..." : "Add to Team"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
