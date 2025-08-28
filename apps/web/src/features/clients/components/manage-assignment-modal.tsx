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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { addClientAssignment } from "@/features/clients/actions/addClientRelations";
import { updateClientAssignment } from "@/features/clients/actions/updateClientRelations";
import { clientQueries } from "@/features/clients/queries/useClients";
import { useActiveCoaches } from "@/features/coaches/queries/useCoaches";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Plus, User } from "lucide-react";
import { toast } from "sonner";

interface ManageAssignmentModalProps {
	clientId: string;
	mode: "add" | "edit";
	assignment?: any;
	children?: ReactNode;
}

export function ManageAssignmentModal({
	clientId,
	mode,
	assignment,
	children,
}: ManageAssignmentModalProps) {
	const isEdit = mode === "edit";
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const { data: coaches = [] } = useActiveCoaches();

	const [formData, setFormData] = useState({
		coach_id: null as string | null,
		start_date: format(new Date(), "yyyy-MM-dd"),
		end_date: "",
		assignment_type: "",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && assignment) {
			setFormData({
				coach_id: assignment.coach_id || null,
				start_date: assignment.start_date
					? format(new Date(assignment.start_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				end_date: assignment.end_date
					? format(new Date(assignment.end_date), "yyyy-MM-dd")
					: "",
				assignment_type: assignment.assignment_type || "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				coach_id: null,
				start_date: format(new Date(), "yyyy-MM-dd"),
				end_date: "",
				assignment_type: "",
			});
		}
	}, [isEdit, assignment, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.coach_id) {
			toast.error("Coach is required");
			return;
		}

		if (!formData.assignment_type.trim()) {
			toast.error("Assignment type is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && assignment) {
				await updateClientAssignment(clientId, {
					...formData,
					id: assignment.id,
				});
				toast.success("Assignment updated successfully!");
			} else {
				await addClientAssignment(clientId, formData);
				toast.success("Assignment added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} assignment:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} assignment`);
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
						{isEdit ? "Edit Assignment" : "Add Assignment"}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{isEdit ? "Edit Assignment" : "Add New Assignment"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the assignment details."
							: "Assign a coach to this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="coach_id">Coach *</Label>
						<Select
							value={formData.coach_id || "none"}
							onValueChange={(value) =>
								setFormData({
									...formData,
									coach_id: value === "none" ? null : value,
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a coach" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none" disabled>
									Select a coach
								</SelectItem>
								{coaches.map((coach: any) => (
									<SelectItem key={coach.id} value={coach.id.toString()}>
										{coach.name} ({coach.user?.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="assignment_type">Assignment Type *</Label>
						<Input
							id="assignment_type"
							placeholder="e.g., Primary Coach, Nutrition Coach, etc."
							value={formData.assignment_type}
							onChange={(e) =>
								setFormData({ ...formData, assignment_type: e.target.value })
							}
							required
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="start_date">Start Date *</Label>
							<Input
								id="start_date"
								type="date"
								value={formData.start_date}
								onChange={(e) =>
									setFormData({ ...formData, start_date: e.target.value })
								}
								required
							/>
						</div>

						<div>
							<Label htmlFor="end_date">End Date</Label>
							<Input
								id="end_date"
								type="date"
								value={formData.end_date}
								onChange={(e) =>
									setFormData({ ...formData, end_date: e.target.value })
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
									? "Update Assignment"
									: "Add Assignment"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
