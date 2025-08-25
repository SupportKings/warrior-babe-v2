"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ClientWin {
	id?: string;
	title: string;
	description?: string | null;
	win_date: string;
}

interface ClientWinsFormProps {
	wins: ClientWin[];
	onChange: (wins: ClientWin[]) => void;
}

export function ClientWinsForm({ wins, onChange }: ClientWinsFormProps) {
	const addWin = () => {
		const newWin: ClientWin = {
			title: "",
			description: "",
			win_date: format(new Date(), "yyyy-MM-dd"),
		};
		onChange([...wins, newWin]);
	};

	const updateWin = (index: number, updatedWin: Partial<ClientWin>) => {
		const updatedWins = wins.map((win, i) =>
			i === index ? { ...win, ...updatedWin } : win,
		);
		onChange(updatedWins);
	};

	const removeWin = (index: number) => {
		const updatedWins = wins.filter((_, i) => i !== index);
		onChange(updatedWins);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">Client Wins</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addWin}
					className="gap-2"
				>
					<PlusIcon className="h-4 w-4" />
					Add Win
				</Button>
			</div>

			{wins.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					<p>
						No wins recorded yet. Click "Add Win" to celebrate achievements!
					</p>
				</div>
			)}

			{wins.map((win, index) => (
				<div key={index} className="space-y-4 rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Win #{index + 1}</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removeWin(index)}
							className="text-red-600 hover:text-red-700"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						<div>
							<Label>Win Title *</Label>
							<Input
								placeholder="Win title..."
								value={win.title}
								onChange={(e) => updateWin(index, { title: e.target.value })}
							/>
						</div>

						<div>
							<Label>Description</Label>
							<Textarea
								placeholder="Describe the client's achievement or win..."
								value={win.description || ""}
								onChange={(e) =>
									updateWin(index, { description: e.target.value })
								}
								rows={3}
							/>
						</div>

						<div>
							<Label>Win Date *</Label>
							<DatePicker
								value={win.win_date}
								onChange={(date) => updateWin(index, { win_date: date || "" })}
								placeholder="Select win date"
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
