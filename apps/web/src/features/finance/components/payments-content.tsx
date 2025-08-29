"use client";

import { PaymentsDataTable } from "./payments.table";

export default function PaymentsContent() {
	return (
		<div className="space-y-6 p-6">
			<PaymentsDataTable />
		</div>
	);
}
