"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	id?: string;
}

export function DatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	disabled = false,
	className,
	id,
}: DatePickerProps) {
	const [date, setDate] = React.useState<Date | undefined>(
		value ? new Date(value) : undefined
	);

	const handleDateSelect = (newDate: Date | undefined) => {
		setDate(newDate);
		if (onChange && newDate) {
			onChange(newDate.toISOString().split("T")[0]);
		} else if (onChange && !newDate) {
			onChange("");
		}
	};

	React.useEffect(() => {
		if (value) {
			setDate(new Date(value));
		} else {
			setDate(undefined);
		}
	}, [value]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant={"outline"}
					className={cn(
						"w-full justify-start text-left font-normal h-10",
						!date && "text-muted-foreground",
						className
					)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleDateSelect}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}