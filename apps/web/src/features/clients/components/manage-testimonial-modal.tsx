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
	createClientTestimonial,
	updateClientTestimonial,
} from "@/features/clients/actions/relations/testimonials";
import { clientQueries } from "@/features/clients/queries/useClients";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageTestimonialModalProps {
	clientId: string;
	mode: "add" | "edit";
	testimonial?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageTestimonialModal({
	clientId,
	mode,
	testimonial,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageTestimonialModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<{
		content: string;
		testimonial_type: "written" | "email" | "video";
		testimonial_url: string;
		recorded_date: string;
	}>({
		content: "",
		testimonial_type: "written",
		testimonial_url: "",
		recorded_date: format(new Date(), "yyyy-MM-dd"),
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && testimonial) {
			setFormData({
				content: testimonial.content || "",
				testimonial_type: testimonial.testimonial_type || "written",
				testimonial_url: testimonial.testimonial_url || "",
				recorded_date: testimonial.recorded_date
					? format(new Date(testimonial.recorded_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				content: "",
				testimonial_type: "written",
				testimonial_url: "",
				recorded_date: format(new Date(), "yyyy-MM-dd"),
			});
		}
	}, [isEdit, testimonial, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.content.trim()) {
			toast.error("Content is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && testimonial) {
				await updateClientTestimonial(testimonial.id, formData);
				toast.success("Testimonial updated successfully!");
			} else {
				await createClientTestimonial(clientId, formData);
				toast.success("Testimonial added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} testimonial:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} testimonial`);
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
							{isEdit ? "Edit Testimonial" : "Add Testimonial"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						{isEdit ? "Edit Testimonial" : "Add New Testimonial"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the testimonial details."
							: "Add a new testimonial for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="content">Content *</Label>
						<Textarea
							id="content"
							placeholder="Enter testimonial content..."
							value={formData.content}
							onChange={(e) =>
								setFormData({ ...formData, content: e.target.value })
							}
							rows={4}
							required
						/>
					</div>

					<div>
						<Label htmlFor="testimonial_type">Type</Label>
						<Select
							value={formData.testimonial_type}
							onValueChange={(value) =>
								setFormData({
									...formData,
									testimonial_type: value as "written" | "email" | "video",
								})
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="written">Written</SelectItem>
								<SelectItem value="video">Video</SelectItem>
								<SelectItem value="email">Email</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="testimonial_url">URL (optional)</Label>
						<Input
							id="testimonial_url"
							type="url"
							placeholder="https://..."
							value={formData.testimonial_url}
							onChange={(e) =>
								setFormData({ ...formData, testimonial_url: e.target.value })
							}
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
									? "Update Testimonial"
									: "Add Testimonial"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
