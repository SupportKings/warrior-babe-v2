import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { Edit3, Package, Save, X } from "lucide-react";

interface ProductBasicInfoProps {
	product: {
		name: string;
		description?: string | null;
		default_duration_months?: number | null;
		is_active: boolean;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function ProductBasicInfo({
	product,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: ProductBasicInfoProps) {
	const [formData, setFormData] = useState({
		name: product.name,
		description: product.description || "",
		default_duration_months: product.default_duration_months || 0,
		is_active: product.is_active,
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			name: product.name,
			description: product.description || "",
			default_duration_months: product.default_duration_months || 0,
			is_active: product.is_active,
		});
		onCancel?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						Product Details
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
						Name
					</label>
					{isEditing ? (
						<Input
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{product.name}</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Description
					</label>
					{isEditing ? (
						<Textarea
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Enter product description"
							className="mt-1"
							rows={3}
						/>
					) : (
						<p className="text-sm">
							{product.description || "No description provided"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Default Duration (months)
					</label>
					{isEditing ? (
						<Input
							type="number"
							value={formData.default_duration_months}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									default_duration_months: Number.parseInt(e.target.value) || 0,
								}))
							}
							className="mt-1"
							min="0"
							max="60"
						/>
					) : (
						<p className="text-sm">
							{product.default_duration_months
								? `${product.default_duration_months} months`
								: "Not set"}
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Status
					</label>
					{isEditing ? (
						<div className="mt-1 flex items-center gap-2">
							<Switch
								checked={formData.is_active}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({ ...prev, is_active: checked }))
								}
							/>
							<span className="text-sm">
								{formData.is_active ? "Active" : "Inactive"}
							</span>
						</div>
					) : (
						<div className="text-sm">
							<StatusBadge>
								{product.is_active ? "Active" : "Inactive"}
							</StatusBadge>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
