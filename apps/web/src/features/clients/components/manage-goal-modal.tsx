"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
	createClientGoal,
	updateClientGoal,
} from "@/features/clients/actions/relations/goals";
import { clientQueries } from "@/features/clients/queries/useClients";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Plus, Target } from "lucide-react";
import { toast } from "sonner";

interface ManageGoalModalProps {
	clientId: string;
	mode: "add" | "edit";
	goal?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageGoalModal({
	clientId,
	mode,
	goal,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageGoalModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		target_value: "",
		current_value: "",
		status: "pending" as
			| "pending"
			| "in_progress"
			| "completed"
			| "cancelled"
			| "overdue",
		due_date: format(new Date(), "yyyy-MM-dd"),
		started_at: format(new Date(), "yyyy-MM-dd"),
		priority: "medium" as "high" | "medium" | "low",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && goal) {
			setFormData({
				title: goal.title || "",
				description: goal.description || "",
				target_value: goal.target_value || "",
				current_value: goal.current_value || "",
				status: goal.status || "pending",
				due_date: goal.due_date
					? format(new Date(goal.due_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				started_at: goal.started_at
					? format(new Date(goal.started_at), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				priority: goal.priority || "medium",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				title: "",
				description: "",
				target_value: "",
				current_value: "",
				status: "pending",
				due_date: format(new Date(), "yyyy-MM-dd"),
				started_at: format(new Date(), "yyyy-MM-dd"),
				priority: "medium",
			});
		}
	}, [isEdit, goal]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error("Title is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && goal) {
				await updateClientGoal(goal.id, formData);
				toast.success("Goal updated successfully!");
			} else {
				await createClientGoal(clientId, formData);
				toast.success("Goal added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} goal:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} goal`);
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
							{isEdit ? "Edit Goal" : "Add Goal"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Target className="h-5 w-5" />
						{isEdit ? "Edit Goal" : "Add New Goal"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the goal details."
							: "Add a new goal for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="title">Title *</Label>
						<Input
							id="title"
							placeholder="Goal title..."
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
							placeholder="Goal description..."
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="target_value">Target Value</Label>
							<Input
								id="target_value"
								placeholder="e.g., 10 lbs, 30 minutes..."
								value={formData.target_value}
								onChange={(e) =>
									setFormData({ ...formData, target_value: e.target.value })
								}
							/>
						</div>

						<div>
							<Label htmlFor="current_value">Current Value</Label>
							<Input
								id="current_value"
								placeholder="e.g., 5 lbs, 15 minutes..."
								value={formData.current_value}
								onChange={(e) =>
									setFormData({ ...formData, current_value: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="status">Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value: any) =>
									setFormData({ ...formData, status: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
									<SelectItem value="overdue">Overdue</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="priority">Priority</Label>
							<Select
								value={formData.priority}
								onValueChange={(value: any) =>
									setFormData({ ...formData, priority: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="started_at">Started At</Label>
							<Input
								id="started_at"
								type="date"
								value={formData.started_at}
								onChange={(e) =>
									setFormData({ ...formData, started_at: e.target.value })
								}
							/>
						</div>

						<div>
							<Label htmlFor="due_date">Due Date</Label>
							<Input
								id="due_date"
								type="date"
								value={formData.due_date}
								onChange={(e) =>
									setFormData({ ...formData, due_date: e.target.value })
								}
							/>
						</div>
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
									? "Update Goal"
									: "Add Goal"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
