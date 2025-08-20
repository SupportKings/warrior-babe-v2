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
	loading?: boolean;
}

export function useStickyColumns({
	columnVisibility,
	table,
	loading,
}: UseStickyColumnsProps) {
	const isVisible = (id: string) =>
		loading ||
		table
			?.getAllLeafColumns()
			.find((col) => col.id === id)
			?.getIsVisible() ||
		(columnVisibility && columnVisibility[id] !== false);

	// Calculate dynamic sticky positions for ticket columns
	const stickyPositions = useMemo(() => {
		const positions: Record<string, number> = {};

		// Title column (sticky to the left)
		if (isVisible("title")) {
			positions.title = 0;
		}

		return positions;
	}, [isVisible]);

	// Function to get CSS custom properties for sticky columns
	const getStickyStyle = (columnId: string) => {
		const position = stickyPositions[columnId];
		return position !== undefined
			? ({ "--stick-left": `${position}px` } as React.CSSProperties)
			: {};
	};

	// Function to get sticky class names
	const getStickyClassName = (columnId: string, baseClassName?: string) => {
		const stickyColumns = ["title"];
		const isSticky = stickyColumns.includes(columnId);
		return cn(
			baseClassName,
			isSticky && "md:sticky md:left-[var(--stick-left)]",
		);
	};

	return {
		stickyPositions,
		getStickyStyle,
		getStickyClassName,
		isVisible,
	};
}