"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAllTemplates } from "../hooks/useAllTemplates";
import { useManageTemplate } from "../hooks/useManageTemplate";
import { useDeleteTemplates } from "../hooks/useDeleteTemplates";
import { PlusIcon, TrashIcon, GripVerticalIcon } from "lucide-react";
import { toast } from "sonner";

interface ManageTemplateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface ChecklistItem {
	id?: string;
	name: string;
	is_active: boolean;
	type: string;
}

export function ManageTemplateDialog({ open, onOpenChange }: ManageTemplateDialogProps) {
	const { data: templates, refetch } = useAllTemplates();
	const { mutate: saveTemplate, isPending } = useManageTemplate();
	const { mutate: deleteTemplatesMutation, isPending: isDeleting } = useDeleteTemplates();
	const [items, setItems] = useState<ChecklistItem[]>([]);
	const [deletedIds, setDeletedIds] = useState<string[]>([]);

	useEffect(() => {
		if (templates && templates.length > 0) {
			setItems(templates.map((template: any) => ({
				id: template.id,
				name: template.name || "",
				is_active: template.is_active ?? true,
				type: template.type || "client_cs_onboarding",
			})));
		} else if (open) {
			// If no templates exist, start with an empty list
			setItems([]);
		}
		// Reset deleted IDs when dialog opens
		if (open) {
			setDeletedIds([]);
		}
	}, [templates, open]);

	const handleAddItem = () => {
		const newItem: ChecklistItem = {
			name: "",
			is_active: false,
			type: "client_cs_onboarding",
		};
		setItems([...items, newItem]);
	};

	const handleRemoveItem = (index: number) => {
		const item = items[index];
		if (item.id) {
			// Track deleted items that have IDs (exist in database)
			setDeletedIds([...deletedIds, item.id]);
		}
		setItems(items.filter((_, i) => i !== index));
	};

	const handleItemChange = (index: number, field: keyof ChecklistItem, value: any) => {
		const updatedItems = [...items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		setItems(updatedItems);
	};

	const handleSave = async () => {
		// First, handle deletions if any
		if (deletedIds.length > 0) {
			deleteTemplatesMutation(deletedIds, {
				onSuccess: () => {
					setDeletedIds([]);
				},
				onError: (error: any) => {
					toast.error(error?.message || "Failed to delete templates");
					return;
				},
			});
		}

		// Then save/update remaining items
		const validItems = items
			.filter(item => item.name.trim())
			.map((item, index) => ({
				...item,
				sortOrder: index, // Ensure sequential sort order
			}));
		
		if (validItems.length === 0 && deletedIds.length === 0) {
			toast.error("Please add at least one template");
			return;
		}

		if (validItems.length > 0) {
			saveTemplate(validItems as any[], {
				onSuccess: () => {
					toast.success("Templates updated successfully");
					// Don't close dialog - let the list refresh via query invalidation
				},
				onError: (error: any) => {
					toast.error(error?.message || "Failed to save templates");
				},
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Manage Templates</DialogTitle>
					<DialogDescription>
						Configure checklist templates for client onboarding and offboarding
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-3">
						{items.map((item, index) => (
							<div key={index} className="flex gap-3 p-4 border rounded-lg">
								<button className="cursor-move text-muted-foreground hover:text-foreground">
									<GripVerticalIcon className="h-5 w-5" />
								</button>
								
								<div className="flex-1 space-y-3">
									<Input
										placeholder="Template name"
										value={item.name}
										onChange={(e) => handleItemChange(index, "name", e.target.value)}
									/>
									<div className="flex gap-4">
										<div className="flex-1">
											<Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
											<Select
												value={item.type}
												onValueChange={(value) => handleItemChange(index, "type", value)}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="client_cs_onboarding">Client CS Onboarding</SelectItem>
													<SelectItem value="client_coach_onboarding">Client Coach Onboarding</SelectItem>
													<SelectItem value="client_offboarding">Client Offboarding</SelectItem>
													<SelectItem value="coach_onboarding">Coach Onboarding</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex items-center gap-2 mt-5">
											<Switch
												checked={item.is_active}
												onCheckedChange={(checked) => handleItemChange(index, "is_active", checked)}
											/>
											<Label>Active</Label>
										</div>
									</div>
								</div>
								
								<Button
									size="icon"
									variant="ghost"
									onClick={() => handleRemoveItem(index)}
									className="text-destructive hover:text-destructive"
								>
									<TrashIcon className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>

					<Button
						variant="outline"
						onClick={handleAddItem}
						className="w-full"
					>
						<PlusIcon className="h-4 w-4 mr-2" />
						Add Template
					</Button>
				</div>

				<div className="flex justify-end gap-3">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isPending || isDeleting}>
						{isPending || isDeleting ? "Saving..." : "Save Templates"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}