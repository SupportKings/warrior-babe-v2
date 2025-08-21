"use client";

import { rolesMap } from "@/lib/permissions";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { setUserRole } from "@/features/team/actions/setUserRole";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";

// Get all roles dynamically from the permissions file, excluding 'user'
const roles = Object.keys(rolesMap)
	.filter((roleName) => roleName !== "user")
	.map((roleName) => ({
		value: roleName,
		label:
			roleName.charAt(0).toUpperCase() +
			roleName.slice(1).replace(/([A-Z])/g, " $1"), // Capitalize and add spaces
	}));

// Create type for all available roles
type RoleType = keyof typeof rolesMap;

// Create schema based on available roles
const roleSchema = z.object({
	role: z.enum(Object.keys(rolesMap) as [RoleType, ...RoleType[]]),
});

interface ChangeRoleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	userName: string;
	currentRole: string;
}

export default function ChangeRoleDialog({
	open,
	onOpenChange,
	userId,
	userName,
	currentRole,
}: ChangeRoleDialogProps) {
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			role: currentRole as RoleType,
		},
		onSubmit: async ({ value }) => {
			const result = await setUserRole({
				userId,
				role: value.role,
			});

			if (result?.data?.success) {
				onOpenChange(false);
				// Invalidate and refetch users data
				queryClient.invalidateQueries({ queryKey: ["users"] });
			}
		},
		validators: {
			onSubmit: roleSchema,
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Change User Role</DialogTitle>
					<DialogDescription>
						Change the role for {userName}. This will affect their permissions
						in the system.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="space-y-2">
						<div className="font-medium text-sm">Current Role</div>
						<div className="text-muted-foreground text-sm">
							{currentRole.charAt(0).toUpperCase() +
								currentRole.slice(1).replace(/([A-Z])/g, " $1")}
						</div>
					</div>

					<form.Field name="role">
						{(field) => (
							<div className="space-y-2">
								<div className="font-medium text-sm">New Role</div>
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(value as RoleType)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select new role" />
									</SelectTrigger>
									<SelectContent>
										{roles.map((role) => (
											<SelectItem key={role.value} value={role.value}>
												{role.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-red-500 text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={form.state.isSubmitting}
						>
							Cancel
						</Button>
						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Update Role
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
