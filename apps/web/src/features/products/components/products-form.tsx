"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { createProductAction } from "@/features/products/actions/createProduct";
import {
	getAllValidationErrors,
	type ProductFormRawInput,
	validateSingleField,
	validationUtils,
} from "@/features/products/types/products";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProductsFormProps {
	mode: "create";
	onSuccess?: () => void;
}

export default function ProductsForm({ onSuccess }: ProductsFormProps) {
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			default_duration_months: "0",
			client_unit: "0",
			is_active: true,
			payment_plan_templates: [] as Array<{
				name: string;
				program_length_months: string;
				slots: Array<{
					amount_due: string;
					months_to_delay: string;
				}>;
			}>,
		},
		onSubmit: async ({ value }) => {
			console.log("Form onSubmit triggered - value:", value);
			setIsLoading(true);

			try {
				const result = await createProductAction(value);

				if (result?.data?.success) {
					toast.success("Product created successfully!");

					// Invalidate queries
					queryClient.invalidateQueries({ queryKey: ["products"] });

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
						const errorMessage =
							allErrors.length === 1
								? allErrors[0]
								: `${allErrors.length} validation errors occurred`;
						toast.error(errorMessage);
					} else {
						toast.error("Please check the form for errors");
					}
				} else {
					toast.error("Failed to create product. Please try again.");
				}
			} catch (error) {
				console.error("Form submission error:", error);
				toast.error("An unexpected error occurred. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-8"
		>
			{/* Basic Information Section */}
			<div className="space-y-6">
				<div>
					<h3 className="mb-4 font-medium text-base text-foreground">
						Basic Information
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Name */}
						<form.Field
							name="name"
							validators={{
								onBlur: ({ value }) =>
									validateSingleField(value, validationUtils.name),
								onChange: ({ value }) =>
									value.length > 100
										? "Name must be less than 100 characters"
										: undefined,
							}}
						>
							{(field) => (
								<div>
									<Label htmlFor={field.name} className="font-medium text-sm">
										Product Name *
									</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter product name"
										className={
											field.state.meta.errors.length > 0
												? "border-destructive"
												: ""
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-1 text-destructive text-xs">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						{/* Description */}
						<div className="md:col-span-2">
							<form.Field
								name="description"
								validators={{
									onBlur: ({ value }) =>
										validateSingleField(value, validationUtils.description),
								}}
							>
								{(field) => (
									<div>
										<Label htmlFor={field.name} className="font-medium text-sm">
											Description
										</Label>
										<Textarea
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Enter product description (optional)"
											rows={3}
											className={
												field.state.meta.errors.length > 0
													? "border-destructive"
													: ""
											}
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="mt-1 text-destructive text-xs">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</div>
					</div>
				</div>
			</div>

			{/* Product Configuration Section */}
			<div className="space-y-6">
				<div>
					<h3 className="mb-4 font-medium text-base text-foreground">
						Configuration
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Default Duration */}
						<form.Field
							name="default_duration_months"
							validators={{
								onBlur: ({ value }) => {
									const num = Number.parseInt(value, 10);
									if (isNaN(num)) return "Must be a valid number";
									if (num < 0) return "Duration cannot be negative";
									if (num > 60) return "Duration cannot exceed 60 months";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div>
									<Label htmlFor={field.name} className="font-medium text-sm">
										Default Duration (months)
									</Label>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										min="0"
										max="60"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="0"
										className={
											field.state.meta.errors.length > 0
												? "border-destructive"
												: ""
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-1 text-destructive text-xs">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						{/* Client Unit */}
						<form.Field
							name="client_unit"
							validators={{
								onBlur: ({ value }) => {
									const num = Number.parseInt(value, 10);
									if (isNaN(num)) return "Must be a valid number";
									if (num < 0) return "Client unit cannot be negative";
									if (num > 1000) return "Client unit cannot exceed 1000";
									return undefined;
								},
							}}
						>
							{(field) => (
								<div>
									<Label htmlFor={field.name} className="font-medium text-sm">
										Client Unit
									</Label>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										min="0"
										max="1000"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="0"
										className={
											field.state.meta.errors.length > 0
												? "border-destructive"
												: ""
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="mt-1 text-destructive text-xs">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</div>
				</div>
			</div>

			{/* Status Section */}
			<div className="space-y-6">
				<div>
					<h3 className="mb-4 font-medium text-base text-foreground">Status</h3>
					<div className="grid grid-cols-1 gap-4">
						{/* Active Status */}
						<form.Field name="is_active">
							{(field) => (
								<div className="flex items-center justify-between">
									<div>
										<Label htmlFor={field.name} className="font-medium text-sm">
											Active Status
										</Label>
										<p className="mt-1 text-muted-foreground text-xs">
											Inactive products won't be available for selection
										</p>
									</div>
									<Switch
										id={field.name}
										checked={field.state.value}
										onCheckedChange={(checked) => field.handleChange(checked)}
									/>
								</div>
							)}
						</form.Field>
					</div>
				</div>
			</div>

			{/* Payment Plan Templates Section */}
			<div className="space-y-6">
				<div>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-medium text-base text-foreground">
							Payment Plan Templates
						</h3>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								form.setFieldValue("payment_plan_templates", [
									...form.getFieldValue("payment_plan_templates"),
									{
										name: "",
										program_length_months: "1",
										slots: [{ amount_due: "", months_to_delay: "0" }],
									},
								]);
							}}
						>
							<Plus className="mr-2 h-4 w-4" />
							Add Template
						</Button>
					</div>

					<form.Field name="payment_plan_templates">
						{(field) => (
							<div className="space-y-6">
								{field.state.value.map((template, templateIndex) => (
									<div
										key={templateIndex}
										className="space-y-4 rounded-lg border p-4"
									>
										<div className="flex items-center justify-between">
											<h4 className="font-medium text-sm">
												Template {templateIndex + 1}
											</h4>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => {
													const newTemplates = field.state.value.filter(
														(_, index) => index !== templateIndex,
													);
													field.handleChange(newTemplates);
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											{/* Template Name */}
											<form.Field
												name={`payment_plan_templates[${templateIndex}].name`}
											>
												{(templateNameField) => (
													<div>
														<Label
															htmlFor={templateNameField.name}
															className="font-medium text-sm"
														>
															Template Name *
														</Label>
														<Input
															id={templateNameField.name}
															name={templateNameField.name}
															value={templateNameField.state.value}
															onChange={(e) =>
																templateNameField.handleChange(e.target.value)
															}
															placeholder="Enter template name"
														/>
														{templateNameField.state.meta.errors.length > 0 && (
															<p className="mt-1 text-destructive text-xs">
																{templateNameField.state.meta.errors[0]}
															</p>
														)}
													</div>
												)}
											</form.Field>

											{/* Program Length */}
											<form.Field
												name={`payment_plan_templates[${templateIndex}].program_length_months`}
											>
												{(programLengthField) => (
													<div>
														<Label
															htmlFor={programLengthField.name}
															className="font-medium text-sm"
														>
															Program Length (months)
														</Label>
														<Input
															id={programLengthField.name}
															name={programLengthField.name}
															type="number"
															min="1"
															max="60"
															value={programLengthField.state.value}
															onChange={(e) =>
																programLengthField.handleChange(e.target.value)
															}
															placeholder="1"
														/>
														{programLengthField.state.meta.errors.length >
															0 && (
															<p className="mt-1 text-destructive text-xs">
																{programLengthField.state.meta.errors[0]}
															</p>
														)}
													</div>
												)}
											</form.Field>
										</div>

										{/* Payment Slots */}
										<div>
											<div className="mb-3 flex items-center justify-between">
												<Label className="font-medium text-sm">
													Payment Slots
												</Label>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => {
														const currentTemplate =
															field.state.value[templateIndex];
														const newSlots = [
															...currentTemplate.slots,
															{ amount_due: "", months_to_delay: "0" },
														];
														const newTemplates = [...field.state.value];
														newTemplates[templateIndex] = {
															...currentTemplate,
															slots: newSlots,
														};
														field.handleChange(newTemplates);
													}}
												>
													<Plus className="mr-2 h-3 w-3" />
													Add Slot
												</Button>
											</div>

											<div className="space-y-3">
												{template.slots.map((slot, slotIndex) => (
													<div
														key={slotIndex}
														className="flex items-center gap-3 rounded-md bg-muted p-3"
													>
														<div className="flex-1">
															<form.Field
																name={`payment_plan_templates[${templateIndex}].slots[${slotIndex}].amount_due`}
															>
																{(amountField) => (
																	<div>
																		<Label
																			htmlFor={amountField.name}
																			className="font-medium text-xs"
																		>
																			Amount Due ($)
																		</Label>
																		<Input
																			id={amountField.name}
																			name={amountField.name}
																			type="number"
																			step="0.01"
																			min="0"
																			value={amountField.state.value}
																			onChange={(e) =>
																				amountField.handleChange(e.target.value)
																			}
																			placeholder="0.00"
																		/>
																		{amountField.state.meta.errors.length >
																			0 && (
																			<p className="mt-1 text-destructive text-xs">
																				{amountField.state.meta.errors[0]}
																			</p>
																		)}
																	</div>
																)}
															</form.Field>
														</div>

														<div className="flex-1">
															<form.Field
																name={`payment_plan_templates[${templateIndex}].slots[${slotIndex}].months_to_delay`}
															>
																{(delayField) => (
																	<div>
																		<Label
																			htmlFor={delayField.name}
																			className="font-medium text-xs"
																		>
																			Months to Delay
																		</Label>
																		<Input
																			id={delayField.name}
																			name={delayField.name}
																			type="number"
																			min="0"
																			max="59"
																			value={delayField.state.value}
																			onChange={(e) =>
																				delayField.handleChange(e.target.value)
																			}
																			placeholder="0"
																		/>
																		{delayField.state.meta.errors.length >
																			0 && (
																			<p className="mt-1 text-destructive text-xs">
																				{delayField.state.meta.errors[0]}
																			</p>
																		)}
																	</div>
																)}
															</form.Field>
														</div>

														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => {
																const currentTemplate =
																	field.state.value[templateIndex];
																const newSlots = currentTemplate.slots.filter(
																	(_, index) => index !== slotIndex,
																);
																const newTemplates = [...field.state.value];
																newTemplates[templateIndex] = {
																	...currentTemplate,
																	slots: newSlots,
																};
																field.handleChange(newTemplates);
															}}
															disabled={template.slots.length === 1}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												))}
											</div>
										</div>
									</div>
								))}

								{field.state.value.length === 0 && (
									<div className="rounded-lg border-2 border-muted-foreground/25 border-dashed py-8 text-center">
										<p className="text-muted-foreground text-sm">
											No payment plan templates added yet.
										</p>
										<p className="mt-1 text-muted-foreground text-xs">
											Click "Add Template" to create your first payment plan
											template.
										</p>
									</div>
								)}
							</div>
						)}
					</form.Field>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end gap-4 border-t pt-6">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Create Product
				</Button>
			</div>
		</form>
	);
}
