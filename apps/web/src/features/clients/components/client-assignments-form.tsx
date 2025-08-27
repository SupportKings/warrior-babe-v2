"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ClientAssignment {
	id?: string;
	coach_id: string | null;
	start_date: string;
	end_date: string | null;
	assignment_type: string;
	assigned_by: string | null;
	coach?: {
		id: number;
		name: string | null;
		user: {
			id: string;
			name: string;
			email: string;
		} | null;
	} | null;
}

interface Coach {
	id: string;
	name: string | null;
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
}

interface ClientAssignmentsFormProps {
	assignments: ClientAssignment[];
	onChange: (assignments: ClientAssignment[]) => void;
	availableCoaches?: Coach[];
}

export function ClientAssignmentsForm({
	assignments,
	onChange,
	availableCoaches = [],
}: ClientAssignmentsFormProps) {
	const addAssignment = () => {
		const newAssignment: ClientAssignment = {
			coach_id: null,
			start_date: format(new Date(), "yyyy-MM-dd"),
			end_date: null,
			assignment_type: "",
			assigned_by: null,
		};
		onChange([...assignments, newAssignment]);
	};

	const updateAssignment = (
		index: number,
		updatedAssignment: Partial<ClientAssignment>,
	) => {
		const updatedAssignments = assignments.map((assignment, i) =>
			i === index ? { ...assignment, ...updatedAssignment } : assignment,
		);
		onChange(updatedAssignments);
	};

	const removeAssignment = (index: number) => {
		const updatedAssignments = assignments.filter((_, i) => i !== index);
		onChange(updatedAssignments);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">Coach Assignments</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addAssignment}
					className="gap-2"
				>
					<PlusIcon className="h-4 w-4" />
					Add Assignment
				</Button>
			</div>

			{assignments.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					<p>
						No coach assignments yet. Click "Add Assignment" to assign a coach.
					</p>
				</div>
			)}

			{assignments.map((assignment, index) => (
				<div key={index} className="space-y-4 rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Assignment #{index + 1}</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removeAssignment(index)}
							className="text-red-600 hover:text-red-700"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Coach</Label>
								<Select
									value={assignment.coach_id?.toString() || ""}
									onValueChange={(value) =>
										updateAssignment(index, {
											coach_id: value ? value : null,
										})
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a coach" />
									</SelectTrigger>
									<SelectContent>
										{availableCoaches.map((coach) => (
											<SelectItem key={coach.id} value={coach.id.toString()}>
												{coach.name || coach.name || `Coach #${coach.id}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>Assignment Type</Label>
								<Select
									value={assignment.assignment_type}
									onValueChange={(value) =>
										updateAssignment(index, { assignment_type: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select assignment type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="primary">Primary</SelectItem>
										<SelectItem value="secondary">Secondary</SelectItem>
										<SelectItem value="temporary">Temporary</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Start Date</Label>
								<DatePicker
									value={assignment.start_date}
									onChange={(date) =>
										updateAssignment(index, { start_date: date || "" })
									}
									placeholder="Select start date"
								/>
							</div>

							<div>
								<Label>End Date (Optional)</Label>
								<DatePicker
									value={assignment.end_date || ""}
									onChange={(date) =>
										updateAssignment(index, { end_date: date || null })
									}
									placeholder="Select end date (leave empty for ongoing)"
								/>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
