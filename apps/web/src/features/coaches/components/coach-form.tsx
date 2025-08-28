"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { type CreateCoachInput, createCoach } from "../actions/create-coach";
import { CONTRACT_TYPES } from "../constants";
import { useRoles } from "../queries/useRoles";
import { useTeamLeaders } from "../queries/useTeamLeaders";

interface CoachFormProps {
	mode?: "create" | "edit";
	initialData?: CreateCoachInput & { id?: string };
	onSuccess?: () => void;
}

// Validation schema
const validationSchema = {
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	onboarding_date: z.string().min(1, "Onboarding date is required"),
	contract_type: z.string().min(1, "Contract type is required"),
	roles: z.string().min(1, "At least one role is required"),
	team_id: z.string().nullable().optional(),
};

// Validation utilities
const validateSingleField = (value: any, schema: z.ZodSchema) => {
	const result = schema.safeParse(value);
	if (!result.success) {
		return result.error.issues[0]?.message || "Invalid value";
	}
	return undefined;
};

export function CoachForm({
	mode = "create",
	initialData,
	onSuccess,
}: CoachFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isLoading, setIsLoading] = useState(false);
	const [teamSearchOpen, setTeamSearchOpen] = useState(false);
	const [rolesSearchOpen, setRolesSearchOpen] = useState(false);
	const [rolesBlurred, setRolesBlurred] = useState(false);
	const [selectedRoles, setSelectedRoles] = useState<string[]>(
		initialData?.roles ? initialData.roles.split(",").map((r) => r.trim()) : [],
	);

	const isEditMode = mode === "edit";

	// Fetch data from server
	const { data: roles = [], isLoading: rolesLoading } = useRoles();
	const { data: teamLeaders = [], isLoading: teamLeadersLoading } =
		useTeamLeaders();

	const toggleRole = (role: string) => {
		setSelectedRoles((prev) => {
			if (prev.includes(role)) {
				return prev.filter((r) => r !== role);
			}
			return [...prev, role];
		});
	};

	// Initialize form with TanStack Form
	const form = useForm({
		defaultValues: {
			name: initialData?.name || "",
			email: initialData?.email || "",
			onboarding_date: initialData?.onboarding_date || "",
			contract_type: initialData?.contract_type || "",
			roles: initialData?.roles || "",
			team_id: initialData?.team_id || null,
		},
		onSubmit: async ({ value }) => {
			// Validate roles
			if (selectedRoles.length === 0) {
				toast.error("Please select at least one role");
				return;
			}

			setIsLoading(true);

			// Prepare data with selected roles
			const submitData = {
				...value,
				roles: selectedRoles.join(", "),
			};

			try {
				const result = await createCoach(submitData);

				if (result.success) {
					toast.success(
						isEditMode
							? "Team member updated successfully!"
							: "Team member added successfully!",
					);

					// Invalidate queries
					queryClient.invalidateQueries({ queryKey: ["coaches"] });
					if (isEditMode && initialData?.id) {
						queryClient.invalidateQueries({
							queryKey: ["coach", initialData.id],
						});
					}

					if (onSuccess) {
						onSuccess();
					} else {
						router.push("/dashboard/coaches");
					}
				} else {
					toast.error(result.message || "Failed to save team member");
				}
			} catch (error) {
				console.error("Error saving team member:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				);
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
				void form.handleSubmit();
			}}
			className="space-y-6"
			noValidate
		>
			{/* Basic Information */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Basic Information</h3>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* Name Field */}
					<form.Field
						name="name"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(value, validationSchema.name),
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Full Name *</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter full name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									disabled={isLoading}
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

					{/* Email Field */}
					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								if (value && value.length > 5) {
									return validateSingleField(value, validationSchema.email);
								}
								return undefined;
							},
							onBlur: ({ value }) =>
								validateSingleField(value, validationSchema.email),
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
									disabled={isLoading}
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

			{/* Employment Details */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Employment Details</h3>

				<div className="flex flex-row items-center gap-3">
					{/* Onboarding Date Field */}
					<form.Field
						name="onboarding_date"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(value, validationSchema.onboarding_date),
						}}
					>
						{(field) => (
							<div className="w-1/4 space-y-3">
								<Label htmlFor={field.name}>Onboarding Date *</Label>
								<DatePicker
									id={field.name}
									value={field.state.value || ""}
									onChange={(value) => field.handleChange(value)}
									placeholder="Select onboarding date"
									disabled={isLoading}
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

					{/* Contract Type Field */}
					<form.Field
						name="contract_type"
						validators={{
							onBlur: ({ value }) =>
								validateSingleField(value, validationSchema.contract_type),
						}}
					>
						{(field) => (
							<div className="space-y-3">
								<Label htmlFor={field.name}>Contract Type *</Label>
								<Select
									value={field.state.value || ""}
									onValueChange={(value) => field.handleChange(value)}
									disabled={isLoading}
								>
									<SelectTrigger id={field.name} className="m-0 min-w-[200px]">
										<SelectValue placeholder="Select contract type" />
									</SelectTrigger>
									<SelectContent>
										{CONTRACT_TYPES.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												{type.label}
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

			{/* Role & Team Assignment */}
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Role & Team Assignment</h3>

				{/* Roles Multi-Select Combobox */}
				<div className="space-y-2">
					<Label htmlFor="roles">Roles *</Label>
					<Popover
						open={rolesSearchOpen}
						onOpenChange={(open) => {
							setRolesSearchOpen(open);
							if (!open) {
								setRolesBlurred(true);
							}
						}}
					>
						<PopoverTrigger asChild>
							<Button
								id="roles"
								variant="outline"
								role="combobox"
								aria-expanded={rolesSearchOpen}
								className="w-1/2 justify-between font-normal"
								disabled={isLoading || rolesLoading}
							>
								{selectedRoles.length > 0 ? (
									<span className="truncate">
										{selectedRoles
											.map((roleName) => {
												const role = roles.find((r) => r.name === roleName);
												return role?.description || roleName;
											})
											.join(", ")}
									</span>
								) : (
									"Select roles..."
								)}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="p-0"
							align="start"
							style={{ width: "var(--radix-popover-trigger-width)" }}
						>
							<Command>
								<CommandInput placeholder="Search roles..." className="h-9" />
								<CommandList>
									<CommandEmpty>No role found.</CommandEmpty>
									<CommandGroup>
										{roles.map((role) => (
											<CommandItem
												key={role.id}
												value={role.name}
												onSelect={() => {
													toggleRole(role.name);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														selectedRoles.includes(role.name)
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{role.description || role.name}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					{rolesBlurred && selectedRoles.length === 0 && (
						<p className="text-red-500 text-sm">
							At least one role is required
						</p>
					)}
				</div>

				{/* Team Assignment Combobox */}
				<form.Field name="team_id">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Team Assignment *</Label>
							<Popover open={teamSearchOpen} onOpenChange={setTeamSearchOpen}>
								<PopoverTrigger asChild>
									<Button
										id={field.name}
										variant="outline"
										role="combobox"
										aria-expanded={teamSearchOpen}
										className="w-1/2 justify-between font-normal"
										disabled={isLoading || teamLeadersLoading}
									>
										{field.state.value
											? teamLeaders.find(
													(leader) => leader.id === field.state.value,
												)?.name || "Select team..."
											: "Select team..."}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="p-0"
									align="start"
									style={{ width: "var(--radix-popover-trigger-width)" }}
								>
									<Command>
										<CommandInput
											placeholder="Search premier coach or team leader..."
											className="h-9"
										/>
										<CommandList>
											<CommandEmpty>No premier coach found.</CommandEmpty>
											<CommandGroup>
												{teamLeaders.map((leader) => (
													<CommandItem
														key={leader.id}
														value={leader.name}
														onSelect={() => {
															field.handleChange(
																leader.id === field.state.value
																	? null
																	: leader.id,
															);
															setTeamSearchOpen(false);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																field.state.value === leader.id
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														<div className="flex flex-col">
															<span>{leader.name}</span>
															{leader.email && (
																<span className="text-muted-foreground text-xs">
																	{leader.email}
																</span>
															)}
														</div>
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
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

			{/* Form Actions */}
			<div className="flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/dashboard/coaches")}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{isLoading
						? isEditMode
							? "Updating..."
							: "Adding..."
						: isEditMode
							? "Update Team Member"
							: "Add Team Member"}
				</Button>
			</div>
		</form>
	);
}
