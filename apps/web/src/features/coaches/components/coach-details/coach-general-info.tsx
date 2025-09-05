"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { format } from "date-fns";
import { Check, ChevronsUpDown, Edit3, Save, User, X } from "lucide-react";
import { CONTRACT_TYPES } from "../../constants";
import { useRoles } from "../../queries/useRoles";
import { useTeamLeaders } from "../../queries/useTeamLeaders";
import { getContractTypeBadgeClass } from "../../utils";

interface CoachGeneralInfoProps {
	coach: any; // You can define a proper type for coach
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function CoachGeneralInfo({
	coach,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: CoachGeneralInfoProps) {
	const [formData, setFormData] = useState<{
		name: string;
		email: string;
		contract_type: string;
		onboarding_date: string;
		team_id: string | null;
	}>({
		name: coach.name || "",
		email: coach.user?.email || "",
		contract_type: coach.contract_type || "",
		onboarding_date: coach.onboarding_date || "",
		team_id: coach.team_id || null,
	});

	// Parse existing roles from the user's role field
	const initialRoles = coach.user?.role
		? coach.user.role.split(",").map((r: string) => r.trim())
		: [];
	const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
	const [teamSearchOpen, setTeamSearchOpen] = useState(false);
	const [rolesSearchOpen, setRolesSearchOpen] = useState(false);

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

	// Reset form data when coach changes
	useEffect(() => {
		setFormData({
			name: coach.name || "",
			email: coach.user?.email || "",
			contract_type: coach.contract_type || "",
			onboarding_date: coach.onboarding_date || "",
			team_id: coach.team_id || null,
		});
		setSelectedRoles(
			coach.user?.role
				? coach.user.role.split(",").map((r: string) => r.trim())
				: [],
		);
	}, [coach]);

	const getInitials = (name: string | null) => {
		if (!name) return "TM";
		return name
			.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase();
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "Not set";
		try {
			return format(new Date(dateString), "MMM dd, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	const handleSave = () => {
		const dataToSave = {
			...formData,
			roles: selectedRoles.join(", "),
		};
		onSave?.(dataToSave);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			name: coach.name || "",
			email: coach.user?.email || "",
			contract_type: coach.contract_type || "",
			onboarding_date: coach.onboarding_date || "",
			team_id: coach.team_id || null,
		});
		setSelectedRoles(
			coach.user?.role
				? coach.user.role.split(",").map((r: string) => r.trim())
				: [],
		);
		onCancel?.();
	};

	return (
		<div className="space-y-6">
			{/* Avatar and Name Header */}
			<div className="flex items-center gap-4">
				<Avatar className="h-20 w-20">
					{coach.user?.image ? (
						<AvatarImage src={coach.user.image} alt={coach.name ?? ""} />
					) : (
						<AvatarFallback className="bg-primary/10 font-semibold text-xl">
							{getInitials(coach.name)}
						</AvatarFallback>
					)}
				</Avatar>
				<div>
					<h1 className="font-bold text-3xl">{coach.name || "Unknown"}</h1>
					<p className="text-lg text-muted-foreground">
						{coach.user?.email || "No email"}
					</p>
				</div>
			</div>

			{/* Information Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Coach Information
						</CardTitle>
						{!isEditing ? (
							<Button
								variant="ghost"
								size="sm"
								onClick={onEditToggle}
								className="h-8 w-8 p-0"
							>
								<Edit3 className="h-4 w-4" />
							</Button>
						) : (
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleSave}
									className="h-8 w-8 p-0"
								>
									<Save className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCancel}
									className="h-8 w-8 p-0"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Name */}
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Full Name
						</label>
						{isEditing ? (
							<Input
								value={formData.name}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, name: e.target.value }))
								}
								placeholder="Enter full name"
								className="mt-1 h-10"
							/>
						) : (
							<p className="text-sm">{coach.name || "Not provided"}</p>
						)}
					</div>

					{/* Email */}
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Email
						</label>
						{isEditing ? (
							<Input
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, email: e.target.value }))
								}
								placeholder="Enter email address"
								className="mt-1 h-10"
							/>
						) : (
							<p className="text-sm">{coach.user?.email || "Not provided"}</p>
						)}
					</div>

					{/* Onboarding Date */}
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Onboarding Date
						</label>
						{isEditing ? (
							<DatePicker
								value={formData.onboarding_date || ""}
								onChange={(value) =>
									setFormData((prev) => ({ ...prev, onboarding_date: value }))
								}
								placeholder="Select onboarding date"
								className="mt-1 h-10"
							/>
						) : (
							<p className="text-sm">{formatDate(coach.onboarding_date)}</p>
						)}
					</div>

					{/* Contract Type */}
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Contract Type
						</label>
						{isEditing ? (
							<Select
								value={formData.contract_type}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, contract_type: value }))
								}
							>
								<SelectTrigger className="mt-1 h-10">
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
						) : (
							<div className="text-sm">
								<span
									className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-semibold text-xs ${getContractTypeBadgeClass(
										coach.contract_type,
									)}`}
								>
									{coach.contract_type || "Not set"}
								</span>
							</div>
						)}
					</div>

					{/* Roles */}
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Roles
						</label>
						{isEditing ? (
							<Popover open={rolesSearchOpen} onOpenChange={setRolesSearchOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={rolesSearchOpen}
										className="mt-1 h-10 w-full justify-between font-normal"
										disabled={rolesLoading}
									>
										{selectedRoles.length > 0 ? (
											<span className="truncate">
												{selectedRoles
													.map((roleName) => {
														const role = roles.find(
															(r: any) => r.name === roleName,
														);
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
										<CommandInput
											placeholder="Search roles..."
											className="h-9"
										/>
										<CommandList>
											<CommandEmpty>No role found.</CommandEmpty>
											<CommandGroup>
												{roles.map((role: any) => (
													<CommandItem
														key={role.id}
														value={role.name}
														onSelect={() => toggleRole(role.name)}
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
						) : (
							<div className="flex flex-wrap gap-1 text-sm">
								{selectedRoles.length === 0 ? (
									<span className="text-muted-foreground">No roles</span>
								) : (
									selectedRoles.map((role: string, index: number) => (
										<span
											key={index}
											className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground text-xs capitalize"
										>
											{role.split("_").join(" ")}
										</span>
									))
								)}
							</div>
						)}
					</div>

					{/* Team Assignment */}
					<div>
						<label className="font-medium text-muted-foreground text-sm">
							Team Assignment / Premier Coach
						</label>
						{isEditing ? (
							<Popover open={teamSearchOpen} onOpenChange={setTeamSearchOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={teamSearchOpen}
										className="mt-1 h-10 w-full justify-between font-normal"
										disabled={teamLeadersLoading}
									>
										{formData.team_id
											? teamLeaders.find(
													(leader: any) => leader.id === formData.team_id,
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
												{teamLeaders.map((leader: any) => (
													<CommandItem
														key={leader.id}
														value={leader.name}
														onSelect={() => {
															setFormData((prev) => ({
																...prev,
																team_id:
																	leader.id === formData.team_id
																		? null
																		: leader.id,
															}));
															setTeamSearchOpen(false);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																formData.team_id === leader.id
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
						) : (
							<p className="text-sm">
								{coach.team?.premier_coach?.name || "Not assigned"}
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
