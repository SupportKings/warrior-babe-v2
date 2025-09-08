import { createColumnHelper } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
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
          <SelectTrigger className="h-7 w-24" onClick={(e) => e.stopPropagation()}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer inline-block"
    >
      <StatusBadge>
        {status ? "Active" : "Inactive"}
      </StatusBadge>
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
