"use client";

import { type ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  createTeamMember,
  updateTeamMember,
} from "@/features/coach-teams/actions/relations/team-members";
import { coachTeamQueries } from "@/features/coach-teams/queries/usecoach-teams";
import { getAllCoaches } from "@/features/coaches/actions/getCoaches";

// Import available coaches query
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Edit, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { useRoles } from "@/features/coaches/queries/useRoles";

interface ManageTeamMemberModalProps {
  teamId: string;
  mode: "add" | "edit";
  teamMember?: any;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ManageTeamMemberModal({
  teamId,
  mode,
  teamMember,
  children,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ManageTeamMemberModalProps) {
  const isEdit = mode === "edit";
  const [internalOpen, setInternalOpen] = useState(false);
  console.log("team member", teamMember);
  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Available coaches query (coaches not already in this team)
  const { data: coaches = [] } = useQuery({
    queryKey: ["coaches", "available-for-team", teamId],
    queryFn: getAllCoaches,
    staleTime: 2 * 60 * 1000,
  });
  const { data: roles = [] } = useRoles();
  const [formData, setFormData] = useState({
    coachId: null as string | null,
    roles: [] as string[],
  });
  console.log(roles);
  const [coachComboboxOpen, setCoachComboboxOpen] = useState(false);
  const [rolesComboboxOpen, setRolesComboboxOpen] = useState(false);

  console.log(formData);
  // Populate form data when editing
  useEffect(() => {
    if (isEdit && teamMember) {
      setFormData({
        coachId: teamMember.id || null,
        roles: teamMember.user.role ? teamMember.user.role.split(",") : [],
      });
    } else if (!isEdit) {
      // Reset form for add mode
      setFormData({
        coachId: null,
        roles: [],
      });
    }
  }, [isEdit, teamMember, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.coachId) {
      toast.error("Coach is required");
      return;
    }

    if (formData.roles.length === 0) {
      toast.error("At least one role is required");
      return;
    }

    setIsLoading(true);

    try {
      // Get the selected coach's name
      const selectedCoach = coaches.find(
        (coach: any) => coach.id === formData.coachId
      );
      const coachName = selectedCoach?.name || "Unknown Coach";

      if (isEdit && teamMember) {
        await updateTeamMember(teamMember.id, {
          name: coachName,
          role: formData.roles.join(","),
          user_id: teamMember.user_id,
        });
        toast.success("Team member updated successfully!");
      } else {
        // formData.coachId is the team_member.id, we need to get the user_id
        const teamMemberToAdd = coaches.find(
          (coach: any) => coach.id === formData.coachId
        );
        
        await createTeamMember(teamId, {
          name: coachName,
          role: formData.roles.join(","), // Join multiple roles
          user_id: teamMemberToAdd?.user?.id,
          team_member_id: formData.coachId,
        });
        toast.success("Team member added successfully!");
      }

      // Invalidate the coach team query to refresh the data
      await queryClient.invalidateQueries({
        queryKey: coachTeamQueries.detail(teamId),
      });

      setOpen(false);
    } catch (error) {
      console.error(
        `Error ${isEdit ? "updating" : "adding"} team member:`,
        error
      );
      toast.error(`Failed to ${isEdit ? "update" : "add"} team member`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger>
          {children || (
            <Button variant="outline" size="sm" className="gap-2">
              {isEdit ? (
                <Edit className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isEdit ? "Edit Member" : "Add Member"}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isEdit ? "Edit Team Member" : "Add New Team Member"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the team member details."
              : "Add a new team member to this coach team."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coach Selection Combobox */}
          <div>
            <Label>Coach *</Label>
            <Popover
              open={coachComboboxOpen}
              onOpenChange={setCoachComboboxOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={coachComboboxOpen}
                  className="h-10 w-full justify-between"
                  disabled={isEdit}
                >
                  {formData.coachId
                    ? coaches.find(
                        (coach: any) => coach.id === formData.coachId
                      )?.name ||
                      (isEdit && teamMember ? teamMember.name : "Unknown Coach")
                    : "Select coach..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search coaches..." />
                  <CommandEmpty>No coach found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {coaches.map((coach: any) => (
                        <CommandItem
                          key={coach.id}
                          value={coach.name || "Unnamed Coach"}
                          onSelect={() => {
                            setFormData({
                              ...formData,
                              coachId:
                                coach.id === formData.coachId
                                  ? null
                                  : coach.id,
                            });
                            setCoachComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.coachId === coach.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {coach.name || "Unnamed Coach"}
                          {coach.user?.email && (
                            <span className="ml-2 text-muted-foreground">
                              ({coach.user.email})
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Roles Multiple Selection Combobox */}
          <div>
            <Label>Roles *</Label>
            <Popover
              open={rolesComboboxOpen}
              onOpenChange={setRolesComboboxOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={rolesComboboxOpen}
                  className="h-10 min-h-[2.5rem] w-full justify-between"
                >
                  <div className="flex flex-row gap-1 overflow-hidden">
                    {formData.roles.length === 0 ? (
                      <span className="text-muted-foreground">
                        Select roles...
                      </span>
                    ) : (
                      formData.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {role.split("_").join(" ")}
                        </Badge>
                      ))
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search roles..." />
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {roles.map((role) => (
                        <CommandItem
                          key={role.id}
                          value={role.description || ""}
                          onSelect={() => {
                            const isSelected =
                              formData.roles.includes(role.name);
                            setFormData({
                              ...formData,
                              roles: isSelected
                                ? formData.roles.filter(
                                    (r) => r !== role.name
                                  )
                                : [...formData.roles, role.name],
                            });
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.roles.includes(role.name)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {role.description}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                ? "Update Member"
                : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
