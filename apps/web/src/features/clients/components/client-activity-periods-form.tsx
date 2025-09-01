"use client";

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

import { format } from "date-fns";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ClientActivityPeriod {
	id?: string;
	active: boolean;
	start_date: string;
	end_date: string;
	coach_id: string | null;
	payment_plan?: string | null;
}

interface Coach {
	id: string;
	name: string | null;
	contract_type: "W2" | "Hourly" | null;
	onboarding_date: string | null;
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
}

interface ClientActivityPeriodsFormProps {
	activityPeriods: ClientActivityPeriod[];
	onChange: (activityPeriods: ClientActivityPeriod[]) => void;
	availableCoaches?: Coach[];
}

export function ClientActivityPeriodsForm({
	activityPeriods,
	onChange,
	availableCoaches = [],
}: ClientActivityPeriodsFormProps) {
	const addActivityPeriod = () => {
		const newActivityPeriod: ClientActivityPeriod = {
			active: true,
			start_date: format(new Date(), "yyyy-MM-dd"),
			end_date: "",
			coach_id: null,
			payment_plan: null,
		};
		onChange([...activityPeriods, newActivityPeriod]);
	};

	const updateActivityPeriod = (
		index: number,
		updatedActivityPeriod: Partial<ClientActivityPeriod>,
	) => {
		const updatedActivityPeriods = activityPeriods.map((activityPeriod, i) =>
			i === index
				? { ...activityPeriod, ...updatedActivityPeriod }
				: activityPeriod,
		);
		onChange(updatedActivityPeriods);
	};

	const removeActivityPeriod = (index: number) => {
		const updatedActivityPeriods = activityPeriods.filter(
			(_, i) => i !== index,
		);
		onChange(updatedActivityPeriods);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">Activity Periods</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addActivityPeriod}
					className="gap-2"
				>
					<PlusIcon className="h-4 w-4" />
					Add Activity Period
				</Button>
			</div>

			{activityPeriods.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					<p>
						No activity periods added yet. Click "Add Activity Period" to get
						started.
					</p>
				</div>
			)}

			{activityPeriods.map((activityPeriod, index) => (
				<div key={index} className="space-y-4 rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Activity Period #{index + 1}</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removeActivityPeriod(index)}
							className="text-red-600 hover:text-red-700"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<Switch
								checked={activityPeriod.active}
								onCheckedChange={(checked) =>
									updateActivityPeriod(index, { active: checked })
								}
							/>
							<Label>Active Period</Label>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Start Date *</Label>
								<DatePicker
									value={activityPeriod.start_date}
									onChange={(date) =>
										updateActivityPeriod(index, { start_date: date || "" })
									}
									placeholder="Select start date"
								/>
							</div>

							<div>
								<Label>End Date</Label>
								<DatePicker
									value={activityPeriod.end_date}
									onChange={(date) =>
										updateActivityPeriod(index, { end_date: date || "" })
									}
									placeholder="Select end date (optional)"
								/>
							</div>
						</div>

						<div>
							<Label>Coach</Label>
							<Select
								value={activityPeriod.coach_id?.toString() || ""}
								onValueChange={(value) =>
									updateActivityPeriod(index, {
										coach_id: value || null,
									})
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a coach (optional)" />
								</SelectTrigger>
								<SelectContent>
									{availableCoaches.map((coach) => (
										<SelectItem key={coach.id} value={coach.id.toString()}>
											{coach.name || `Coach #${coach.id}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Payment Plan ID</Label>
							<Input
								value={activityPeriod.payment_plan || ""}
								onChange={(e) =>
									updateActivityPeriod(index, {
										payment_plan: e.target.value || null,
									})
								}
								placeholder="Payment plan ID (optional)"
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
