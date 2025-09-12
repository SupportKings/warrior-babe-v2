import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set";
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
};

interface ActivityPeriodColumnOptions {
  onStatusChange?: (id: string, active: boolean) => void;
}

// Separate component for the status cell to ensure proper state management
const StatusCell = React.memo(({ 
  value, 
  rowId, 
  onStatusChange 
}: { 
  value: boolean; 
  rowId: string; 
  onStatusChange?: (id: string, active: boolean) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(value);
  
  // Update local state when value prop changes
  React.useEffect(() => {
    setStatus(value);
  }, [value]);
  
  const handleStatusChange = async (newValue: string) => {
    const newStatus = newValue === "active";
    setStatus(newStatus);
    setIsEditing(false);
    
    // Call the callback if provided
    if (onStatusChange) {
      onStatusChange(rowId, newStatus);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  if (isEditing) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Select 
          value={status ? "active" : "inactive"}
          onValueChange={handleStatusChange}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditing(false);
            }
          }}
          defaultOpen
        >
          <SelectTrigger className="h-8 w-full border-primary/50 focus:ring-2 focus:ring-primary/20" onClick={(e) => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem value="active" className="cursor-pointer">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Active
              </span>
            </SelectItem>
            <SelectItem value="inactive" className="cursor-pointer">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                Inactive
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer inline-flex items-center gap-1.5 group hover:opacity-80 transition-all duration-200"
      title="Click to change status"
    >
      <div className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${status 
          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800" 
          : "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-800"
        }
      `}>
        {status ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Active
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-gray-400"></span>
            Inactive
          </>
        )}
      </div>
      <Edit2 className="h-3 w-3 text-muted-foreground transition-opacity duration-200" />
    </div>
  );
});

StatusCell.displayName = "StatusCell";

export const createActivityPeriodColumns = (options?: ActivityPeriodColumnOptions) => {
  const activityPeriodColumnHelper = createColumnHelper<any>();
  
  return [
    activityPeriodColumnHelper.accessor("client_name", {
      header: "Client",
      cell: (info) => info.getValue() || "Unknown",
    }),
    
    activityPeriodColumnHelper.accessor("payment_plan_name", {
      header: "Payment Plan",
      cell: (info) => info.getValue() || "No Plan",
    }),

    activityPeriodColumnHelper.accessor("start_date", {
      header: "Start Date",
      cell: (info) => formatDate(info.getValue()),
    }),

    activityPeriodColumnHelper.accessor("end_date", {
      header: "End Date",
      cell: (info) => formatDate(info.getValue()),
    }),

    activityPeriodColumnHelper.accessor("active", {
      header: "Status",
      cell: (info) => (
        <StatusCell 
          value={info.getValue()} 
          rowId={info.row.original.id}
          onStatusChange={options?.onStatusChange}
        />
      ),
    }),
  ];
};
