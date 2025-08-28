import type { StatusColorScheme } from "@/components/ui/status-badge";

/**
 * Determine the badge color scheme for a payment status.
 *
 * Normalizes `status` (trim + lowercase). If `status` is null/undefined/empty returns `"gray"`.
 * Maps common status keywords to color schemes:
 * - `"green"`: paid/completed (e.g., `paid`, `completed`, `success`, `settled`, `processed`)
 * - `"red"`: not paid/failed (e.g., `not paid`, `not_paid`, `failed`, `declined`, `error`, `rejected`, `cancelled`, `reversed`, `unpaid`)
 * - `"yellow"`: pending/processing (e.g., `pending`, `processing`, `hold`, `review`)
 * - `"blue"`: scheduled/future (e.g., `scheduled`, `upcoming`, `draft`)
 * - `"orange"`: partial/incomplete (e.g., `partial`, `incomplete`, `disputed`)
 * - `"purple"`: refunded/returned (e.g., `refunded`, `returned`)
 * Unknown statuses default to `"gray"`.
 *
 * @param status - The payment status to evaluate; may be null or undefined.
 * @returns The StatusColorScheme corresponding to the provided status.
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
 * Convert a raw payment status string into a human-friendly, title-cased label.
 *
 * Returns "Unknown" for null/undefined/empty input. Common special cases are
 * normalized first: `"not paid"` and `"not_paid"` -> "Not Paid", `"paid"` -> "Paid".
 * For other values, underscores and hyphens are replaced with spaces and each
 * word is capitalized (e.g., `"payment_pending"` -> "Payment Pending").
 *
 * @param status - The raw payment status (may be null or undefined)
 * @returns A display-ready, human-readable status string
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