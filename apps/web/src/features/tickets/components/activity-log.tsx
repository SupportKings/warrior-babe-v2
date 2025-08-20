import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TimeDisplay } from "@/components/ui/time-display";

import type {
  ActivityItem,
  AuditLog,
  CoachComment,
  TicketComment,
} from "@/features/shared/types/activity";
import { useUsers } from "@/features/team/queries/useUsers";

// Import priority and status icons
import {
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  NoPriorityIcon,
  UrgentPriorityIcon,
} from "@/icons/priority";
import {
  InProgressIcon,
  OpenIcon,
  ResolvedIcon,
  UnclaimedIcon,
} from "@/icons/status";

import { CircleDot, CirclePause } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CommentItem } from "./comment-item";

type GenericActivityItem = ActivityItem;
type CommentType = TicketComment | CoachComment;

interface ActivityLogProps {
  items: GenericActivityItem[];
  entityType?: "ticket" | "coach";
}

// Helper function to get priority icon
const getPriorityIcon = (priority: string) => {
  const iconMap: Record<string, React.FC<any>> = {
    low: LowPriorityIcon,
    medium: MediumPriorityIcon,
    high: HighPriorityIcon,
    urgent: UrgentPriorityIcon,
    "no-priority": NoPriorityIcon,
  };
  return iconMap[priority] || NoPriorityIcon;
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  const iconMap: Record<string, React.FC<any>> = {
    open: OpenIcon,
    in_progress: InProgressIcon,
    resolved: ResolvedIcon,
    closed: CircleDot,
    paused: CirclePause,
    "no-status": UnclaimedIcon,
  };
  return iconMap[status] || UnclaimedIcon;
};

// Helper function to get user initials
const getUserInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function ActivityIcon({ item }: { item: GenericActivityItem }) {
  // Handle comments
  if (item.type === "comment") {
    const comment = item.data as CommentType;
    return (
      <div className="m-0 inline-flex flex-row border-0 p-0 align-baseline">
        <div className="relative m-0 flex aspect-[1/1] h-3.5 w-3.5 shrink-0 cursor-default items-center justify-center border-0 p-0 align-baseline text-[lch(9.723_0_282.863)] leading-[0] no-underline transition-[color] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] dark:text-[lch(100_0_272)]">
          <Avatar
            className="h-full w-full rounded-full"
            title={comment.user.name}
          >
            <AvatarImage
              src={comment.user.image || undefined}
              alt={comment.user.name}
            />
            <AvatarFallback className="text-xs">
              {comment.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // Handle activities
  const log = item.data as AuditLog;
  if (log.changed_by_user) {
    return (
      <div className="m-0 inline-flex flex-row border-0 p-0 align-baseline">
        <div
          className="relative m-0 flex aspect-[1/1] h-3.5 w-3.5 shrink-0 cursor-default items-center justify-center border-0 p-0 align-baseline text-[lch(9.723_0_282.863)] leading-[0] no-underline transition-[color] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] dark:text-[lch(100_0_272)]"
          tabIndex={-1}
        >
          <Avatar
            className="h-full w-full rounded-full"
            title={log.changed_by_user.name}
          >
            <AvatarImage
              src={log.changed_by_user.image || undefined}
              alt={log.changed_by_user.name}
            />
            <AvatarFallback className="text-xs">
              {log.changed_by_user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // Default icon for system actions or unknown users
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      fill="lch(38.893% 1 282.863 / 1)"
      className="dark:fill-[lch(62.6%_1.35_272_/_1)]"
      viewBox="0 0 16 16"
      height="14"
      width="14"
    >
      <path
        d="M8.80596 1.18963C10 0.467371 9.5 1.97074 9.5 2.97299C9.5 3.97525 10.5 5.45947 11 5.97974C11.5 6.5 12 6.98199 12 6.98199C12.8575 7.87856 13 8.98398 13 9.98874V10.0159C13 12.7685 10.7614 15 8 15C5.23858 15 3 12.7685 3 10.0159C3 9 3.31522 8.48521 3.25 7.5C3.21077 6.90743 3 6.5 3 6C3 5.15486 4.34867 5.95895 5 6.5L6 7.45656V5.53023C6 4.11834 6.66687 2.78883 7.8 1.94169L8.80596 1.18963ZM8 13.9978C9.25 13.9978 10.5 13.5604 10.5 11.811C10.5 10.4429 9.48069 9.09715 8.63778 8.40117C8.35964 8.17151 8 8.38851 8 8.74969V10.4989C8 10.8601 7.63032 11.1027 7.30003 10.9582L6.19997 10.4771C5.86968 10.3327 5.49618 10.5754 5.51681 10.936C5.58908 12.1989 5.9719 13.9978 8 13.9978Z"
        clipRule="evenodd"
        fillRule="evenodd"
      />
    </svg>
  );
}

function ActivityMessage({
  item,
  entityType = "ticket",
}: {
  item: GenericActivityItem;
  entityType?: "ticket" | "coach";
}) {
  const { data: usersData } = useUsers(true);

  const renderUserInfo = (userId: string) => {
    const user = usersData?.users?.find((u) => u.id === userId);
    if (!user) return <span className="text-gray-400">Unknown User</span>;

    return (
      <span className="inline-flex items-center gap-1">
        <Avatar className="h-4 w-4">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="text-[0.5rem]">
            {getUserInitials(user.name || user.email || "U")}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{user.name || user.email}</span>
      </span>
    );
  };

  const renderUserLink = (user: { id: string; name: string }) => (
    <div
      className="focus-visible:-outline-offset-1 m-0 cursor-default overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 align-baseline text-[currentcolor] no-underline transition-[color] duration-[0.15s] hover:text-[lch(19.446_1_282.863)] dark:hover:text-[lch(90.65_1.35_272)]"
      tabIndex={-1}
    >
      <span className="m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 align-baseline">
        {user.name}
      </span>
    </div>
  );

  // Handle comments - return null here as we'll render them differently
  if (item.type === "comment") {
    return null;
  }

  // Handle activities
  const log = item.data as AuditLog;
  const formatActionMessage = () => {
    const action = log.action;
    const newValues = (log.new_values as Record<string, any>) || {};
    const oldValues = (log.old_values as Record<string, any>) || {};

    if (action === "INSERT") {
      return `created this ${entityType}`;
    }

    if (action === "UPDATE") {
      const changes = [];

      if (
        newValues.title !== undefined &&
        newValues.title !== oldValues.title
      ) {
        changes.push("updated the title");
      }
      if (
        newValues.description !== undefined &&
        newValues.description !== oldValues.description
      ) {
        changes.push("updated the description");
      }
      if (
        newValues.priority !== undefined &&
        newValues.priority !== oldValues.priority
      ) {
        const PriorityIcon = getPriorityIcon(newValues.priority);
        changes.push(
          <span key="priority" className="inline-flex items-center gap-1">
            changed priority to <PriorityIcon className="h-3 w-3" />{" "}
            <span className="font-medium">
              {newValues.priority.charAt(0).toUpperCase() +
                newValues.priority.slice(1)}
            </span>
          </span>
        );
      }
      if (
        newValues.status !== undefined &&
        newValues.status !== oldValues.status
      ) {
        const StatusIcon = getStatusIcon(newValues.status);
        const statusText = newValues.status.replace("_", " ");
        changes.push(
          <span key="status" className="inline-flex items-center gap-1">
            changed status to <StatusIcon className="h-3 w-3" />{" "}
            <span className="font-medium">
              {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
            </span>
          </span>
        );
      }
      if (
        newValues.assigned_to !== undefined &&
        newValues.assigned_to !== oldValues.assigned_to
      ) {
        if (newValues.assigned_to === null) {
          changes.push(`unassigned the ${entityType}`);
        } else {
          changes.push(
            <span key="assigned" className="inline-flex items-center gap-1">
              assigned the {entityType} to{" "}
              {renderUserInfo(newValues.assigned_to)}
            </span>
          );
        }
      }
      if (
        newValues.is_executive !== undefined &&
        newValues.is_executive !== oldValues.is_executive
      ) {
        changes.push(
          newValues.is_executive
            ? "marked as executive escalation"
            : "removed executive escalation"
        );
      }

      if (changes.length === 0) return `updated the ${entityType}`;

      return (
        <>
          {changes.map((change, index) => (
            <span
              key={`change-${index}-${
                typeof change === "string" ? change : "complex"
              }`}
            >
              {change}
              {index < changes.length - 1 && ", "}
            </span>
          ))}
        </>
      );
    }

    return "performed an action";
  };

  return (
    <span className="m-0 overflow-hidden border-0 p-0 text-left align-baseline font-[450] text-[lch(38.893_1_282.863)] text-xs leading-[1.4] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] [display:-webkit-box] [overflow-wrap:anywhere] [word-break:break-word] dark:text-[lch(62.6_1.35_272)]">
      {log.changed_by_user && (
        <b className="m-0 border-0 p-0 align-baseline font-medium text-[currentcolor]">
          <div className="m-0 inline-flex flex-row border-0 p-0 align-baseline">
            {renderUserLink(log.changed_by_user)}
          </div>
        </b>
      )}
      {log.changed_by_user && " "}
      {formatActionMessage()}
      <span className="m-0 inline-block w-3 border-0 p-0 text-center align-baseline font-semibold last:hidden">
        ·
      </span>
      <div className="m-0 inline-block flex-row border-0 p-0 align-baseline">
        <TimeDisplay
          timestamp={item.timestamp}
          className="focus-visible:-outline-offset-1 m-0 shrink-0 cursor-default border-0 p-0 align-baseline text-[lch(38.893_1_282.863)] text-xs no-underline transition-[color] duration-[0.15s] hover:text-[lch(19.446_1_282.863)] dark:text-[lch(62.6_1.35_272)] dark:hover:text-[lch(90.65_1.35_272)]"
        />
      </div>
    </span>
  );
}

export function ActivityLog({
  items,
  entityType = "ticket",
}: ActivityLogProps) {
  if (!items || items.length === 0) {
    return (
      <div className="relative m-0 border-0 pt-0 pr-2.5 pb-2 pl-0 align-baseline">
        <p className="text-gray-500 text-sm dark:text-[lch(62.6_1.35_272)]">
          No activity recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative m-0 border-0 pt-0 pr-2.5 pb-2 pl-0 align-baseline">
      <div className="absolute top-3.5 bottom-7 left-[17px] m-0 w-[0.5px] border-0 bg-[lch(83.025_0_282.863)] p-0 align-baseline dark:bg-[lch(19_3.54_272)]" />
      <AnimatePresence>
        {items.map((item) => {
          // Render comments with the new CommentItem component
          if (item.type === "comment") {
            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
                layout
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  layout: {
                    duration: 0.25,
                    ease: "easeOut",
                  },
                }}
                className="m-0 h-auto border-0 p-0 align-baseline"
              >
                <CommentItem
                  comment={item.data as CommentType}
                  timestamp={item.timestamp}
                />
              </motion.div>
            );
          }

          // Render activities with the existing styling
          return (
            <motion.div
              key={item.id}
              initial={false}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              layout
              transition={{
                duration: 0.2,
                ease: "easeOut",
                layout: {
                  duration: 0.25,
                  ease: "easeOut",
                },
              }}
              className="m-0 h-auto border-0 p-0 align-baseline"
            >
              <div className="relative my-0 mr-0 ml-[-0.5px] flex flex-col gap-[18px] border-0 px-0 pt-0 pb-2 align-baseline">
                <div
                  className="m-0 flex min-w-0 items-start rounded border-0 px-0 py-px align-baseline"
                  data-history-entry-id={item.id}
                >
                  <div className="relative z-[2] mx-[11px] my-0 flex h-auto w-3.5 shrink-0 flex-col items-center border-0 bg-[lch(99_0_282.863)] px-0 py-[3px] align-baseline [-webkit-box-align:center] dark:bg-[lch(4.8_0.7_272)]">
                    <ActivityIcon item={item} />
                  </div>
                  <div className="m-0 flex min-w-0 flex-auto flex-col border-0 px-0 py-px align-baseline">
                    <ActivityMessage item={item} entityType={entityType} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
