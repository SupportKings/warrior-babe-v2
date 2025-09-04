"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import * as Dialog from "@radix-ui/react-dialog";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { deleteClient } from "@/features/clients/actions/deleteClient";
import { useClient } from "@/features/clients/queries/useClients";

import { Trash2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ClientDetailHeaderProps {
	clientId: string;
}

export default function ClientDetailHeader({
	clientId,
}: ClientDetailHeaderProps) {
	const { data: client } = useClient(clientId);
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const { execute: executeDeleteClient, isExecuting } = useAction(
		deleteClient,
		{
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				toast.success(
					`${client?.name || "Client"} has been deleted successfully`,
				);
				router.push("/dashboard/clients");
			},
			onError: (error) => {
				console.error("Failed to delete client:", error);
				toast.error("Failed to delete client. Please try again.");
			},
		},
	);

	const handleDeleteClient = () => {
		executeDeleteClient({ id: clientId });
	};
	return (
		<div className="sticky top-0 z-10 flex h-[45px] flex-shrink-0 items-center justify-between border-border border-b px-4 py-2 lg:px-6">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<BackButton />
				<h1 className="font-medium text-[13px]">
					{client?.name ? `${client.name} - Details` : "Client Details"}
				</h1>
			</div>
			<Dialog.Root
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<Dialog.Trigger asChild>
					<Button variant="destructive" className="flex items-center gap-2">
						<Trash2Icon className="mr-[6px] h-4 w-4" />
						Archive Client
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
					<Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-md transform rounded-lg bg-white p-6 shadow-lg">
						<Dialog.Title className="mb-4 font-semibold text-lg">
							Archive Client
						</Dialog.Title>
						<Dialog.Description className="mb-6 text-gray-600">
							Are you sure you want to delete {client?.name || "this client"}?
							This action cannot be undone.
						</Dialog.Description>
						<div className="flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.Close>
							<Button
								variant="destructive"
								onClick={handleDeleteClient}
								disabled={isExecuting}
							>
								{isExecuting ? "Deleting..." : "Delete"}
							</Button>
						</div>
						<Dialog.Close asChild>
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-3 right-3 p-1"
							>
								<X className="h-4 w-4" />
							</Button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
