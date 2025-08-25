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

import { addClientPaymentPlan } from "@/features/clients/actions/addClientRelations";
import { updateClientPaymentPlan } from "@/features/clients/actions/updateClientRelations";
import { clientQueries } from "@/features/clients/queries/useClients";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, DollarSign, Edit, Plus } from "lucide-react";
import { toast } from "sonner";

interface ManagePaymentPlanModalProps {
	clientId: string;
	mode: "add" | "edit";
	paymentPlan?: any;
	children?: ReactNode;
}

export function ManagePaymentPlanModal({
	clientId,
	mode,
	paymentPlan,
	children,
}: ManagePaymentPlanModalProps) {
	const isEdit = mode === "edit";
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState({
		name: "",
		notes: "",
		platform: "",
		product_id: "",
		subscription_id: "",
		term_start_date: format(new Date(), "yyyy-MM-dd"),
		term_end_date: "",
		total_amount: 0,
		total_amount_paid: 0,
		type: "PIF" as "PIF" | "2-Pay" | "Split Pay" | "4-Pay" | "CUSTOM",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && paymentPlan) {
			setFormData({
				name: paymentPlan.name || "",
				notes: paymentPlan.notes || "",
				platform: paymentPlan.platform || "",
				product_id: paymentPlan.product_id || "",
				subscription_id: paymentPlan.subscription_id || "",
				term_start_date: paymentPlan.term_start_date
					? format(new Date(paymentPlan.term_start_date), "yyyy-MM-dd")
					: format(new Date(), "yyyy-MM-dd"),
				term_end_date: paymentPlan.term_end_date
					? format(new Date(paymentPlan.term_end_date), "yyyy-MM-dd")
					: "",
				total_amount: paymentPlan.total_amount || 0,
				total_amount_paid: paymentPlan.total_amount_paid || 0,
				type: paymentPlan.type || "PIF",
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				name: "",
				notes: "",
				platform: "",
				product_id: "",
				subscription_id: "",
				term_start_date: format(new Date(), "yyyy-MM-dd"),
				term_end_date: "",
				total_amount: 0,
				total_amount_paid: 0,
				type: "PIF",
			});
		}
	}, [isEdit, paymentPlan, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Name is required");
			return;
		}

		if (!formData.term_end_date) {
			toast.error("Term end date is required");
			return;
		}

		setIsLoading(true);

		try {
			if (isEdit && paymentPlan) {
				await updateClientPaymentPlan(clientId, {
					...formData,
					id: paymentPlan.id,
				});
				toast.success("Payment plan updated successfully!");
			} else {
				await addClientPaymentPlan(clientId, formData);
				toast.success("Payment plan added successfully!");
			}

			// Invalidate the client query to refresh the data
			await queryClient.invalidateQueries({
				queryKey: clientQueries.detail(clientId),
			});

			setOpen(false);
		} catch (error) {
			console.error(
				`Error ${isEdit ? "updating" : "adding"} payment plan:`,
				error,
			);
			toast.error(`Failed to ${isEdit ? "update" : "add"} payment plan`);
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
						{isEdit ? "Edit Payment Plan" : "Add Payment Plan"}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						{isEdit ? "Edit Payment Plan" : "Add New Payment Plan"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the payment plan details."
							: "Add a new payment plan for this client."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">Plan Name *</Label>
						<Input
							id="name"
							placeholder="Payment plan name..."
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="type">Type</Label>
							<Select
								value={formData.type}
								onValueChange={(value: any) =>
									setFormData({ ...formData, type: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="PIF">PIF (Paid in Full)</SelectItem>
									<SelectItem value="2-Pay">2-Pay</SelectItem>
									<SelectItem value="Split Pay">Split Pay</SelectItem>
									<SelectItem value="4-Pay">4-Pay</SelectItem>
									<SelectItem value="CUSTOM">Custom</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="platform">Platform</Label>
							<Input
								id="platform"
								placeholder="e.g., Stripe, PayPal"
								value={formData.platform}
								onChange={(e) =>
									setFormData({ ...formData, platform: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="product_id">Product ID</Label>
							<Input
								id="product_id"
								placeholder="Product identifier"
								value={formData.product_id}
								onChange={(e) =>
									setFormData({ ...formData, product_id: e.target.value })
								}
							/>
						</div>

						<div>
							<Label htmlFor="subscription_id">Subscription ID</Label>
							<Input
								id="subscription_id"
								placeholder="Subscription identifier"
								value={formData.subscription_id}
								onChange={(e) =>
									setFormData({ ...formData, subscription_id: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="term_start_date">Term Start Date *</Label>
							<Input
								id="term_start_date"
								type="date"
								value={formData.term_start_date}
								onChange={(e) =>
									setFormData({ ...formData, term_start_date: e.target.value })
								}
								required
							/>
						</div>

						<div>
							<Label htmlFor="term_end_date">Term End Date *</Label>
							<Input
								id="term_end_date"
								type="date"
								value={formData.term_end_date}
								onChange={(e) =>
									setFormData({ ...formData, term_end_date: e.target.value })
								}
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="total_amount">Total Amount</Label>
							<div className="relative">
								<DollarSign className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="total_amount"
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									value={formData.total_amount}
									onChange={(e) =>
										setFormData({
											...formData,
											total_amount: Number.parseFloat(e.target.value) || 0,
										})
									}
									className="pl-10"
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="total_amount_paid">Total Amount Paid</Label>
							<div className="relative">
								<DollarSign className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="total_amount_paid"
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									value={formData.total_amount_paid}
									onChange={(e) =>
										setFormData({
											...formData,
											total_amount_paid: Number.parseFloat(e.target.value) || 0,
										})
									}
									className="pl-10"
								/>
							</div>
						</div>
					</div>

					<div>
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							placeholder="Payment plan notes..."
							value={formData.notes}
							onChange={(e) =>
								setFormData({ ...formData, notes: e.target.value })
							}
							rows={3}
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
									? "Update Payment Plan"
									: "Add Payment Plan"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
