import { differenceInDays, isAfter, isBefore, isToday, startOfDay } from "date-fns";
import type { Ticket } from "../table/types";

export type ReminderStatus = "overdue" | "due-today" | "upcoming" | "no-reminder";

export function getReminderStatus(ticket: Ticket): ReminderStatus {
	if (!ticket.reminder_date) return "no-reminder";

	const reminderDate = new Date(ticket.reminder_date);
	const today = startOfDay(new Date());
	const reminderDay = startOfDay(reminderDate);

	// Check if ticket is resolved/closed
	if (ticket.status === "resolved" || ticket.status === "closed") {
		return "no-reminder";
	}

	// Overdue
	if (isBefore(reminderDay, today)) {
		return "overdue";
	}

	// Due today
	if (isToday(reminderDate)) {
		return "due-today";
	}

	// Upcoming
	return "upcoming";
}

export function shouldShowTicket(ticket: Ticket, hideSnoozed = false): boolean {
	if (!hideSnoozed) return true;

	const status = getReminderStatus(ticket);
	// Show if no reminder, overdue, or due today
	return status === "no-reminder" || status === "overdue" || status === "due-today";
}

export function getReminderDaysText(ticket: Ticket): string | null {
	if (!ticket.reminder_date) return null;

	const reminderDate = new Date(ticket.reminder_date);
	const today = startOfDay(new Date());
	const reminderDay = startOfDay(reminderDate);
	const daysDiff = differenceInDays(reminderDay, today);

	if (daysDiff < 0) {
		const daysOverdue = Math.abs(daysDiff);
		return daysOverdue === 1 ? "1 day overdue" : `${daysOverdue} days overdue`;
	}

	if (daysDiff === 0) {
		return "Due today";
	}

	if (daysDiff === 1) {
		return "Due tomorrow";
	}

	return `Due in ${daysDiff} days`;
}

export function sortTicketsByReminder(tickets: Ticket[]): Ticket[] {
	return [...tickets].sort((a, b) => {
		const statusA = getReminderStatus(a);
		const statusB = getReminderStatus(b);

		// Priority order: overdue > due-today > upcoming > no-reminder
		const priorityMap: Record<ReminderStatus, number> = {
			"overdue": 0,
			"due-today": 1,
			"upcoming": 2,
			"no-reminder": 3,
		};

		if (priorityMap[statusA] !== priorityMap[statusB]) {
			return priorityMap[statusA] - priorityMap[statusB];
		}

		// Within same status, sort by date
		if (a.reminder_date && b.reminder_date) {
			return new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime();
		}

		// Fall back to created_at
		if (a.created_at && b.created_at) {
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		}
		return 0;
	});
}