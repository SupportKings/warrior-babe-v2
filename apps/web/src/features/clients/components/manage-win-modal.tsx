"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, Button as UIButton } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import {
	createClientWin,
	updateClientWin,
} from "@/features/clients/actions/relations/wins";
import { clientQueries } from "@/features/clients/queries/useClients";
import { useAllWinTags } from "@/features/system-config/queries/useWinTags";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	Check,
	CheckCircle2,
	ChevronsUpDown,
	Edit,
	Plus,
	X,
} from "lucide-react";
import { toast } from "sonner";

interface ManageWinModalProps {
	clientId: string;
	mode: "add" | "edit";
	win?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageWinModal({
	clientId,
	mode,
	win,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageWinModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const [comboboxOpen, setComboboxOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: winTags = [], isLoading: isLoadingTags } = useAllWinTags();

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		win_date: format(new Date(), "yyyy-MM-dd"),
		tag_ids: [] as string[],
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && win) {
			setFormData({
				title: win.title || "",
				description: win.description || "",
				win_date: win.win_date
					? format(new Date(win.win_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				tag_ids: win.client_win_tags?.map((tag: any) => tag.tag_id) || [],
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				title: "",
				description: "",
				win_date: format(new Date(), "yyyy-MM-dd"),
				tag_ids: [],
			});
		}
	}, [isEdit, win, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("Title is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && win) {
				await updateClientWin(win.id, formData);
				toast.success("Win updated successfully!");
			} else {
				await createClientWin(clientId, formData);
				toast.success("Win added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} win:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} win`);
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
							{isEdit ? "Edit Win" : "Add Win"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5" />
						{isEdit ? "Edit Win" : "Add New Win"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the win details."
							: "Add a new win for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="title">Title *</Label>
						<Input
							id="title"
							placeholder="Win title..."
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							required
						/>
					</div>

					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Win description..."
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div>
						<Label htmlFor="win_date">Win Date</Label>
						<Input
							id="win_date"
							type="date"
							value={formData.win_date}
							onChange={(e) =>
								setFormData({ ...formData, win_date: e.target.value })
							}
						/>
					</div>

					{/* Win Tags Section */}
					<div>
						<Label>Win Tags</Label>
						{isLoadingTags ? (
							<p className="text-muted-foreground text-sm">Loading tags...</p>
						) : winTags.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								No win tags available
							</p>
						) : (
							<div className="mt-2 space-y-2">
								{/* Selected Tags Display */}
								{formData.tag_ids.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{formData.tag_ids.map((tagId) => {
											const tag = winTags.find((t) => t.id === tagId);
											if (!tag) return null;
											return (
												<Badge
													key={tagId}
													variant="secondary"
													style={{
														backgroundColor: tag.color + "20",
														color: tag.color,
														borderColor: tag.color,
													}}
													className="text-xs"
												>
													{tag.name}
													<button
														type="button"
														className="ml-1 rounded-full p-0.5 hover:bg-black/10"
														onClick={() => {
															setFormData({
																...formData,
																tag_ids: formData.tag_ids.filter(
																	(id) => id !== tagId,
																),
															});
														}}
													>
														<X className="h-2.5 w-2.5" />
													</button>
												</Badge>
											);
										})}
									</div>
								)}

								{/* Combobox */}
								<Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
									<PopoverTrigger asChild>
										<UIButton
											variant="outline"
											role="combobox"
											aria-expanded={comboboxOpen}
											className="h-10 w-full justify-between"
											type="button"
										>
											Select tags...
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</UIButton>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0" align="start">
										<Command>
											<CommandInput placeholder="Search tags..." />
											<CommandList>
												<CommandEmpty>No tags found.</CommandEmpty>
												<CommandGroup>
													{winTags.map((tag) => (
														<CommandItem
															key={tag.id}
															value={tag.name}
															onSelect={() => {
																const isSelected = formData.tag_ids.includes(
																	tag.id,
																);
																if (isSelected) {
																	setFormData({
																		...formData,
																		tag_ids: formData.tag_ids.filter(
																			(id) => id !== tag.id,
																		),
																	});
																} else {
																	setFormData({
																		...formData,
																		tag_ids: [...formData.tag_ids, tag.id],
																	});
																}
															}}
															className="cursor-pointer"
														>
															<Check
																className={`mr-2 h-4 w-4 ${
																	formData.tag_ids.includes(tag.id)
																		? "opacity-100"
																		: "opacity-0"
																}`}
															/>
															<span
																style={{ color: tag.color }}
																className="font-medium"
															>
																{tag.name}
															</span>
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
						)}
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
									? "Update Win"
									: "Add Win"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
