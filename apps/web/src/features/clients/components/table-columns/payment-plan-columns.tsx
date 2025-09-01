
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

export const createPaymentPlanColumns = () => {
	const paymentPlanColumnHelper = createColumnHelper<any>();
	return [
		paymentPlanColumnHelper.accessor("payment_plan_templates", {
			header: "Type",
			cell: (info) => {
				const template = info.getValue();
				const row = info.row.original;
				if (row.type === "custom") {
					return "Custom";
				}
				return template?.name || "Unknown";
			},
		}),
		paymentPlanColumnHelper.accessor("products", {
			header: "Product",
			cell: (info) => {
				const product = info.getValue();
				return product?.name || "No product";
			},
		}),
		paymentPlanColumnHelper.accessor("term_start_date", {
			header: "Term Start Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		paymentPlanColumnHelper.accessor("term_end_date", {
			header: "Term End Date",
			cell: (info) => formatDate(info.getValue()),
		}),
		paymentPlanColumnHelper.accessor("payment_slots", {
			header: "Total Amount",
			cell: (info) => {
				const slots = info.getValue();
				if (!slots || slots.length === 0) {
					return "$0.00";
				}
				const totalAmount = slots.reduce((sum: number, slot: any) => sum + (slot.amount_due || 0), 0);
				return `$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
			},
		}),
	];
};

export const createPaymentPlanRowActions = (
	setDeleteModal: any,
	setEditModal: any,
) => [
	{
		label: "Edit",
		icon: Edit,
		onClick: (paymentPlan: any) => {
			setEditModal({
				isOpen: true,
				type: "payment_plan",
				data: paymentPlan,
			});
		},
	},
	{
		label: "Delete",
		icon: Trash2,
		variant: "destructive" as const,
		onClick: (paymentPlan: any) => {
			const planName = paymentPlan.payment_plan_templates?.name || paymentPlan.type === "custom" ? "Custom Plan" : "Payment Plan";
			setDeleteModal({
				isOpen: true,
				type: "payment_plan",
				id: paymentPlan.id,
				title: `Delete payment plan "${planName}"`,
			});
		},
	},
];
