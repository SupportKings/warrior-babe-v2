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
import { Switch } from "@/components/ui/switch";

import { addClientActivityPeriod } from "@/features/clients/actions/addClientRelations";
import { updateClientActivityPeriod } from "@/features/clients/actions/updateClientRelations";
import { clientQueries } from "@/features/clients/queries/useClients";
import { useActiveCoaches } from "@/features/coaches/queries/useCoaches";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Edit, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageActivityPeriodModalProps {
	clientId: string;
	mode: "add" | "edit";
	activityPeriod?: any;
	children?: ReactNode;
}

export function ManageActivityPeriodModal({
	clientId,
	mode,
	activityPeriod,
	children,
}: ManageActivityPeriodModalProps) {
	const isEdit = mode === "edit";
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const { data: coaches = [] } = useActiveCoaches();

	const [formData, setFormData] = useState({
		active: true,
		start_date: format(new Date(), "yyyy-MM-dd"),
		end_date: "",
		coach_id: null as number | null,
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && activityPeriod) {
			setFormData({
				active: activityPeriod.active || true,
				start_date: activityPeriod.start_date
					? format(new Date(activityPeriod.start_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				end_date: activityPeriod.end_date
					? format(new Date(activityPeriod.end_date), "yyyy-MM-dd")
					: "",
				coach_id: activityPeriod.coach_id || null,
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				active: true,
				start_date: format(new Date(), "yyyy-MM-dd"),
				end_date: "",
				coach_id: null,
			});
		}
	}, [isEdit, activityPeriod, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			if (isEdit && activityPeriod) {
				await updateClientActivityPeriod(clientId, {
					...formData,
					id: activityPeriod.id,
				});
				toast.success("Activity period updated successfully!");
			} else {
				await addClientActivityPeriod(clientId, formData);
				toast.success("Activity period added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} activity period:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} activity period`);
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
						{isEdit ? "Edit Activity Period" : "Add Activity Period"}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						{isEdit ? "Edit Activity Period" : "Add New Activity Period"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the activity period details."
							: "Add a new activity period for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex items-center space-x-2">
						<Switch
							id="active"
							checked={formData.active}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, active: checked })
							}
						/>
						<Label htmlFor="active">Active</Label>
					</div>

					<div>
						<Label htmlFor="coach_id">Coach</Label>
						<Select
							value={formData.coach_id ? formData.coach_id.toString() : "none"}
							onValueChange={(value) =>
								setFormData({
									...formData,
									coach_id: value === "none" ? null : Number.parseInt(value),
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a coach (optional)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No coach assigned</SelectItem>
								{coaches.map((coach: any) => (
									<SelectItem key={coach.id} value={coach.id.toString()}>
										{coach.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
									? "Update Activity Period"
									: "Add Activity Period"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
