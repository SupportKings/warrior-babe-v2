"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Combobox } from "@base-ui-components/react/combobox";
import { format } from "date-fns";
import { Check, ChevronDown, X } from "lucide-react";
import { usePaymentSlotsForClient } from "../queries/usePaymentSlots";

interface PaymentSlotComboboxProps {
	value?: string | null;
	onValueChange: (value: string | null) => void;
	clientId?: string | null;
	placeholder?: string;
	disabled?: boolean;
}

export function PaymentSlotCombobox({
	value,
	onValueChange,
	clientId,
	placeholder = "Select payment slot...",
	disabled = false,
}: PaymentSlotComboboxProps) {
	const id = React.useId();
	const [inputValue, setInputValue] = React.useState("");

	// Fetch payment slots for the specific client
	const { data: paymentSlots = [], isLoading } = usePaymentSlotsForClient(
		clientId || undefined,
	);

	// Create items array for the combobox
	const items = React.useMemo(() => {
		return paymentSlots.map((slot) => {
			const duration = slot.payment_plans.products.default_duration_months;
			const productDisplayName = duration 
				? `${slot.payment_plans.products.name} - ${duration} Months`
				: slot.payment_plans.products.name;
			
			return {
				id: slot.id,
				productName: productDisplayName,
				amountDue: slot.amount_due,
				dueDate: slot.due_date,
				searchableText:
					`${productDisplayName} ${slot.amount_due.toLocaleString()} ${format(new Date(slot.due_date), "MMMM dd yyyy")}`.toLowerCase(),
			};
		});
	}, [paymentSlots]);

	// Filter items based on search
	const filteredItems = React.useMemo(() => {
		if (!inputValue.trim()) return items;
		return items.filter((item) =>
			item.searchableText.includes(inputValue.toLowerCase()),
		);
	}, [items, inputValue]);

	// Find selected item
	const selectedItem = items.find((item) => item.id === value);

	return (
		<Combobox.Root
			items={filteredItems}
			value={value}
			onValueChange={(newValue) => {
				onValueChange(newValue === "" ? null : newValue);
			}}
		>
			<div className="relative flex flex-col gap-1 text-sm">
				<Combobox.Input
					placeholder={placeholder}
					id={id}
					disabled={disabled || isLoading}
					className={cn(
						"h-8 w-full rounded-md border border-input bg-background pr-8 pl-3 font-normal text-sm",
						"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
						"disabled:cursor-not-allowed disabled:opacity-50",
						selectedItem && "text-foreground",
					)}
					value={
						selectedItem
							? `${selectedItem.productName} - $${(selectedItem.amountDue / 100).toLocaleString()} - ${format(new Date(selectedItem.dueDate), "MMM dd, yyyy")}`
							: inputValue
					}
					onChange={(e) => setInputValue(e.target.value)}
				/>
				<div className="absolute top-0 right-1 flex h-8 items-center justify-center">
					{value && (
						<Combobox.Clear
							className="flex h-6 w-6 items-center justify-center rounded bg-transparent p-0 hover:bg-accent"
							aria-label="Clear selection"
							onClick={() => setInputValue("")}
						>
							<X className="size-3" />
						</Combobox.Clear>
					)}
					<Combobox.Trigger
						className="flex h-6 w-6 items-center justify-center rounded bg-transparent p-0 hover:bg-accent"
						aria-label="Open popup"
						disabled={disabled || isLoading}
					>
						<ChevronDown className="size-3" />
					</Combobox.Trigger>
				</div>
			</div>

			<Combobox.Portal>
				<Combobox.Positioner className="outline-none" sideOffset={4}>
					<Combobox.Popup
						className={cn(
							"max-h-[min(var(--available-height),20rem)] w-[var(--anchor-width)] max-w-[var(--available-width)]",
							"overflow-y-auto overscroll-contain rounded-md border bg-popover shadow-md",
							"origin-[var(--transform-origin)] transition-[transform,scale,opacity] duration-200",
							"data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
							"data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
							"!pb-0 !pt-0",
						)}
					>
						<Combobox.Empty className="px-3 py-0 text-muted-foreground text-sm">
							<div className="py-2">
								{isLoading
									? "Loading payment slots..."
									: "No payment slots found."}
							</div>
						</Combobox.Empty>
						<Combobox.List>
							{(item: (typeof items)[0]) => (
								<Combobox.Item
									key={item.id}
									value={item.id}
									className={cn(
										"relative flex cursor-default select-none items-start rounded-sm pr-3 pl-6 text-sm outline-none",
										"hover:bg-accent hover:text-accent-foreground",
										"data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
										"data-[selected]:bg-primary data-[selected]:text-primary-foreground",
										"px-3 py-2",
									)}
								>
									<Combobox.ItemIndicator className="absolute top-2 left-2">
										<Check className="size-3" />
									</Combobox.ItemIndicator>
									<div className="space-y-1">
										<div className="font-medium">{item.productName}</div>
										<div className="text-muted-foreground text-xs">
											$
											{item.amountDue.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</div>
										<div className="text-muted-foreground text-xs">
											Due {format(new Date(item.dueDate), "MMMM dd, yyyy")}
										</div>
									</div>
								</Combobox.Item>
							)}
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	);
}
