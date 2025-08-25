"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

import { addClientWin } from "@/features/clients/actions/addClientRelations";
import { updateClientWin } from "@/features/clients/actions/updateClientRelations";
import { clientQueries } from "@/features/clients/queries/useClients";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageWinModalProps {
	clientId: string;
	mode: "add" | "edit";
	win?: any;
	children?: ReactNode;
}

export function ManageWinModal({
	clientId,
	mode,
	win,
	children,
}: ManageWinModalProps) {
	const isEdit = mode === "edit";
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		win_date: format(new Date(), "yyyy-MM-dd"),
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
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				title: "",
				description: "",
				win_date: format(new Date(), "yyyy-MM-dd"),
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
				await updateClientWin(clientId, { ...formData, id: win.id });
				toast.success("Win updated successfully!");
			} else {
				await addClientWin(clientId, formData);
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
