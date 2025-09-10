import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Mail } from "lucide-react";
import { ManageEmailModal } from "../manage-email-modal";

interface NoEmailsProps {
	clientId: string;
}

export function NoEmails({ clientId }: NoEmailsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Email Addresses
					</CardTitle>
					<ManageEmailModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<Mail className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No email addresses recorded</p>
					<p className="mt-1 text-xs">
						Email addresses for this client will appear here once added
					</p>
				</div>
			</CardContent>
		</Card>
	);
}