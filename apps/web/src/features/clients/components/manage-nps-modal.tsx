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
import { Textarea } from "@/components/ui/textarea";

import {
	createClientNPSScore,
	updateClientNPSScore,
} from "@/features/clients/actions/relations/nps-scores";
import { clientQueries } from "@/features/clients/queries/useClients";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Plus, Star } from "lucide-react";
import { toast } from "sonner";

interface ManageNPSModalProps {
	clientId: string;
	mode: "add" | "edit";
	npsScore?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageNPSModal({
	clientId,
	mode,
	npsScore,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageNPSModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		nps_score: 5,
		notes: "",
		recorded_date: format(new Date(), "yyyy-MM-dd"),
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && npsScore) {
			setFormData({
				nps_score: npsScore.nps_score || 5,
				notes: npsScore.notes || "",
				recorded_date: npsScore.recorded_date
					? format(new Date(npsScore.recorded_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				nps_score: 5,
				notes: "",
				recorded_date: format(new Date(), "yyyy-MM-dd"),
			});
		}
	}, [isEdit, npsScore, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		try {
			if (isEdit && npsScore) {
				await updateClientNPSScore(npsScore.id, formData);
				toast.success("NPS score updated successfully!");
			} else {
				await createClientNPSScore(clientId, formData);
				toast.success("NPS score added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} NPS score:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} NPS score`);
		} finally {
			setIsLoading(false);
		}
	};

	const getNPSColor = (score: number) => {
		if (score >= 9) return "text-green-600";
		if (score >= 7) return "text-yellow-600";
		return "text-red-600";
	};

	const getNPSLabel = (score: number) => {
		if (score >= 9) return "Promoter";
		if (score >= 7) return "Passive";
		return "Detractor";
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
							{isEdit ? "Edit NPS Score" : "Add NPS Score"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Star className="h-5 w-5" />
						{isEdit ? "Edit NPS Score" : "Add New NPS Score"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the NPS score details."
							: "Add a new NPS score for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="nps_score">NPS Score (0-10) *</Label>
						<div className="space-y-2">
							<Input
								id="nps_score"
								type="number"
								min="0"
								max="10"
								value={formData.nps_score}
								onChange={(e) =>
									setFormData({
										...formData,
										nps_score: Number.parseInt(e.target.value) || 0,
									})
								}
								required
							/>
							<p
								className={`font-medium text-sm ${getNPSColor(formData.nps_score)}`}
							>
								{getNPSLabel(formData.nps_score)}
							</p>
						</div>
					</div>

					<div>
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							placeholder="Additional notes about this NPS score..."
							value={formData.notes}
							onChange={(e) =>
								setFormData({ ...formData, notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div>
						<Label htmlFor="recorded_date">Recorded Date</Label>
						<Input
							id="recorded_date"
							type="date"
							value={formData.recorded_date}
							onChange={(e) =>
								setFormData({ ...formData, recorded_date: e.target.value })
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
									? "Update NPS Score"
									: "Add NPS Score"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
