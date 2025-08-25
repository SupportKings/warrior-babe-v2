"use client";

import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ClientGoal {
	id?: string;
	title: string;
	description?: string | null;
	target_value: string;
	current_value: string;
	status:
		| "pending"
		| "in_progress"
		| "completed"
		| "cancelled"
		| "overdue"
		| undefined;
	due_date: string;
	started_at: string;
	priority: "high" | "medium" | "low";
}

interface ClientGoalsFormProps {
	goals: ClientGoal[];
	onChange: (goals: ClientGoal[]) => void;
}

export function ClientGoalsForm({ goals, onChange }: ClientGoalsFormProps) {
	const addGoal = () => {
		const newGoal: ClientGoal = {
			title: "",
			description: "",
			target_value: "",
			current_value: "",
			status: "pending",
			due_date: format(new Date(), "yyyy-MM-dd"),
			started_at: format(new Date(), "yyyy-MM-dd"),
			priority: "medium",
		};
		onChange([...goals, newGoal]);
	};

	const updateGoal = (index: number, updatedGoal: Partial<ClientGoal>) => {
		const updatedGoals = goals.map((goal, i) =>
			i === index ? { ...goal, ...updatedGoal } : goal,
		);
		onChange(updatedGoals);
	};

	const removeGoal = (index: number) => {
		const updatedGoals = goals.filter((_, i) => i !== index);
		onChange(updatedGoals);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">Client Goals</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addGoal}
					className="gap-2"
				>
					<PlusIcon className="h-4 w-4" />
					Add Goal
				</Button>
			</div>

			{goals.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					<p>No goals added yet. Click "Add Goal" to get started.</p>
				</div>
			)}

			{goals.map((goal, index) => (
				<div key={index} className="space-y-4 rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Goal #{index + 1}</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removeGoal(index)}
							className="text-red-600 hover:text-red-700"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						<div>
							<Label>Goal Title *</Label>
							<Input
								placeholder="Goal title..."
								value={goal.title}
								onChange={(e) => updateGoal(index, { title: e.target.value })}
							/>
						</div>

						<div>
							<Label>Description</Label>
							<Textarea
								placeholder="Describe the client's goal..."
								value={goal.description || ""}
								onChange={(e) =>
									updateGoal(index, { description: e.target.value })
								}
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Target Value *</Label>
								<Input
									placeholder="Target"
									value={goal.target_value || ""}
									onChange={(e) =>
										updateGoal(index, { target_value: e.target.value })
									}
								/>
							</div>

							<div>
								<Label>Current Value *</Label>
								<Input
									placeholder="Current"
									value={goal.current_value || ""}
									onChange={(e) =>
										updateGoal(index, { current_value: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div>
								<Label>Status</Label>
								<Select
									value={goal.status || "pending"}
									onValueChange={(value) =>
										updateGoal(index, { status: value as ClientGoal["status"] })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="in_progress">In Progress</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
										<SelectItem value="overdue">Overdue</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>Priority</Label>
								<Select
									value={goal.priority}
									onValueChange={(value) =>
										updateGoal(index, {
											priority: value as ClientGoal["priority"],
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="low">Low</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>Due Date *</Label>
								<DatePicker
									value={goal.due_date}
									onChange={(date) =>
										updateGoal(index, { due_date: date || "" })
									}
									placeholder="Select due date"
								/>
							</div>
						</div>

						<div>
							<Label>Started At *</Label>
							<DatePicker
								value={goal.started_at}
								onChange={(date) =>
									updateGoal(index, { started_at: date || "" })
								}
								placeholder="Select start date"
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
