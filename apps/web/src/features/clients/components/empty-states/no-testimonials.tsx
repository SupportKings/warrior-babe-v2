import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MessageSquare } from "lucide-react";
import { ManageTestimonialModal } from "../manage-testimonial-modal";

interface NoTestimonialsProps {
	clientId: string;
}

export function NoTestimonials({ clientId }: NoTestimonialsProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Testimonials
					</CardTitle>
					<ManageTestimonialModal clientId={clientId} mode="add" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="py-8 text-center text-muted-foreground">
					<MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p className="text-sm">No testimonials collected</p>
					<p className="mt-1 text-xs">
						Client testimonials will appear here once recorded
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
