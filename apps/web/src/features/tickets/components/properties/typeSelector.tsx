"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
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

import { CheckIcon } from "lucide-react";

type TicketType = {
  value: (typeof ticketTypes)[number]["value"];
  label: string;
  color: string;
};

export const ticketTypes = [
  {
    value: "no-type",
    label: "No type",
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  {
    value: "billing",
    label: "Billing",
    color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  {
    value: "tech_problem",
    label: "Tech Problem",
    color: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  {
    value: "escalation",
    label: "Escalation",
    color: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  {
    value: "coaching_transfer",
    label: "Coaching Transfer",
    color: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  },
  {
    value: "retention",
    label: "Retention",
    color: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  {
    value: "pausing",
    label: "Pausing",
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  {
    value: "other",
    label: "Other",
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
] as const;

export type TypeValue = (typeof ticketTypes)[number]["value"];

interface TypeSelectorProps {
  value?: TypeValue;
  onChange?: (value: TypeValue) => void;
  showNoType?: boolean;
}

export const TypeSelector = ({ value, onChange, showNoType = true }: TypeSelectorProps) => {
  const [openPopover, setOpenPopover] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedType = React.useMemo(() => {
    if (!value) return null;
    return ticketTypes.find((t) => t.value === value) || null;
  }, [value]);

  const availableTypes = React.useMemo(() => {
    return showNoType ? ticketTypes : ticketTypes.filter(t => t.value !== "no-type");
  }, [showNoType]);

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Set type"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 font-medium text-[0.8125rem] text-primary leading-normal"
        >
          {selectedType && selectedType.value !== "no-type" ? (
            <Badge
              variant="secondary"
              className={cn("border-0", selectedType.color)}
            >
              {selectedType.label}
            </Badge>
          ) : (
            <span>Set type</span>
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
            placeholder="Set type..."
          />
          <CommandList>
            <CommandGroup>
              {availableTypes.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={(value) => {
                    onChange?.(value as TypeValue);
                    setOpenPopover(false);
                    setSearchValue("");
                  }}
                  className="group flex w-full items-center justify-between rounded-md text-[0.8125rem] text-primary leading-normal"
                >
                  <div className="flex items-center">
                    <Badge
                      variant="secondary"
                      className={cn("mr-2 border-0", type.color)}
                    >
                      {type.label}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    {selectedType?.value === type.value && (
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
