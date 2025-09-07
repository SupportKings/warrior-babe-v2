import { useState } from "react";

import { cn } from "@/lib/utils";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { getAllCoaches } from "@/features/coaches/actions/getCoaches";

// We'll need to get available coaches for premier coach selection
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Edit3, Save, Users, X } from "lucide-react";

interface CoachTeamBasicInfoProps {
	coachTeam: {
		team_name: string | null;
		premier_coach_id: string | null;
		premier_coach?: {
			id: string;
			name: string | null;
		} | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function CoachTeamBasicInfo({
	coachTeam,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: CoachTeamBasicInfoProps) {
	const [formData, setFormData] = useState({
		teamName: coachTeam.team_name || "",
		premierCoachId: coachTeam.premier_coach_id || "",
	});
	const [comboboxOpen, setComboboxOpen] = useState(false);

	// Fetch available coaches for premier coach selection
	const { data: coaches = [] } = useQuery({
		queryKey: ["coaches", "all"],
		queryFn: getAllCoaches,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			teamName: coachTeam.team_name || "",
			premierCoachId: coachTeam.premier_coach_id || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Basic Information
					</div>
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
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<Label className="font-medium text-muted-foreground text-sm">
						Team Name
					</Label>
					{isEditing ? (
						<Input
							value={formData.teamName}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, teamName: e.target.value }))
							}
							className="mt-1 h-10"
							placeholder="Enter team name"
						/>
					) : (
						<p className="text-sm">{coachTeam.team_name || "Not provided"}</p>
					)}
				</div>
				<div>
					<Label className="font-medium text-muted-foreground text-sm">
						Premier Coach
					</Label>
					{isEditing ? (
						<Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={comboboxOpen}
									className="mt-1 h-10 w-full justify-between font-normal"
								>
									{formData.premierCoachId
										? coaches.find(
												(coach: any) => coach.id === formData.premierCoachId,
											)?.name || "Unknown Coach"
										: "Select premier coach..."}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
								<Command>
									<CommandInput placeholder="Search coaches..." />
									<CommandList>
										<CommandEmpty>No coach found.</CommandEmpty>
										<CommandGroup>
											{coaches.map((coach: any) => (
												<CommandItem
													key={coach.id}
													value={coach.name || "Unnamed Coach"}
													onSelect={() => {
														setFormData((prev) => ({
															...prev,
															premierCoachId:
																coach.id === formData.premierCoachId
																	? ""
																	: coach.id,
														}));
														setComboboxOpen(false);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															formData.premierCoachId === coach.id
																? "opacity-100"
																: "opacity-0",
														)}
													/>
													{coach.name || "Unnamed Coach"}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					) : (
						<p className="text-sm">
							{coachTeam.premier_coach?.name || "No Premier Coach"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
