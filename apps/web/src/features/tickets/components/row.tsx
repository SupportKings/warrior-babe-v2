import React from "react";

import { Link } from "@/components/fastLink";

import { priorities } from "@/icons/priority";
import { status } from "@/icons/status";

interface TicketRowProps {
  id: string;
  title: string;
  priority: string;
  status: string;
  assignedTo?: {
    name: string;
    image?: string;
  };
  createdAt: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const Row = ({
  id,
  title,
  priority,
  status: statusId,
  assignedTo,
  createdAt,
  isSelected = false,
  onSelect,
}: TicketRowProps) => {
  const priorityData = priorities.find((p) => p.id === priority);
  const statusData = status.find((s) => s.id === statusId);

  const PriorityIcon = priorityData?.icon;
  const StatusIcon = statusData?.icon;

  return (
    <Link
      href={`/dashboard/tickets/${id}`}
      className="sVpyBw m-0 flex h-full min-h-9 flex-col items-center justify-center border-0 py-0 pr-6 pl-2.5 align-baseline outline-offset-[-3px] [-webkit-box-align:center] [-webkit-box-pack:center]"
      data-contextual-menu="true"
    >
      <div className="m-0 flex w-full flex-row items-center border-0 p-0 align-baseline [-webkit-box-align:center]">
        <div className="IFnVch m-0 flex shrink-0 flex-row items-center border-0 p-0 align-baseline opacity-0 [-webkit-box-align:center] hover:opacity-100" />

        {/* Priority Icon */}
        <div
          data-menu-open="false"
          className="my-0 mr-0 ml-2 flex h-9 shrink-0 flex-row items-center border-0 p-0 align-baseline [-webkit-box-align:center]"
        >
          {PriorityIcon && React.createElement(PriorityIcon, { className: "" })}
        </div>

        {/* Ticket ID */}
        <span
          className="my-0 mr-0 ml-2 min-w-[49px] shrink-0 border-0 p-0 text-left align-baseline font-[450] text-[13px] text-[lch(38.893_1_282.863)]"
          data-column-id="issueId"
        >
          <span className="m-0 inline-block border-0 p-0 align-baseline tracking-[-0.02em] [font-feature-settings:'tnum','cpsp','calt']">
            {id}
          </span>
        </span>

        {/* Status Icon */}
        <div
          data-menu-open="false"
          className="my-0 mr-0 ml-2 flex h-9 shrink-0 flex-row items-center border-0 p-0 align-baseline [-webkit-box-align:center]"
        >
          {StatusIcon &&
            React.createElement(StatusIcon, { className: "color-override" })}
        </div>

        {/* Title */}
        <span className="my-0 mr-0 ml-2 flex min-w-0 shrink flex-row items-center border-0 p-0 align-baseline [-webkit-box-align:center]">
          <span
            title={title}
            className="m-0 overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(9.723_0_282.863)]"
          >
            {title}
          </span>
        </span>

        {/* Follow-up Date (placeholder for now) */}
        <div className="NEuStT my-0 mr-0 ml-2 flex h-auto min-w-[60px] shrink-[1.5] grow flex-row items-center justify-between gap-[3px] overflow-hidden rounded-[50px] border-0 p-0 align-baseline transition-[flex-shrink] duration-[0.25s] ease-[cubic-bezier(.38,0.01,0.33,1)] [-webkit-box-align:center] [-webkit-box-flex:1] [-webkit-box-pack:justify] hover:max-w-[initial] hover:shrink-0">
          <div className="m-0 flex min-w-0 grow flex-row border-0 p-0 align-baseline [-webkit-box-flex:1] last:shrink-[1e-06]" />
          <div
            data-menu-open="false"
            className="m-0 flex min-w-0 shrink-[1e-06] flex-row border-0 p-0 align-baseline transition-[visibility] delay-[0.3s] duration-[linear,opacity]"
          >
            <div
              className="qSPdNC z-0 m-0 flex h-[27px] min-w-[auto] max-w-28 shrink flex-row items-center overflow-hidden rounded-[48px] border-[0.5px] border-solid bg-[lch(99_0_282.863)] px-2 py-0 align-baseline transition-[border,color,background-color] duration-[0.15s] [-webkit-box-align:center]"
              data-disabled="false"
            >
              <div className="m-0 flex h-3.5 w-3.5 shrink-0 flex-row items-center justify-center border-0 p-0 align-baseline [-webkit-box-align:center] [-webkit-box-pack:center]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  fill="lch(38.893% 1 282.863 / 1)"
                  viewBox="0 0 16 16"
                  height="16"
                  width="16"
                  className="sc-gfTGJv bUzBTx"
                >
                  <path d="M11 1C13.2091 1 15 2.79086 15 5V11C15 13.2091 13.2091 15 11 15H5C2.79086 15 1 13.2091 1 11V5C1 2.79086 2.79086 1 5 1H11ZM13.5 6H2.5V11C2.5 12.3807 3.61929 13.5 5 13.5H11C12.3807 13.5 13.5 12.3807 13.5 11V6Z" />
                </svg>
              </div>
              <span className="my-0 mr-px ml-1.5 overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 text-left align-baseline font-[450] text-[lch(38.893_1_282.863)] text-xs only:my-0 only:mr-[3px] only:ml-px">
                Tomorrow
              </span>
            </div>
          </div>
        </div>

        {/* Assigned User Avatar */}
        <div
          data-menu-open="false"
          className="my-0 mr-0 ml-2 flex h-9 shrink-0 flex-row items-center border-0 p-0 align-baseline [-webkit-box-align:center]"
        >
          <div className="m-0 flex flex-row items-center border-0 p-0 align-baseline [-webkit-box-align:center]">
            <div className="m-0 flex max-h-[18px] max-w-[18px] border-0 p-0 align-baseline opacity-100 [transform:none]">
              <div className="relative m-0 flex aspect-[1/1] h-[18px] w-[18px] shrink-0 items-center justify-center border-0 p-0 align-baseline leading-[0] [-webkit-box-align:center] [-webkit-box-pack:center]">
                {assignedTo?.image ? (
                  <img
                    className="pointer-events-none m-0 h-full w-full shrink-0 rounded-[50%] border-0 object-cover p-0 align-baseline transition-[filter] duration-[0.15s] will-change-[filter] hover:brightness-[0.7]"
                    aria-label={assignedTo.name}
                    alt={`Avatar of ${assignedTo.name}`}
                    height="18"
                    width="18"
                    src={assignedTo.image}
                  />
                ) : (
                  <div className="pointer-events-none m-0 flex h-full w-full shrink-0 items-center justify-center rounded-[50%] border-0 bg-muted p-0 align-baseline font-medium text-xs">
                    {assignedTo?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Created Date */}
        <div
          className="my-0 mr-0 ml-2 flex shrink-0 flex-row items-center border-0 p-0 align-baseline [-webkit-box-align:center]"
          data-column-id="issueCreatedAt"
        >
          <span className="m-0 min-w-[41px] shrink-0 border-0 p-0 text-right align-baseline font-[450] text-[lch(38.893_1_282.863)] text-xs">
            {createdAt}
          </span>
        </div>
      </div>
    </Link>
  );
};
