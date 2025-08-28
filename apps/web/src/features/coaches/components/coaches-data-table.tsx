"use client";

import { UniversalDataTableWrapper } from "@/components/universal-data-table/universal-data-table-wrapper";

import type { CoachRow } from "../types";
import { coachesTableColumns } from "./coaches-table-columns";
import { CoachesTableContent } from "./coaches-table-content";

export function CoachesDataTable() {
	return (
		<UniversalDataTableWrapper<CoachRow>
			table="coaches"
			columns={coachesTableColumns}
			columnsConfig={[]} // We're using dynamic config in the content component
			urlStateKey="coachesFilters"
		>
			{(state) => <CoachesTableContent {...state} />}
		</UniversalDataTableWrapper>
	);
}
