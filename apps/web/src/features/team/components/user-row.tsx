import { useState } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { UserWithRole } from "@/features/team/queries/getUsers";

import {
	Loader2,
	Mail,
	MoreHorizontal,
	Shield,
	User,
	UserCheck,
	XIcon,
} from "lucide-react";
import { toast } from "sonner";

interface UserRowProps {
	user: UserWithRole;
	onChangeRole: (userId: string, userName: string, currentRole: string) => void;
	onRemoveUser: (userId: string, userName: string) => void;
	currentUserId: string;
	permissions: any;
	impersonatedBy?: string | null;
}

export function UserRow({
	user,
	onChangeRole,
	onRemoveUser,
	currentUserId,
	permissions,
	impersonatedBy,
}: UserRowProps) {
	const [isImpersonating, setIsImpersonating] = useState(false);
	const router = useRouter();

	// Check if user is the current user (self)
	const isSelf = currentUserId === user.id;

	// Check permissions for admin actions
	const canChangeRole = permissions?.user?.includes("set-role") && !isSelf;
	const canRemoveUser = permissions?.user?.includes("delete") && !isSelf;
	const canImpersonate = permissions?.user?.includes("impersonate") && !isSelf;

	const handleImpersonate = async () => {
		if (isSelf || !canImpersonate) return;

		setIsImpersonating(true);

		// If already impersonating someone, stop impersonation first
		if (impersonatedBy) {
			try {
				await authClient.admin.stopImpersonating();
			} catch (error) {
				console.error("Error stopping current impersonation:", error);
				setIsImpersonating(false);
				toast.error("Failed to stop current impersonation");
				return;
			}
		}

		const impersonationPromise = authClient.admin.impersonateUser(
			{
				userId: user.id,
			},
			{
				onSuccess: () => {
					// We wrap our navigate in a setTimeout 0. This forces the code to run on the next tick,
					// which protects us against some edge cases where you are signed in but the cookie isn't set yet
					setTimeout(() => {
						router.push("/dashboard");
						router.refresh();
					}, 0);
					// Don't set isImpersonating to false here - keep the loading state during redirect
				},
				onError: (error) => {
					console.error(
						"Error impersonating user:",
						error.error.message || error.error,
					);
					setIsImpersonating(false); // Only stop loading on error
				},
			},
		);

		toast.promise(impersonationPromise, {
			loading: `Impersonating ${user.name || "user"}...`,
			success: () => {
				return {
					message: `Successfully impersonating ${user.name || "user"}`,
					description: "Redirecting to dashboard...",
				};
			},
			error: (error) => {
				setIsImpersonating(false);
				return {
					message: "Failed to impersonate user",
					description:
						error.error?.message || "An error occurred during impersonation",
				};
			},
		});
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const formatDate = (date: string | Date) => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return dateObj.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="flex h-9 items-center justify-between border-b bg-card px-4">
			<div className="flex items-center space-x-4">
				<Avatar className="h-6 w-6">
					<AvatarImage
						src={user.image || undefined}
						alt={user.name || "User"}
					/>
					<AvatarFallback className="text-xs">
						{getInitials(user.name || "User")}
					</AvatarFallback>
				</Avatar>

				<div className="flex items-center space-x-2">
					<p className="font-medium text-sm leading-none">
						{user.name || "Unknown User"}
					</p>
				</div>

				<div className="flex items-center space-x-4 text-muted-foreground text-sm">
					<div className="flex items-center space-x-1">
						<Mail className="h-3 w-3" />
						<span>{user.email}</span>
					</div>

					<div className="flex items-center space-x-1">
						<User className="h-3 w-3" />
						<span>Joined {formatDate(user.createdAt)}</span>
					</div>
				</div>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-6 w-6 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() =>
							onChangeRole(
								user.id,
								user.name || "Unknown User",
								user.role || "user",
							)
						}
						disabled={!canChangeRole}
					>
						<Shield className="mr-[6px] h-4 w-4" />
						Change Role
					</DropdownMenuItem>
					{canImpersonate && (
						<DropdownMenuItem
							onClick={handleImpersonate}
							disabled={isImpersonating}
						>
							{isImpersonating ? (
								<Loader2 className="mr-[6px] h-4 w-4 animate-spin" />
							) : (
								<UserCheck className="mr-[6px] h-4 w-4" />
							)}
							{isImpersonating ? "Impersonating..." : "Impersonate User"}
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => onRemoveUser(user.id, user.name || "Unknown User")}
						disabled={!canRemoveUser}
					>
						<XIcon className="mr-[6px] h-4 w-4" />
						Remove from Team
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
