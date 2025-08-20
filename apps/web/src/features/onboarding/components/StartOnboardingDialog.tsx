"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStartOnboarding } from "../hooks/useStartOnboarding";
import { RocketIcon, UsersIcon, UserCheckIcon, SearchIcon, ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

interface StartOnboardingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	preselectedClient?: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
		status?: string;
	} | null;
}

async function getClients() {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("clients")
		.select("id, first_name, last_name, email, status")
		.neq("status", "onboarding")
		.order("first_name");
	
	if (error) throw error;
	return data || [];
}

async function getCSTeam() {
	const supabase = createClient();
	const { data, error } = await supabase
		.from("user")
		.select("id, name, email")
		.eq("role", "cs")
		.order("name");
	
	if (error) {
		// If CS role doesn't exist, get all users as fallback
		const { data: allUsers } = await supabase
			.from("user")
			.select("id, name, email")
			.order("name");
		return allUsers || [];
	}
	return data || [];
}

export function StartOnboardingDialog({ open, onOpenChange, preselectedClient }: StartOnboardingDialogProps) {
	const { mutate: startOnboarding, isPending } = useStartOnboarding();
	const [selectedClient, setSelectedClient] = useState<any>(null);
	const [selectedCS, setSelectedCS] = useState<any>(null);
	const [clientSearchOpen, setClientSearchOpen] = useState(false);
	const [csSearchOpen, setCSSearchOpen] = useState(false);
	const [clientSearch, setClientSearch] = useState("");
	const [csSearch, setCSSearch] = useState("");

	// Fetch clients
	const { data: clients = [], isLoading: loadingClients } = useQuery({
		queryKey: ["clients-for-onboarding"],
		queryFn: getClients,
		enabled: open && !preselectedClient,
	});

	// Fetch CS team members
	const { data: csTeam = [], isLoading: loadingCS } = useQuery({
		queryKey: ["cs-team"],
		queryFn: getCSTeam,
		enabled: open,
	});

	useEffect(() => {
		if (preselectedClient) {
			setSelectedClient(preselectedClient);
		}
	}, [preselectedClient]);

	useEffect(() => {
		if (!open) {
			// Reset state when dialog closes
			if (!preselectedClient) {
				setSelectedClient(null);
			}
			setSelectedCS(null);
			setClientSearch("");
			setCSSearch("");
		}
	}, [open, preselectedClient]);

	const handleStartOnboarding = () => {
		if (!selectedClient) return;
		
		// Here you can also pass the selected CS if needed
		startOnboarding(selectedClient.id, {
			onSuccess: () => {
				onOpenChange(false);
				setSelectedClient(null);
				setSelectedCS(null);
			},
		});
	};

	const filteredClients = clients.filter(client => 
		`${client.first_name} ${client.last_name} ${client.email}`
			.toLowerCase()
			.includes(clientSearch.toLowerCase())
	);

	const filteredCS = csTeam.filter(cs => 
		`${cs.name} ${cs.email}`
			.toLowerCase()
			.includes(csSearch.toLowerCase())
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="p-2.5 bg-primary/10 rounded-xl">
							<RocketIcon className="h-5 w-5 text-primary" />
						</div>
						<div className="flex-1">
							<DialogTitle className="text-xl">Start Client Onboarding</DialogTitle>
							<DialogDescription className="text-sm mt-1">
								Select a client and assign a Customer Success manager to begin onboarding
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Client Selection */}
					<div className="space-y-2">
						<Label className="text-sm font-medium flex items-center gap-2">
							<UserCheckIcon className="h-4 w-4 text-muted-foreground" />
							Select Client
						</Label>
						{!preselectedClient ? (
							<Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={clientSearchOpen}
										className="w-full justify-between font-normal"
										disabled={loadingClients}
									>
										{selectedClient ? (
											<div className="flex items-center gap-2">
												<Avatar className="h-6 w-6">
													<AvatarFallback className="text-xs">
														{selectedClient.first_name[0]}{selectedClient.last_name[0]}
													</AvatarFallback>
												</Avatar>
												<span>{selectedClient.first_name} {selectedClient.last_name}</span>
												<span className="text-muted-foreground text-sm">({selectedClient.email})</span>
											</div>
										) : (
											<span className="text-muted-foreground">
												{loadingClients ? "Loading clients..." : "Select a client..."}
											</span>
										)}
										<ChevronsUpDownIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[500px] p-0" align="start">
									<Command>
										<CommandInput 
											placeholder="Search clients..." 
											value={clientSearch}
											onValueChange={setClientSearch}
										/>
										<CommandList>
											<CommandEmpty>No clients found.</CommandEmpty>
											<CommandGroup>
												{filteredClients.map((client) => (
													<CommandItem
														key={client.id}
														value={`${client.first_name} ${client.last_name} ${client.email}`}
														onSelect={() => {
															setSelectedClient(client);
															setClientSearchOpen(false);
														}}
													>
														<div className="flex items-center gap-3 w-full">
															<Avatar className="h-8 w-8">
																<AvatarFallback className="text-xs">
																	{client.first_name[0]}{client.last_name[0]}
																</AvatarFallback>
															</Avatar>
															<div className="flex-1">
																<p className="font-medium">
																	{client.first_name} {client.last_name}
																</p>
																<p className="text-xs text-muted-foreground">
																	{client.email}
																</p>
															</div>
															{selectedClient?.id === client.id && (
																<CheckIcon className="h-4 w-4" />
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
							<div className="p-3 bg-muted/50 rounded-lg border">
								<div className="flex items-center gap-3">
									<Avatar className="h-10 w-10">
										<AvatarFallback>
											{selectedClient?.first_name[0]}{selectedClient?.last_name[0]}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">
											{selectedClient?.first_name} {selectedClient?.last_name}
										</p>
										<p className="text-sm text-muted-foreground">
											{selectedClient?.email}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* CS Assignment */}
					<div className="space-y-2">
						<Label className="text-sm font-medium flex items-center gap-2">
							<UsersIcon className="h-4 w-4 text-muted-foreground" />
							Assign Customer Success Manager
							<span className="text-xs text-muted-foreground">(Optional)</span>
						</Label>
						<Popover open={csSearchOpen} onOpenChange={setCSSearchOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={csSearchOpen}
									className="w-full justify-between font-normal"
									disabled={loadingCS}
								>
									{selectedCS ? (
										<div className="flex items-center gap-2">
											<Avatar className="h-6 w-6">
												<AvatarFallback className="text-xs bg-primary/10 text-primary">
													{selectedCS.name?.split(' ').map((n: string) => n[0]).join('') || 'CS'}
												</AvatarFallback>
											</Avatar>
											<span>{selectedCS.name}</span>
											<span className="text-muted-foreground text-sm">({selectedCS.email})</span>
										</div>
									) : (
										<span className="text-muted-foreground">
											{loadingCS ? "Loading team..." : "Select CS manager (optional)..."}
										</span>
									)}
									<ChevronsUpDownIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[500px] p-0" align="start">
								<Command>
									<CommandInput 
										placeholder="Search team members..." 
										value={csSearch}
										onValueChange={setCSSearch}
									/>
									<CommandList>
										<CommandEmpty>No team members found.</CommandEmpty>
										<CommandGroup>
											{filteredCS.map((cs) => (
												<CommandItem
													key={cs.id}
													value={`${cs.name} ${cs.email}`}
													onSelect={() => {
														setSelectedCS(cs);
														setCSSearchOpen(false);
													}}
												>
													<div className="flex items-center gap-3 w-full">
														<Avatar className="h-8 w-8">
															<AvatarFallback className="text-xs bg-primary/10 text-primary">
																{cs.name?.split(' ').map((n: string) => n[0]).join('') || 'CS'}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<p className="font-medium">{cs.name}</p>
															<p className="text-xs text-muted-foreground">
																{cs.email}
															</p>
														</div>
														{selectedCS?.id === cs.id && (
															<CheckIcon className="h-4 w-4" />
														)}
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					{/* Summary Card */}
					{selectedClient && (
						<div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
							<h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
								<RocketIcon className="h-4 w-4 text-primary" />
								Onboarding Summary
							</h4>
							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Client:</span>
									<span className="font-medium">
										{selectedClient.first_name} {selectedClient.last_name}
									</span>
								</div>
								{selectedCS && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">CS Manager:</span>
										<span className="font-medium">{selectedCS.name}</span>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Status will change to:</span>
									<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
										Onboarding
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Templates to assign:</span>
									<span className="font-medium">All active templates</span>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3 pt-2">
					<Button 
						variant="outline" 
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button 
						onClick={handleStartOnboarding} 
						disabled={!selectedClient || isPending}
						className="min-w-[140px]"
					>
						{isPending ? (
							<span className="flex items-center gap-2">
								<span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Starting...
							</span>
						) : (
							<span className="flex items-center gap-2">
								<RocketIcon className="h-4 w-4" />
								Start Onboarding
							</span>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}