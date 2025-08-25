"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import { PlusIcon, TrashIcon } from "lucide-react";

interface ClientTestimonial {
	id?: string;
	content: string;
	testimonial_type: string;
	testimonial_url: string;
	recorded_date: string;
}

interface ClientTestimonialsFormProps {
	testimonials: ClientTestimonial[];
	onChange: (testimonials: ClientTestimonial[]) => void;
}

export function ClientTestimonialsForm({
	testimonials,
	onChange,
}: ClientTestimonialsFormProps) {
	const addTestimonial = () => {
		const newTestimonial: ClientTestimonial = {
			content: "",
			testimonial_type: "written",
			testimonial_url: "",
			recorded_date: format(new Date(), "yyyy-MM-dd"),
		};
		onChange([...testimonials, newTestimonial]);
	};

	const updateTestimonial = (
		index: number,
		updatedTestimonial: Partial<ClientTestimonial>,
	) => {
		const updatedTestimonials = testimonials.map((testimonial, i) =>
			i === index ? { ...testimonial, ...updatedTestimonial } : testimonial,
		);
		onChange(updatedTestimonials);
	};

	const removeTestimonial = (index: number) => {
		const updatedTestimonials = testimonials.filter((_, i) => i !== index);
		onChange(updatedTestimonials);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-lg">Testimonials</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addTestimonial}
					className="gap-2"
				>
					<PlusIcon className="h-4 w-4" />
					Add Testimonial
				</Button>
			</div>

			{testimonials.length === 0 && (
				<div className="py-8 text-center text-muted-foreground">
					<p>
						No testimonials added yet. Click "Add Testimonial" to get started.
					</p>
				</div>
			)}

			{testimonials.map((testimonial, index) => (
				<div key={index} className="space-y-4 rounded-lg border p-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Testimonial #{index + 1}</h4>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => removeTestimonial(index)}
							className="text-red-600 hover:text-red-700"
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</div>

					<div className="space-y-4">
						<div>
							<Label>Content *</Label>
							<Textarea
								placeholder="Enter the testimonial content..."
								value={testimonial.content || ""}
								onChange={(e) =>
									updateTestimonial(index, { content: e.target.value })
								}
								rows={4}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<Label>Type *</Label>
								<Select
									value={testimonial.testimonial_type}
									onValueChange={(value) =>
										updateTestimonial(index, { testimonial_type: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="written">Written</SelectItem>
										<SelectItem value="video">Video</SelectItem>
										<SelectItem value="audio">Audio</SelectItem>
										<SelectItem value="email">Email</SelectItem>
										<SelectItem value="social_media">Social Media</SelectItem>
										<SelectItem value="review">Review</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label>URL</Label>
								<Input
									placeholder="Link to testimonial (optional)"
									value={testimonial.testimonial_url || ""}
									onChange={(e) =>
										updateTestimonial(index, {
											testimonial_url: e.target.value,
										})
									}
								/>
							</div>
						</div>

						<div>
							<Label>Recorded Date *</Label>
							<DatePicker
								value={testimonial.recorded_date}
								onChange={(date) =>
									updateTestimonial(index, { recorded_date: date || "" })
								}
								placeholder="Select recorded date"
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
