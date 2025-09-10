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
	createClientEmail,
	updateClientEmail,
} from "@/features/clients/actions/relations/client-emails";
import { clientQueries } from "@/features/clients/queries/useClients";

import { useQueryClient } from "@tanstack/react-query";
import { Edit, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManageEmailModalProps {
	clientId: string;
	mode: "add" | "edit";
	email?: any;
	children?: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function ManageEmailModal({
	clientId,
	mode,
	email,
	children,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}: ManageEmailModalProps) {
	const isEdit = mode === "edit";
	const [internalOpen, setInternalOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const open = externalOpen !== undefined ? externalOpen : internalOpen;
	const setOpen = externalOnOpenChange || setInternalOpen;
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		email: "",
	});

	// Email validation pattern
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && email) {
			setFormData({
				email: email.email || "",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				email: "",
			});
		}
	}, [isEdit, email, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate email
		if (!formData.email.trim()) {
			toast.error("Email address is required");
			return;
		}

		if (!emailPattern.test(formData.email.trim())) {
			toast.error("Please enter a valid email address");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && email) {
				await updateClientEmail(email.id, formData);
				toast.success("Email updated successfully!");
			} else {
				await createClientEmail(clientId, formData);
				toast.success("Email added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} email:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} email`);
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
							{isEdit ? "Edit Email" : "Add Email"}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						{isEdit ? "Edit Email Address" : "Add New Email Address"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the email address details."
							: "Add a new email address for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="email">Email Address *</Label>
						<Input
							id="email"
							type="email"
							placeholder="client@example.com"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							required
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
									? "Update Email"
									: "Add Email"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}