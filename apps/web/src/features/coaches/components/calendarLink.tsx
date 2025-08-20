"use client";

import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIconWrapper,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Copy, Edit, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import EditCalendarLinkDialog from "./edit-calendar-link-dialog";

interface CalendarLinkProps {
  calendarUrl: string | null;
  userId: string;
  isEditable?: boolean;
}

export default function CalendarLink({
  calendarUrl,
  userId,
  isEditable = false,
}: CalendarLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCopyLink = async () => {
    if (!calendarUrl) {
      toast.error("No calendar link to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(calendarUrl);
      toast.success("Calendar link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  if (!calendarUrl) {
    return isEditable ? (
      <>
        <button
          type="button"
          onClick={handleEdit}
          className="relative m-px flex h-7 cursor-pointer items-center gap-1 overflow-hidden text-ellipsis rounded-[5px] border border-muted-foreground/30 border-dashed bg-muted/50 px-1.5 py-[3px] align-baseline text-muted-foreground transition-all duration-150 hover:bg-muted"
        >
          <Edit className="h-4 w-4" />
          <span className="m-0 overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 text-left align-baseline font-medium text-[13px]">
            Add Calendar Link
          </span>
        </button>
        <EditCalendarLinkDialog
          userId={userId}
          currentUrl={calendarUrl}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      </>
    ) : null;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        rel="noopener noreferrer"
        className="relative m-px flex h-7 cursor-pointer items-center gap-1 overflow-hidden text-ellipsis rounded-[5px] border-0 bg-[lch(91.417_0_282.863)] px-1.5 py-[3px] align-baseline text-[lch(9.723_0_282.863)] no-underline transition-all duration-150 [-webkit-box-align:center] hover:bg-[lch(85_0_282.863)]"
        href={calendarUrl}
        target="_blank"
      >
        <div className="m-0 self-center border-0 p-0 align-baseline leading-[0]">
          <div className="m-0 flex min-w-4 justify-center border-0 p-0 align-baseline text-[lch(38.893_1_282.863)] [-webkit-box-pack:center]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              fill="lch(38.893% 1 282.863 / 1)"
              viewBox="0 0 16 16"
              height="16"
              width="16"
              className=""
            >
              <path d="M9.30558 10.206C9.57224 10.4726 9.59447 10.8912 9.37225 11.1831L9.30558 11.2594L6.84751 13.7175C5.58692 14.9781 3.54311 14.9781 2.28252 13.7175C1.0654 12.5004 1.02344 10.5531 2.15661 9.28564L2.28252 9.15251L4.74059 6.69443C5.0315 6.40353 5.50315 6.40353 5.79405 6.69443C6.06071 6.9611 6.08294 7.37963 5.86072 7.67161L5.79405 7.74789L3.33598 10.206C2.6572 10.8847 2.6572 11.9853 3.33598 12.664C3.98082 13.3089 5.00628 13.3411 5.68918 12.7608L5.79405 12.664L8.25212 10.206C8.54303 9.91506 9.01468 9.91506 9.30558 10.206ZM9.82982 6.17019C10.1207 6.46109 10.1207 6.93274 9.82982 7.22365L7.34921 9.70427C7.0583 9.99518 6.58665 9.99518 6.29575 9.70427C6.00484 9.41337 6.00484 8.94172 6.29575 8.65081L8.77637 6.17019C9.06727 5.87928 9.53892 5.87928 9.82982 6.17019ZM13.7175 2.2825C14.9346 3.49962 14.9766 5.44688 13.8434 6.71436L13.7175 6.84749L11.2594 9.30557C10.9685 9.59647 10.4969 9.59647 10.206 9.30557C9.93931 9.03891 9.91709 8.62037 10.1393 8.32839L10.206 8.25211L12.664 5.79403C13.3428 5.11525 13.3428 4.01474 12.664 3.33596C12.0192 2.69112 10.9938 2.65888 10.3109 3.23923L10.206 3.33596L7.74791 5.79403C7.457 6.08494 6.98535 6.08494 6.69445 5.79403C6.42779 5.52737 6.40556 5.10883 6.62778 4.81686L6.69445 4.74057L9.15252 2.2825C10.4131 1.02191 12.4569 1.02191 13.7175 2.2825Z" />
            </svg>
          </div>
        </div>
        <span className="m-0 overflow-hidden text-ellipsis whitespace-nowrap border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(19.446_1_282.863)]">
          Calendar Link
        </span>

        {/* Arrow SVG that fades out on hover - positioned on the far right */}
        <div className="ml-auto flex h-6 w-6 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="img"
            fill="lch(64.173% 1 282.863 / 1)"
            viewBox="0 0 16 16"
            height="16"
            width="16"
            className={`transition-opacity duration-150 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          >
            <path d="M7.184 3.894a.75.75 0 0 0-.136 1.494l2.295.209-4.879 4.878a.75.75 0 0 0 1.061 1.06l4.878-4.878.209 2.295a.75.75 0 1 0 1.494-.136l-.354-3.89a.75.75 0 0 0-.679-.678l-3.889-.354Z" />
          </svg>
        </div>

        {/* Dropdown menu that appears on hover */}
        <div
          className={`absolute top-0 right-0 flex h-6 w-6 items-center justify-center transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative m-0 inline-flex h-6 w-6 min-w-0 shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-[3px] border-[0.5px] border-transparent border-solid bg-transparent px-0 py-0 align-top font-medium text-[lch(19.446_1_282.863)] text-[lch(64.173_1_282.863)] text-xs shadow-none transition-[border,background-color,color,opacity] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] before:absolute before:inset-[-5px] before:content-[''] disabled:cursor-default disabled:opacity-60"
                aria-label="Menu"
              >
                <span
                  className="m-0 inline-flex max-h-4 max-w-4 items-center justify-center border-0 p-0 align-baseline transition-[fill,stroke] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center]"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    role="img"
                    fill="lch(38.893% 1 282.863 / 1)"
                    viewBox="0 0 16 16"
                    height="12"
                    width="12"
                    className=""
                  >
                    <path d="M3 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                  </svg>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleCopyLink}>
                <DropdownMenuIconWrapper>
                  <Copy className="h-4 w-4" />
                </DropdownMenuIconWrapper>
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                  <DropdownMenuIconWrapper>
                    <ExternalLink className="h-4 w-4" />
                  </DropdownMenuIconWrapper>
                  Open Link
                </a>
              </DropdownMenuItem>
              {isEditable && (
                <DropdownMenuItem onClick={handleEdit}>
                  <DropdownMenuIconWrapper>
                    <Edit className="h-4 w-4" />
                  </DropdownMenuIconWrapper>
                  Edit
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </a>
      {isEditable && (
        <EditCalendarLinkDialog
          userId={userId}
          currentUrl={calendarUrl}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </div>
  );
}
