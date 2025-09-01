import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { useState } from "react";
import { Edit3, Save, X } from "lucide-react";
import { User } from "lucide-react";

interface ClientBasicInfoProps {
	client: {
		name: string;
		email: string;
		phone?: string | null;
		overall_status: string;
		everfit_access: string;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function ClientBasicInfo({ 
	client, 
	isEditing = false, 
	onEditToggle, 
	onSave, 
	onCancel 
}: ClientBasicInfoProps) {
	const [formData, setFormData] = useState({
		name: client.name,
		email: client.email,
		phone: client.phone || "",
		overall_status: client.overall_status,
		everfit_access: client.everfit_access,
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			name: client.name,
			email: client.email,
			phone: client.phone || "",
			overall_status: client.overall_status,
			everfit_access: client.everfit_access,
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
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
					<label className="font-medium text-muted-foreground text-sm">
						Full Name
					</label>
					{isEditing ? (
						<Input
							value={formData.name}
							onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{client.name}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Email
					</label>
					{isEditing ? (
						<Input
							type="email"
							value={formData.email}
							onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{client.email}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Phone
					</label>
					{isEditing ? (
						<Input
							value={formData.phone}
							onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
							placeholder="Enter phone number"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{client.phone || "Not provided"}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Overall Status
					</label>
					{isEditing ? (
						<Select
							value={formData.overall_status}
							onValueChange={(value) => setFormData(prev => ({ ...prev, overall_status: value }))}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="new">New</SelectItem>
								<SelectItem value="live">Live</SelectItem>
								<SelectItem value="paused">Paused</SelectItem>
								<SelectItem value="churned">Churned</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							<StatusBadge>{client.overall_status}</StatusBadge>
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Everfit Access
					</label>
					{isEditing ? (
						<Select
							value={formData.everfit_access}
							onValueChange={(value) => setFormData(prev => ({ ...prev, everfit_access: value }))}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="new">New</SelectItem>
								<SelectItem value="requested">Requested</SelectItem>
								<SelectItem value="confirmed">Confirmed</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							<StatusBadge>{client.everfit_access}</StatusBadge>
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
