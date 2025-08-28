/**
 * Returns the CSS class string for a contract-type badge.
 *
 * Maps common `contractType` values to UI badge styling:
 * - null/empty → muted styling
 * - `"w2"` or `"w-2"` → primary styling
 * - `"hourly"` or any value containing `"hour"` → secondary styling
 * - any other value → muted styling
 *
 * @param contractType - Contract type label (case-insensitive); may be `null`.
 * @returns A CSS class string to apply to the contract-type badge.
 */
export function getContractTypeBadgeClass(contractType: string | null): string {
  if (!contractType) return "bg-muted text-muted-foreground";

  const type = contractType.toLowerCase();

  if (type === "w2" || type === "w-2") {
    // Full-time employee - primary/default style
    return "bg-primary/10 text-primary";
  } else if (type === "hourly" || type.includes("hour")) {
    // Hourly contractor - secondary style
    return "bg-secondary text-secondary-foreground";
  } else {
    // Default/Unknown - muted style
    return "bg-muted text-muted-foreground";
  }
}
