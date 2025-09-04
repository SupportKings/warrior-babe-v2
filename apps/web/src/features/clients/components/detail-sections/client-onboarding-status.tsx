import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import { CheckCircle2, Edit3, Save, X, XCircle } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

interface ClientOnboardingStatusProps {
	client: {
		onboarding_call_completed: boolean;
		two_week_check_in_call_completed: boolean;
		vip_terms_signed: boolean;
		onboarding_completed_date?: string | null;
		offboard_date?: string | null;
		onboarding_notes?: string | null;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function ClientOnboardingStatus({
	client,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ClientOnboardingStatusProps) {
	const [formData, setFormData] = useState({
		onboarding_call_completed: client.onboarding_call_completed,
		two_week_check_in_call_completed: client.two_week_check_in_call_completed,
		vip_terms_signed: client.vip_terms_signed,
		onboarding_completed_date: client.onboarding_completed_date || "",
		offboard_date: client.offboard_date || "",
		onboarding_notes: client.onboarding_notes || "",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			onboarding_call_completed: client.onboarding_call_completed,
			two_week_check_in_call_completed: client.two_week_check_in_call_completed,
			vip_terms_signed: client.vip_terms_signed,
			onboarding_completed_date: client.onboarding_completed_date || "",
			offboard_date: client.offboard_date || "",
			onboarding_notes: client.onboarding_notes || "",
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5" />
						Onboarding & Status
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
				<div className="flex items-center justify-between">
					<label className="font-medium text-muted-foreground text-sm">
						Onboarding Call
					</label>
					{isEditing ? (
						<Switch
							checked={formData.onboarding_call_completed}
							onCheckedChange={(checked) =>
								setFormData((prev) => ({
									...prev,
									onboarding_call_completed: checked,
								}))
							}
						/>
					) : (
						<div className="flex items-center space-x-2">
							{client.onboarding_call_completed ? (
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-red-600" />
							)}
							<span className="text-sm">
								{client.onboarding_call_completed
									? "Completed"
									: "Not Completed"}
							</span>
						</div>
					)}
				</div>
				<div className="flex items-center justify-between">
					<label className="font-medium text-muted-foreground text-sm">
						Two Week Check-in Call
					</label>
					{isEditing ? (
						<Switch
							checked={formData.two_week_check_in_call_completed}
							onCheckedChange={(checked) =>
								setFormData((prev) => ({
									...prev,
									two_week_check_in_call_completed: checked,
								}))
							}
						/>
					) : (
						<div className="flex items-center space-x-2">
							{client.two_week_check_in_call_completed ? (
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-red-600" />
							)}
							<span className="text-sm">
								{client.two_week_check_in_call_completed
									? "Completed"
									: "Not Completed"}
							</span>
						</div>
					)}
				</div>
				<div className="flex items-center justify-between">
					<label className="font-medium text-muted-foreground text-sm">
						VIP Terms Signed
					</label>
					{isEditing ? (
						<Switch
							checked={formData.vip_terms_signed}
							onCheckedChange={(checked) =>
								setFormData((prev) => ({ ...prev, vip_terms_signed: checked }))
							}
						/>
					) : (
						<div className="flex items-center space-x-2">
							{client.vip_terms_signed ? (
								<CheckCircle2 className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-red-600" />
							)}
							<span className="text-sm">
								{client.vip_terms_signed ? "Signed" : "Not Signed"}
							</span>
						</div>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Onboarding Completed Date
					</label>
					{isEditing ? (
						<Input
							type="date"
							value={formData.onboarding_completed_date}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									onboarding_completed_date: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{formatDate(client.onboarding_completed_date || null)}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Offboard Date
					</label>
					{isEditing ? (
						<Input
							type="date"
							value={formData.offboard_date}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									offboard_date: e.target.value,
								}))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">
							{formatDate(client.offboard_date || null)}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Onboarding Notes
					</label>
					{isEditing ? (
						<Textarea
							value={formData.onboarding_notes}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									onboarding_notes: e.target.value,
								}))
							}
							placeholder="Enter onboarding notes..."
							className="mt-1 min-h-[100px]"
						/>
					) : (
						<div className="text-sm">
							{client.onboarding_notes ? (
								<p className="whitespace-pre-wrap">{client.onboarding_notes}</p>
							) : (
								<p className="text-muted-foreground italic">No notes</p>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
