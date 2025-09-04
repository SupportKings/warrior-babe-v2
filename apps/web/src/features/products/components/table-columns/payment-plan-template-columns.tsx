import { StatusBadge } from "@/components/ui/status-badge";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
};

export const createPaymentPlanTemplateColumns = () => {
	const paymentPlanTemplateColumnHelper = createColumnHelper<any>();
	return [
		// Template name field column
		paymentPlanTemplateColumnHelper.accessor("name", {
			header: "Template Name",
			cell: (info) => info.getValue() || "Unknown",
		}),

		// Program length field column
		paymentPlanTemplateColumnHelper.accessor("program_length_months", {
			header: "Program Length",
			cell: (info) => {
				const months = info.getValue();
				if (months === null || months === undefined) return "Not set";
				return `${months} ${months === 1 ? "month" : "months"}`;
			},
		}),

		// Number of payment slots
		paymentPlanTemplateColumnHelper.accessor("payment_plan_template_slots", {
			header: "Payment Slots",
			cell: (info) => {
				const slots = info.getValue() as any[];
				if (!slots || !Array.isArray(slots)) return "0 slots";
				return `${slots.length} ${slots.length === 1 ? "slot" : "slots"}`;
			},
		}),

		// Total amount from all slots
		paymentPlanTemplateColumnHelper.accessor("payment_plan_template_slots", {
			id: "total_amount",
			header: "Total Amount",
			cell: (info) => {
				const slots = info.getValue() as any[];
				if (!slots || !Array.isArray(slots)) return formatCurrency(0);
				const total = slots.reduce(
					(sum, slot) => sum + (slot.amount_due || 0),
					0,
				);
				return formatCurrency(total);
			},
		}),

		// Created date field
		paymentPlanTemplateColumnHelper.accessor("created_at", {
			header: "Created",
			cell: (info) => formatDate(info.getValue()),
		}),
	];
};

export const createPaymentPlanTemplateRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (paymentPlanTemplate: any) => {
			setEditModal({
				isOpen: true,
				type: "payment_plan_template",
				data: paymentPlanTemplate,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (paymentPlanTemplate: any) => {
			setDeleteModal({
				isOpen: true,
				type: "payment_plan_template",
				id: paymentPlanTemplate.id,
				title: `Delete payment plan template "${paymentPlanTemplate.name}"`,
			});
		},
	},
];
