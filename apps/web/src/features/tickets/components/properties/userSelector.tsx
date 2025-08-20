"use client";
import * as React from "react";

import { roleDisplayNames } from "@/lib/permissions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { UnassignedIcon } from "@/icons/unassigned";

import { CheckIcon } from "lucide-react";

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
};

export type ClientAssignment = {
  user_id: string;
  assignment_type: string;
};

interface UserSelectorProps {
  users: User[];
  value?: string;
  onChange?: (userId: string) => void;
  placeholder?: string;
  showUnassigned?: boolean;
  clientAssignments?: ClientAssignment[];
}

export const UserSelector = ({
  users,
  value,
  onChange,
  placeholder = "Unassigned",
  showUnassigned = true,
  clientAssignments = [],
}: UserSelectorProps) => {
  const [openPopover, setOpenPopover] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedUser = React.useMemo(() => {
    if (!value || value === "unassigned") return null;
    return users.find((u) => u.id === value) || null;
  }, [value, users]);

  // Create a map of user assignments for quick lookup
  const userAssignmentMap = React.useMemo(() => {
    const map = new Map<string, string>();
    clientAssignments.forEach((assignment) => {
      map.set(assignment.user_id, assignment.assignment_type);
    });
    return map;
  }, [clientAssignments]);

  const allOptions = React.useMemo(
    () => [
      ...(showUnassigned
        ? [{ id: "unassigned", name: "Unassigned", email: "", image: null }]
        : []),
      ...users,
    ],
    [users, showUnassigned]
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return allOptions;

    const lowerSearch = searchValue.toLowerCase();
    return allOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(lowerSearch) ||
        option.email.toLowerCase().includes(lowerSearch)
    );
  }, [searchValue, allOptions]);

  // Group users by client relevance and role
  const groupedOptions = React.useMemo(() => {
    const unassignedUsers: typeof filteredOptions = [];
    const clientRelevantGroups: Record<string, typeof filteredOptions> = {};
    const otherGroups: Record<string, typeof filteredOptions> = {};

    filteredOptions.forEach((option) => {
      if (option.id === "unassigned") {
        unassignedUsers.push(option);
      } else {
        const clientAssignment = userAssignmentMap.get(option.id);

        if (clientAssignment) {
          // User has client assignment - put in client relevant section
          const assignmentType =
            clientAssignment === "coach"
              ? "Coach"
              : clientAssignment === "premier_coach"
              ? "Premier Coach"
              : clientAssignment;

          if (!clientRelevantGroups[assignmentType])
            clientRelevantGroups[assignmentType] = [];
          clientRelevantGroups[assignmentType].push(option);
        } else {
          // User has no client assignment - put in other users section
          const role = option.role || "user";
          if (!otherGroups[role]) otherGroups[role] = [];
          otherGroups[role].push(option);
        }
      }
    });

    return {
      unassigned: unassignedUsers,
      clientRelevant: clientRelevantGroups,
      other: otherGroups,
    };
  }, [filteredOptions, userAssignmentMap]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Assign user"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 font-medium text-[0.8125rem] text-primary leading-normal"
        >
          {selectedUser ? (
            <>
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage src={selectedUser.image || undefined} />
                <AvatarFallback className="text-[0.625rem]">
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedUser.name}</span>
            </>
          ) : (
            <>
              <UnassignedIcon className="mr-2 size-4" aria-hidden="true" />
              {placeholder}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[300px] rounded-lg p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={6}
      >
        <Command className="rounded-lg">
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-[0.8125rem] leading-normal"
            placeholder="Search users..."
          />
          <CommandList>
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-muted-foreground text-sm">
                No users found
              </div>
            ) : (
              <>
                {/* Unassigned Section */}
                {groupedOptions.unassigned.length > 0 && (
                  <CommandGroup heading="">
                    {groupedOptions.unassigned.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={option.name}
                        onSelect={() => {
                          onChange?.(option.id);
                          setOpenPopover(false);
                          setSearchValue("");
                        }}
                        className="group flex w-full items-center justify-between rounded-md text-[0.8125rem] text-primary leading-normal"
                      >
                        <div className="flex items-center">
                          <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                            <UnassignedIcon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{option.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {!selectedUser && option.id === "unassigned" && (
                            <CheckIcon
                              aria-label="Check"
                              className="mr-3 size-4 text-primary"
                            />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Client Team Section */}
                {Object.keys(groupedOptions.clientRelevant).length > 0 && (
                  <>
                    <CommandGroup
                      className="bg-blue-50/50"
                      heading="Client Team"
                    >
                      {Object.entries(groupedOptions.clientRelevant).map(
                        ([assignmentType, users]) => (
                          <div key={assignmentType}>
                            <div className="px-2 py-1.5 font-medium text-blue-700 text-xs">
                              {assignmentType}
                            </div>
                            {users.map((option) => (
                              <CommandItem
                                key={option.id}
                                value={option.name}
                                onSelect={() => {
                                  onChange?.(option.id);
                                  setOpenPopover(false);
                                  setSearchValue("");
                                }}
                                className="group ml-4 flex w-full items-center justify-between rounded-md text-[0.8125rem] text-primary leading-normal hover:bg-blue-100/50"
                              >
                                <div className="flex items-center">
                                  <Avatar className="mr-2 h-6 w-6">
                                    <AvatarImage
                                      src={option.image || undefined}
                                    />
                                    <AvatarFallback className="text-[0.625rem]">
                                      {getInitials(option.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {option.name}
                                      </span>
                                    </div>
                                    {option.email && (
                                      <span className="text-muted-foreground text-xs">
                                        {option.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {selectedUser?.id === option.id && (
                                    <CheckIcon
                                      aria-label="Check"
                                      className="mr-3 size-4 text-primary"
                                    />
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </div>
                        )
                      )}
                    </CommandGroup>

                    {/* Separator after Client Team */}
                    <div className="mx-2 my-2 border-border border-t" />
                  </>
                )}

                {/* Other Users Section */}
                {Object.keys(groupedOptions.other).length > 0 &&
                  Object.entries(groupedOptions.other).map(
                    ([role, roleUsers]) => (
                      <CommandGroup
                        key={role}
                        heading={
                          roleDisplayNames[
                            role as keyof typeof roleDisplayNames
                          ] || role.charAt(0).toUpperCase() + role.slice(1)
                        }
                      >
                        {roleUsers.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={option.name}
                            onSelect={() => {
                              onChange?.(option.id);
                              setOpenPopover(false);
                              setSearchValue("");
                            }}
                            className="group flex w-full items-center justify-between rounded-md text-[0.8125rem] text-primary leading-normal"
                          >
                            <div className="flex items-center">
                              <Avatar className="mr-2 h-6 w-6">
                                <AvatarImage src={option.image || undefined} />
                                <AvatarFallback className="text-[0.625rem]">
                                  {getInitials(option.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {option.name}
                                  </span>
                                </div>
                                {option.email && (
                                  <span className="text-muted-foreground text-xs">
                                    {option.email}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              {selectedUser?.id === option.id && (
                                <CheckIcon
                                  aria-label="Check"
                                  className="mr-3 size-4 text-primary"
                                />
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                  )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
