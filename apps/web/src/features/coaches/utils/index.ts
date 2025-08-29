export function getContractTypeBadgeClass(contractType: string | null): string {
	if (!contractType) return "bg-muted text-muted-foreground";

	const type = contractType.toLowerCase();

	if (type === "w2" || type === "w-2") {
		// Full-time employee - primary/default style
		return "bg-primary/10 text-primary";
	}
	if (type === "hourly" || type.includes("hour")) {
		// Hourly contractor - secondary style
		return "bg-secondary text-secondary-foreground";
	}
	// Default/Unknown - muted style
	return "bg-muted text-muted-foreground";
}
