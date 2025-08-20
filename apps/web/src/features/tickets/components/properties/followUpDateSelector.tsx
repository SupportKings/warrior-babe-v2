"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { addMonths, addWeeks, format, startOfTomorrow } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface FollowUpDateSelectorProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
}

export const FollowUpDateSelector = ({
  value,
  onChange,
  placeholder = "Set follow up date",
}: FollowUpDateSelectorProps) => {
  const [openPopover, setOpenPopover] = React.useState(false);

  const today = new Date();
  const tomorrow = startOfTomorrow();
  const nextWeek = addWeeks(today, 1);
  const nextMonth = addMonths(today, 1);

  const presets = [
    {
      label: "Today",
      date: today,
    },
    {
      label: "Tomorrow",
      date: tomorrow,
    },
    {
      label: "Next week",
      date: nextWeek,
    },
    {
      label: "Next month",
      date: nextMonth,
    },
  ];

  const handlePresetClick = (date: Date) => {
    // Create a new date at noon to avoid timezone issues
    const adjustedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    onChange?.(adjustedDate);
    setOpenPopover(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Create a new date at noon to avoid timezone issues
      const adjustedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      onChange?.(adjustedDate);
      setOpenPopover(false);
    }
  };

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Set follow up date"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 font-medium text-[0.8125rem] text-primary leading-normal"
        >
          {value ? (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{format(value, "MMM d, yyyy")}</span>
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 size-4" aria-hidden="true" />
              {placeholder}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] rounded-lg p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={6}
      >
        <div className="rounded-md border">
          <div className="flex max-sm:flex-col">
            <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
              <div className="h-full sm:border-e">
                <div className="flex flex-col gap-1 px-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start py-2 text-sm font-medium"
                      onClick={() => handlePresetClick(preset.date)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              className="p-2 [&_button]:text-xs [&_button]:h-8 [&_button]:w-8"
              disabled={[
                { before: today }, // Disable past dates
              ]}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
