"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateCalendarLink } from "../actions/updateCalendarLink";

interface EditCalendarLinkDialogProps {
	userId: string;
	currentUrl: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function EditCalendarLinkDialog({
	userId,
	currentUrl,
	open,
	onOpenChange,
}: EditCalendarLinkDialogProps) {
	const [url, setUrl] = useState(currentUrl || "");
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await updateCalendarLink({
				userId,
				calendarLink: url.trim() || null,
			});

			if (result?.data?.success) {
				toast.success("Calendar link updated successfully");
				queryClient.invalidateQueries({
					queryKey: ["coaches", "detail", userId],
				});
				onOpenChange(false);
			} else {
				toast.error(result?.serverError || "Failed to update calendar link");
			}
		} catch (error) {
			toast.error("Failed to update calendar link");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemove = async () => {
		setIsLoading(true);

		try {
			const result = await updateCalendarLink({
				userId,
				calendarLink: null,
			});

			if (result?.data?.success) {
				toast.success("Calendar link removed");
				queryClient.invalidateQueries({
					queryKey: ["coaches", "detail", userId],
				});
				setUrl("");
				onOpenChange(false);
			} else {
				toast.error(result?.serverError || "Failed to remove calendar link");
			}
		} catch (error) {
			toast.error("Failed to remove calendar link");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Calendar Link</DialogTitle>
						<DialogDescription>
							Add or update your calendar booking link. This will be visible to
							clients and team members.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="calendar-url">Calendar URL</Label>
							<Input
								id="calendar-url"
								type="url"
								placeholder="https://calendly.com/yourname/meeting"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								disabled={isLoading}
							/>
							<p className="text-muted-foreground text-sm">
								Enter the full URL of your calendar booking page (e.g.,
								Calendly, Cal.com, etc.)
							</p>
						</div>
					</div>
					<DialogFooter className="flex items-center justify-between sm:justify-between">
						<div>
							{currentUrl && (
								<Button
									type="button"
									variant="ghost"
									onClick={handleRemove}
									disabled={isLoading}
									className="text-destructive hover:text-destructive"
								>
									Remove Link
								</Button>
							)}
						</div>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Save
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}