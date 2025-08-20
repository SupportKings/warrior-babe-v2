import { createColumnConfigHelper } from "@/components/data-table-filter/core/filters";
import {
  UserIcon,
  BuildingIcon,
  BriefcaseIcon,
  PackageIcon,
  ActivityIcon,
  CalendarIcon,
  PercentIcon,
} from "lucide-react";

export interface ClientTableRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string | null;
  product: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  start_date: string;
  days_in_status: number;
  assignments: any[];
  client_onboarding_progress: any[];
}

const dtf = createColumnConfigHelper<ClientTableRow>();

export const clientColumnsConfig = [
  dtf
    .text()
    .id("name")
    .accessor((row) => `${row.first_name} ${row.last_name}`)
    .displayName("Name")
    .icon(UserIcon)
    .build(),

  dtf
    .text()
    .id("email")
    .accessor((row) => row.email)
    .displayName("Email")
    .icon(UserIcon)
    .build(),

  dtf
    .option()
    .accessor((row) => row.status)
    .id("status")
    .displayName("Status")
    .icon(ActivityIcon)
    .build(),

  dtf
    .option()
    .accessor((row) => row.product?.name)
    .id("product")
    .displayName("Product")
    .icon(PackageIcon)
    .build(),

  dtf
    .date()
    .accessor((row) => row.start_date)
    .id("start_date")
    .displayName("Start Date")
    .icon(CalendarIcon)
    .build(),

  dtf
    .number()
    .accessor((row) => {
      const completedCheckpoints = row.client_onboarding_progress?.filter(
        (checkpoint: any) => checkpoint.is_completed
      ).length || 0;
      const totalCheckpoints = row.client_onboarding_progress?.length || 1;
      return Math.round((completedCheckpoints / totalCheckpoints) * 100);
    })
    .id("onboarding_progress")
    .displayName("Onboarding Progress")
    .icon(PercentIcon)
    .min(0)
    .max(100)
    .build(),

  dtf
    .number()
    .accessor((row) => row.assignments?.length || 0)
    .id("team_size")
    .displayName("Team Size")
    .icon(UserIcon)
    .min(0)
    .max(10)
    .build(),
] as const;