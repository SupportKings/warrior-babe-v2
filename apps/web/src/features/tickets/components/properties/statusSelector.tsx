"use client";
import * as React from "react";

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

import {
  OpenIcon,
  InProgressIcon,
  ResolvedIcon,
  UnclaimedIcon,
} from "@/icons/status";

import { CheckIcon, CircleDot, CirclePause } from "lucide-react";

const ClosedIcon: React.FC = () => (
  <CircleDot className="size-4" />
);

const PausedIcon: React.FC = () => (
  <CirclePause className="size-4" />
);

export const statuses = [
  { value: "no-status", label: "No status", icon: UnclaimedIcon },
  { value: "open", label: "Open", icon: OpenIcon },
  { value: "in_progress", label: "In Progress", icon: InProgressIcon },
  { value: "resolved", label: "Resolved", icon: ResolvedIcon },
  { value: "closed", label: "Closed", icon: ClosedIcon },
  { value: "paused", label: "Paused", icon: PausedIcon },
] as const;

export type StatusValue = (typeof statuses)[number]["value"];

interface StatusSelectorProps {
  value?: StatusValue;
  onChange?: (value: StatusValue) => void;
  showNoStatus?: boolean;
}

export const StatusSelector = ({ value, onChange, showNoStatus = true }: StatusSelectorProps) => {
  const [openPopover, setOpenPopover] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedStatus = React.useMemo(() => {
    if (!value) return null;
    return statuses.find((s) => s.value === value) || null;
  }, [value]);

  const availableStatuses = React.useMemo(() => {
    return showNoStatus ? statuses : statuses.filter(s => s.value !== "no-status");
  }, [showNoStatus]);

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Set status"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 font-medium text-[0.8125rem] text-primary leading-normal"
        >
          {selectedStatus && selectedStatus.value !== "no-status" ? (
            <>
              <selectedStatus.icon className="mr-2 size-4" />
              {selectedStatus.label}
            </>
          ) : (
            <>
              <UnclaimedIcon className="mr-2 size-4" />
              Set status
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[206px] rounded-lg p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={6}
      >
        <Command className="rounded-lg">
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-[0.8125rem] leading-normal"
            placeholder="Set status..."
          />
          <CommandList>
            <CommandGroup>
              {availableStatuses.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(value) => {
                    onChange?.(value as StatusValue);
                    setOpenPopover(false);
                    setSearchValue("");
                  }}
                  className="group flex w-full items-center justify-between rounded-md text-[0.8125rem] text-primary leading-normal"
                >
                  <div className="flex items-center">
                    <status.icon className="mr-2 size-4" />
                    <span>{status.label}</span>
                  </div>
                  <div className="flex items-center">
                    {selectedStatus?.value === status.value && (
                      <CheckIcon
                        aria-label="Check"
                        className="mr-3 size-4 text-primary"
                      />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};