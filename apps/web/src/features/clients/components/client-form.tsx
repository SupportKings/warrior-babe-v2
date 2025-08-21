"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Textarea } from "@/components/ui/textarea";

import { createClientAction } from "@/features/clients/actions/createClient";
import { updateClientAction } from "@/features/clients/actions/updateClient";
import { useActiveProducts } from "@/features/clients/queries/useClients";
import {
	CLIENT_STATUS_OPTIONS,
	type ClientEditFormInput,
	type ClientFormInput,
	clientEditFormSchema,
	clientFormSchema,
	getAllValidationErrors,
	getFieldValidator,
	PLATFORM_ACCESS_STATUS_OPTIONS,
	validateSingleField,
	validationUtils,
} from "@/features/clients/types/client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface ClientFormProps {
	mode: "create" | "edit";
	initialData?: ClientEditFormInput;
	onSuccess?: () => void;
}

// Using enhanced validation utilities from types/client.ts

export default function ClientForm({
	mode,
	initialData,
	onSuccess,
}: ClientFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: products = [] } = useActiveProducts();

	const isEditMode = mode === "edit";
	const schema = isEditMode ? clientEditFormSchema : clientFormSchema;

	const form = useForm({
		defaultValues:
			isEditMode && initialData
				? {
						id: initialData.id,
						first_name: initialData.first_name || "",
						last_name: initialData.last_name || "",
						email: initialData.email || "",
						phone: initialData.phone || "",
						start_date: initialData.start_date?.split("T")[0] || "",
						end_date: initialData.end_date?.split("T")[0] || "",
						renewal_date: initialData.renewal_date?.split("T")[0] || "",
						product_id: initialData.product_id || "none",
						status: initialData.status || "active",
						platform_access_status:
							initialData.platform_access_status || "pending",
						platform_link: initialData.platform_link || "",
						consultation_form_completed:
							initialData.consultation_form_completed || false,
						vip_terms_signed: initialData.vip_terms_signed || false,
						onboarding_notes: initialData.onboarding_notes || "",
						churned_at: initialData.churned_at?.split("T")[0] || "",
						paused_at: initialData.paused_at?.split("T")[0] || "",
						offboard_date: initialData.offboard_date?.split("T")[0] || "",
					}
				: {
						first_name: "",
						last_name: "",
						email: "",
						phone: "",
						start_date: new Date().toISOString().split("T")[0],
						end_date: "",
						renewal_date: "",
						product_id: "none",
						status: "active",
						platform_access_status: "pending",
						platform_link: "",
						consultation_form_completed: false,
						vip_terms_signed: false,
						onboarding_notes: "",
					},
		onSubmit: async ({ value }) => {
			console.log("Form onSubmit triggered - value:", value);
			setIsLoading(true);

			try {
				let result;

				// Convert "none" product_id back to empty string for the API
				const submissionValue = {
					...value,
					product_id: value.product_id === "none" ? "" : value.product_id,
				};

				if (isEditMode) {
					result = await updateClientAction(
						submissionValue as ClientEditFormInput,
					);
				} else {
					result = await createClientAction(submissionValue as ClientFormInput);
				}

				if (result?.data?.success) {
					toast.success(
						isEditMode
							? "Client updated successfully!"
							: "Client created successfully!",
					);

					// Invalidate queries
					queryClient.invalidateQueries({ queryKey: ["clients"] });
					if (isEditMode && initialData?.id) {
						queryClient.invalidateQueries({
							queryKey: ["client", initialData.id],
						});
					}

					if (onSuccess) {
						onSuccess();
					} else {
						router.back();
					}
				} else if (result?.validationErrors) {
					// Handle validation errors - show exact error messages
					const allErrors = getAllValidationErrors(result.validationErrors);
					if (allErrors.length > 0) {
						// Show the first error in toast, or combine multiple if they're short
						if (allErrors.length === 1) {
							toast.error(allErrors[0]);
						} else if (allErrors.join(", ").length < 100) {
							toast.error(allErrors.join(", "));
						} else {
							toast.error(`${allErrors[0]} (+${allErrors.length - 1} more errors)`);
						}
					} else {
						toast.error("Please check your input and try again.");
					}
				}
			} catch (error) {
				console.error("Form submission error:", error);
				toast.error("An unexpected error occurred. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		// validators: {
		// 	onSubmit: async ({ value }) => {
		// 		console.log("Form validation - value:", value);
		// 		const validation = schema.safeParse(value);
		// 		console.log("Form validation - result:", validation);
		// 		if (!validation.success) {
		// 			const errors: Record<string, string> = {};
		// 			validation.error.issues.forEach((issue: any) => {
		// 				if (issue.path[0]) {
		// 					errors[issue.path[0] as string] = issue.message;
		// 				}
		// 			});
		// 			console.log("Form validation - errors:", errors);
		// 			return errors;
		// 		}
		// 		return undefined;
		// 	},
		// },
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				void form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Basic Information */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Basic Information</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field
						name="first_name"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(value, validationUtils.name),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>First Name *</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter first name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="last_name"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(
									value,
									z.string().min(2, "Last name must be at least 2 characters"),
								),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Last Name *</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter last name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								if (value && value.length > 5) {
									return validateSingleField(value, validationUtils.email);
								}
								return undefined;
							},
							onBlur: ({ value }) =>
								validateSingleField(value, validationUtils.email),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email *</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="Enter email address"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									required
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field name="phone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Phone</Label>
								<Input
									id={field.name}
									name={field.name}
									type="tel"
									placeholder="Enter phone number"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Status & Dates */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Status & Dates</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="status">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Status</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{CLIENT_STATUS_OPTIONS.map((status) => (
											<SelectItem key={status.value} value={status.value}>
												{status.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="start_date"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(
									value,
									z.string().min(1, "Start date is required"),
								),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Start Date *</Label>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select start date"
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="end_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>End Date</Label>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select end date"
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field name="renewal_date">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Renewal Date</Label>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select renewal date"
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Product Selection */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Product & Assignment</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="product_id">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Product</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select product (optional)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">No product assigned</SelectItem>
										{products.map((product) => (
											<SelectItem key={product.id} value={product.id}>
												{product.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Platform Access */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Platform Access</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="platform_access_status">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Platform Access Status</Label>
								<Select
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select access status" />
									</SelectTrigger>
									<SelectContent>
										{PLATFORM_ACCESS_STATUS_OPTIONS.map((status) => (
											<SelectItem key={status.value} value={status.value}>
												{status.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="platform_link"
						validators={{
							onBlur: ({ value }) => {
								if (value && value.trim() !== "") {
									return validateSingleField(
										value,
										z.string().url({ message: "Invalid URL" }),
									);
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Platform Link</Label>
								<Input
									id={field.name}
									name={field.name}
									type="url"
									placeholder="https://..."
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0] || "")}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Onboarding & Preferences */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Onboarding & Preferences</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="consultation_form_completed">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
								/>
								<Label htmlFor={field.name}>Consultation Form Completed</Label>
							</div>
						)}
					</form.Field>

					<form.Field name="vip_terms_signed">
						{(field) => (
							<div className="flex items-center space-x-2">
								<Switch
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) => field.handleChange(checked)}
								/>
								<Label htmlFor={field.name}>VIP Terms Signed</Label>
							</div>
						)}
					</form.Field>
				</div>

				<form.Field name="onboarding_notes">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Onboarding Notes</Label>
							<Textarea
								id={field.name}
								name={field.name}
								placeholder="Enter onboarding notes..."
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								rows={4}
							/>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0] || "")}
									</p>
								)}
						</div>
					)}
				</form.Field>
			</div>

			{/* Additional Dates (Edit Mode Only) */}
			{isEditMode && (
				<div className="space-y-4">
					<h3 className="font-medium text-lg">Additional Dates</h3>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<form.Field name="churned_at">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Churned Date</Label>
									<DatePicker
										id={field.name}
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										placeholder="Select churned date"
									/>
									{field.state.meta.errors &&
										field.state.meta.errors.length > 0 && (
											<p className="text-red-500 text-sm">
												{String(field.state.meta.errors[0] || "")}
											</p>
										)}
								</div>
							)}
						</form.Field>

						<form.Field name="paused_at">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Paused Date</Label>
									<DatePicker
										id={field.name}
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										placeholder="Select paused date"
									/>
									{field.state.meta.errors &&
										field.state.meta.errors.length > 0 && (
											<p className="text-red-500 text-sm">
												{String(field.state.meta.errors[0] || "")}
											</p>
										)}
								</div>
							)}
						</form.Field>

						<form.Field name="offboard_date">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Offboard Date</Label>
									<DatePicker
										id={field.name}
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										placeholder="Select offboard date"
									/>
									{field.state.meta.errors &&
										field.state.meta.errors.length > 0 && (
											<p className="text-red-500 text-sm">
												{String(field.state.meta.errors[0] || "")}
											</p>
										)}
								</div>
							)}
						</form.Field>
					</div>
				</div>
			)}

			{/* Form Actions */}
			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							disabled={state.isSubmitting || isLoading}
							onClick={() => console.log("Button clicked!")}
						>
							{(state.isSubmitting || isLoading) && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{isEditMode ? "Update Client" : "Create Client"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
