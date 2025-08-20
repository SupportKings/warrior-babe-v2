"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

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
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  NoPriorityIcon,
  UrgentPriorityIcon,
} from "@/icons/priority";

import { CheckIcon } from "lucide-react";

type Priority = {
  value: (typeof priorities)[number]["value"];
  label: string;
  icon: any;
};

export const priorities = [
  { value: "no-priority", label: "No priority", icon: NoPriorityIcon },
  { value: "urgent", label: "Urgent", icon: UrgentPriorityIcon },
  { value: "high", label: "High", icon: HighPriorityIcon },
  { value: "medium", label: "Medium", icon: MediumPriorityIcon },
  { value: "low", label: "Low", icon: LowPriorityIcon },
] as const;

export type PriorityValue = (typeof priorities)[number]["value"];

interface PrioritySelectorProps {
  value?: PriorityValue;
  onChange?: (value: PriorityValue) => void;
  showNoPriority?: boolean;
}

export const PrioritySelector = ({ value, onChange, showNoPriority = true }: PrioritySelectorProps) => {
  const [openPopover, setOpenPopover] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedPriority = React.useMemo(() => {
    if (!value) return null;
    return priorities.find((p) => p.value === value) || null;
  }, [value]);

  const availablePriorities = React.useMemo(() => {
    return showNoPriority ? priorities : priorities.filter(p => p.value !== "no-priority");
  }, [showNoPriority]);

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Set priority"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 font-medium text-[0.8125rem] text-primary leading-normal"
        >
          {selectedPriority && selectedPriority.value !== "no-priority" ? (
            <>
              <selectedPriority.icon
                className={cn(
                  "mr-2 size-4",
                  selectedPriority.value !== "urgent" && "fill-primary"
                )}
                aria-hidden="true"
              />
              {selectedPriority.label}
            </>
          ) : (
            <>
              <NoPriorityIcon
                className="mr-2 size-4 fill-primary"
                aria-hidden="true"
                aria-label="Set priority"
              />
              Set priority
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
            onValueChange={(searchValue) => {
              // If the user types a number, select the priority like useHotkeys
              if ([0, 1, 2, 3, 4].includes(Number.parseInt(searchValue))) {
                const priority = availablePriorities[Number.parseInt(searchValue)];
                if (priority) {
                  onChange?.(priority.value);
                  setOpenPopover(false);
                  setSearchValue("");
                  return;
                }
              }
              setSearchValue(searchValue);
            }}
            className="text-[0.8125rem] leading-normal"
            placeholder="Set priority..."
          />
          <CommandList>
            <CommandGroup>
              {availablePriorities.map((priority) => (
                <CommandItem
                  key={priority.value}
                  value={priority.value}
                  onSelect={(value) => {
                    onChange?.(value as PriorityValue);
                    setOpenPopover(false);
                    setSearchValue("");
                  }}
                  className="group flex w-full items-center justify-between rounded-md text-[0.8125rem] text-primary leading-normal"
                >
                  <div className="flex items-center">
                    <priority.icon
                      aria-label={priority.label}
                      className={cn(
                        "mr-2 size-4",
                        priority.value !== "urgent" && "fill-primary",
                        priority.value === "urgent" && "fill-urgent"
                      )}
                    />
                    <span>{priority.label}</span>
                  </div>
                  <div className="flex items-center">
                    {selectedPriority?.value === priority.value && (
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
