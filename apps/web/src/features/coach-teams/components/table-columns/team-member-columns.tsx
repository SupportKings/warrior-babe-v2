import { Badge } from "@/components/ui/badge";

import { getContractTypeBadgeClass } from "@/features/coaches/utils";

import { createColumnHelper } from "@tanstack/react-table";
import { Edit, EyeIcon, Trash2 } from "lucide-react";

export const createTeamMemberColumns = () => {
  const teamMemberColumnHelper = createColumnHelper<any>();
  return [
    // Coach name
    teamMemberColumnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue() || "Unknown",
    }),

    // Email from related user
    teamMemberColumnHelper.accessor("user.email", {
      header: "Email",
      cell: (info) => info.getValue() || "No email",
    }),

    // Roles (stored as comma-separated string in contract_type)
    teamMemberColumnHelper.accessor("user.role", {
      header: "Roles",
      cell: (info) => {
        const roles = info.getValue();
        console.log(roles);
        if (!roles) return <span className="text-muted-foreground">—</span>;

        // Split comma-separated roles and display as badges
        const roleArray = roles.split(",");
        return (
          <div className="flex flex-wrap gap-1">
            {roleArray.map((role: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs capitalize"
              >
                {role.split("_").join(" ")}
              </Badge>
            ))}
          </div>
        );
      },
    }),

    // Contract Type (same as roles but as single badge)
    teamMemberColumnHelper.accessor("contract_type", {
      header: "Contract Type",
      cell: (info) => {
        const contractType = info.getValue();
        if (!contractType)
          return <span className="text-muted-foreground">—</span>;

        const badgeClass = getContractTypeBadgeClass(contractType);

        return (
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-semibold text-xs ${badgeClass}`}
          >
            {contractType}
          </span>
        );
      },
    }),
  ];
};

export const createTeamMemberRowActions = (
  setDeleteModal: any,
  viewDetails: any
) => [
  {
    label: "View Details",
    icon: EyeIcon,
    onClick: (teamMember: any) => {
      viewDetails(teamMember.id);
    },
  },
  {
    label: "Remove from Team",
    icon: Trash2,
    variant: "destructive" as const,
    onClick: (teamMember: any) => {
      setDeleteModal({
        isOpen: true,
        type: "team_member",
        id: teamMember.id,
        title: `Remove ${teamMember.name || "Unknown"} from team`,
      });
    },
  },
];
