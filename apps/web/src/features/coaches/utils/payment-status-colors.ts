import type { StatusColorScheme } from "@/components/ui/status-badge";

/**
 * Get the color scheme for payment status
 * @param status - The payment status string
 * @returns The color scheme to use for the status badge
 */
export function getPaymentStatusColor(status: string | null | undefined): StatusColorScheme {
  if (!status) return "gray";

  const normalizedStatus = status.toLowerCase().trim();

  // Paid/Completed states
  if (normalizedStatus === "paid" || /(completed|success|settled|processed)/i.test(normalizedStatus)) {
    return "green";
  }

  // Not Paid/Failed states  
  if (normalizedStatus === "not paid" || normalizedStatus === "not_paid" || /(failed|declined|error|rejected|cancelled|reversed|unpaid)/i.test(normalizedStatus)) {
    return "red";
  }

  // Pending/Processing states
  if (/(pending|processing|hold|review)/i.test(normalizedStatus)) {
    return "yellow";
  }

  // Scheduled/Future states
  if (/(scheduled|upcoming|draft)/i.test(normalizedStatus)) {
    return "blue";
  }

  // Partial/Incomplete states
  if (/(partial|incomplete|disputed)/i.test(normalizedStatus)) {
    return "orange";
  }

  // Refunded states
  if (/(refunded|returned)/i.test(normalizedStatus)) {
    return "purple";
  }

  // Default to gray for unknown statuses
  return "gray";
}

/**
 * Format payment status for display
 * @param status - The raw payment status string
 * @returns Formatted status string
 */
export function formatPaymentStatus(status: string | null | undefined): string {
  if (!status) return "Unknown";

  // Special handling for common statuses
  const normalizedStatus = status.toLowerCase().trim();
  if (normalizedStatus === "not paid" || normalizedStatus === "not_paid") {
    return "Not Paid";
  }
  if (normalizedStatus === "paid") {
    return "Paid";
  }

  // Default formatting for other statuses
  return status
    .replace(/[_-]/g, " ")
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}