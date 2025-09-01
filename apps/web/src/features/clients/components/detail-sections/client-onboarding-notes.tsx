import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientOnboardingNotesProps {
	notes: string;
}

export function ClientOnboardingNotes({ notes }: ClientOnboardingNotesProps) {
	if (!notes) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Onboarding Notes</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="whitespace-pre-wrap text-sm">{notes}</p>
			</CardContent>
		</Card>
	);
}
