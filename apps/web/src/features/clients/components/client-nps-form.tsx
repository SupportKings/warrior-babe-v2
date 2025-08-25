"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ClientNPS {
	id?: string;
	nps_score: number;
	notes: string;
	recorded_date: string;
}

interface ClientNPSFormProps {
	npsScores: ClientNPS[];
	onChange: (npsScores: ClientNPS[]) => void;
}

export function ClientNPSForm({ npsScores, onChange }: ClientNPSFormProps) {
	const addNPSScore = () => {
		const newNPSScore: ClientNPS = {
			nps_score: 10,
			notes: "",
			recorded_date: format(new Date(), "yyyy-MM-dd"),
		};
		onChange([...npsScores, newNPSScore]);
	};

	const updateNPSScore = (
		index: number,
		updatedNPSScore: Partial<ClientNPS>,
	) => {
		const updatedNPSScores = npsScores.map((npsScore, i) =>
			i === index ? { ...npsScore, ...updatedNPSScore } : npsScore,
		);
		onChange(updatedNPSScores);
	};

	const removeNPSScore = (index: number) => {
		const updatedNPSScores = npsScores.filter((_, i) => i !== index);
		onChange(updatedNPSScores);
	};

	const getScoreColor = (score: number) => {
		if (score >= 9) return "text-green-600";
		if (score >= 7) return "text-yellow-600";
		return "text-red-600";
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">NPS Scores</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addNPSScore}
					className="gap-2"
				>
					<PlusIcon className="h-4 w-4" />
					Add NPS Score
				</Button>
			</div>

			{npsScores.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					<p>No NPS scores added yet. Click "Add NPS Score" to get started.</p>
				</div>
			)}

			{npsScores.map((npsScore, index) => (
				<div key={index} className="space-y-4 rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">NPS Score #{index + 1}</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removeNPSScore(index)}
							className="text-red-600 hover:text-red-700"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						<div>
							<Label>NPS Score (0-10) *</Label>
							<div className="flex items-center space-x-4">
								<Input
									type="number"
									min="0"
									max="10"
									placeholder="10"
									value={npsScore.nps_score || ""}
									onChange={(e) =>
										updateNPSScore(index, {
											nps_score: Number.parseInt(e.target.value) || 0,
										})
									}
									className="max-w-20"
								/>
								<span
									className={`font-medium ${getScoreColor(npsScore.nps_score)}`}
								>
									{npsScore.nps_score >= 9
										? "Promoter"
										: npsScore.nps_score >= 7
											? "Passive"
											: "Detractor"}
								</span>
							</div>
						</div>

						<div>
							<Label>Notes</Label>
							<Textarea
								placeholder="Additional notes about the NPS score..."
								value={npsScore.notes || ""}
								onChange={(e) =>
									updateNPSScore(index, { notes: e.target.value })
								}
								rows={3}
							/>
						</div>

						<div>
							<Label>Recorded Date *</Label>
							<DatePicker
								value={npsScore.recorded_date}
								onChange={(date) =>
									updateNPSScore(index, { recorded_date: date || "" })
								}
								placeholder="Select recorded date"
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
