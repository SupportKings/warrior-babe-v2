import { createColumnConfigHelper } from "@/components/data-table-filter/core/filters";

import {
  BookOpenIcon,
  HashIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import type { CoachTableRow } from "../../../coaches/types/coach";

const dtf = createColumnConfigHelper<CoachTableRow>();

export const capacityColumnsConfig = [
  dtf
    .text()
    .id("name")
    .accessor((row) => row.name)
    .displayName("Coach Name")
    .icon(UserIcon)
    .build(),

  dtf
    .option()
    .accessor((row) => row.type)
    .id("type")
    .displayName("Type")
    .icon(ShieldCheckIcon)
    .build(),

  dtf
    .option()
    .accessor((row) => row.specialization)
    .id("specialization")
    .displayName("Specialization")
    .icon(BookOpenIcon)
    .build(),

  dtf
    .number()
    .accessor((row) => row.activeClients)
    .id("activeClients")
    .displayName("Active Clients")
    .icon(HashIcon)
    .min(0)
    .max(50)
    .build(),
] as const;