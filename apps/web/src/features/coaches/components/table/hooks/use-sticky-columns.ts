import type { VisibilityState } from "@tanstack/react-table";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface TableColumn {
	id: string;
	getIsVisible: () => boolean;
}

interface TableInterface {
	getAllLeafColumns: () => TableColumn[];
}

interface UseStickyColumnsProps {
	columnVisibility?: VisibilityState;
	table?: TableInterface;
}

export function useStickyColumns({
	columnVisibility,
	table,
}: UseStickyColumnsProps) {
	const isVisible = (id: string) =>
		table
			?.getAllLeafColumns()
			.find((col) => col.id === id)
			?.getIsVisible() ??
		(columnVisibility ? columnVisibility[id] !== false : true);

	// Calculate dynamic sticky positions
	const stickyPositions = useMemo(() => {
		const positions: Record<string, number> = {};

		// Coach column (sticky to the left)
		if (isVisible("coach")) {
			positions.coach = 0;
		}

		// Actions column (sticky to the right) - no position needed for right sticky
		if (isVisible("actions")) {
			positions.actions = 0;
		}

		return positions;
	}, [isVisible]);

	// Function to get CSS custom properties for sticky columns
	const getStickyStyle = (columnId: string) => {
		const position = stickyPositions[columnId];
		if (columnId === "coach" && position !== undefined) {
			return { "--stick-left": `${position}px` } as React.CSSProperties;
		}
		if (columnId === "actions") {
			return { "--stick-right": "0px" } as React.CSSProperties;
		}
		return {};
	};

	// Function to get sticky class names
	const getStickyClassName = (columnId: string, baseClassName?: string) => {
		const leftStickyColumns = ["coach"];
		const rightStickyColumns = ["actions"];
		
		const isLeftSticky = leftStickyColumns.includes(columnId);
		const isRightSticky = rightStickyColumns.includes(columnId);
		
		return cn(
			baseClassName,
			isLeftSticky && "md:sticky md:left-[var(--stick-left)] z-10",
			isRightSticky && "md:sticky md:right-[var(--stick-right)] z-10",
		);
	};

	return {
		stickyPositions,
		getStickyStyle,
		getStickyClassName,
		isVisible,
	};
}