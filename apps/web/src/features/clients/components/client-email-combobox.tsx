"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Combobox } from "@base-ui-components/react/combobox";
import { useDebounce } from "@uidotdev/usehooks";
import { Check, ChevronDown, X } from "lucide-react";
import { useSearchClientEmails } from "../queries/useClients";

type ClientEmail = {
	id: number; // client_emails.id
	email: string;
	clientId: string;
	clientName: string;
	clientPrimaryEmail: string;
};

interface ClientEmailComboboxProps {
	value?: number | null;
	onValueChange: (value: number | null) => void;
	placeholder?: string;
	disabled?: boolean;
}

export function ClientEmailCombobox({
	value,
	onValueChange,
	placeholder = "Search clients...",
	disabled = false,
}: ClientEmailComboboxProps) {
	const id = React.useId();
	const [inputValue, setInputValue] = React.useState("");
	
	// Debounce the search term to avoid excessive API calls
	const debouncedSearchTerm = useDebounce(inputValue, 300);

	// Search client emails using the debounced term
	const { data: clientEmails = [], isLoading } = useSearchClientEmails(debouncedSearchTerm);

	// Create items array for the combobox
	const items = React.useMemo(() => {
		return clientEmails.map((clientEmail) => ({
			id: clientEmail.id,
			email: clientEmail.email,
			clientName: clientEmail.clientName,
			clientId: clientEmail.clientId,
			clientPrimaryEmail: clientEmail.clientPrimaryEmail,
			searchableText:
				`${clientEmail.clientName} ${clientEmail.email}`.toLowerCase(),
		}));
	}, [clientEmails]);

	// Find selected item - need to handle the current client_email value from the payment
	const selectedItem = items.find((item) => item.id === value);

	return (
		<Combobox.Root
			items={items}
			value={value?.toString()}
			onValueChange={(newValue) => {
				const numValue = newValue === "" ? null : parseInt(newValue, 10);
				onValueChange(numValue);
			}}
		>
			<div className="relative flex flex-col gap-1 text-sm">
				<Combobox.Input
					placeholder={placeholder}
					id={id}
					disabled={disabled}
					className={cn(
						"h-8 w-full rounded-md border border-input bg-background pr-8 pl-3 font-normal text-sm",
						"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
						"disabled:cursor-not-allowed disabled:opacity-50",
						selectedItem && "text-foreground",
					)}
					value={
						selectedItem
							? `${selectedItem.clientName} (${selectedItem.email})`
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
						disabled={disabled}
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
									? "Searching clients..."
									: debouncedSearchTerm.trim()
										? "No clients found."
										: "Start typing to search clients..."}
							</div>
						</Combobox.Empty>
						<Combobox.List>
							{(item: (typeof items)[0]) => (
								<Combobox.Item
									key={item.id}
									value={item.id.toString()}
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
										<div className="font-medium">{item.clientName}</div>
										<div className="text-muted-foreground text-xs">
											{item.email}
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