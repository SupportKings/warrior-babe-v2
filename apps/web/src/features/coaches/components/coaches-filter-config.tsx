import { createUniversalColumnHelper } from "@/components/universal-data-table/utils/column-helpers";

import {
	CalendarIcon,
	FileTextIcon,
	MailIcon,
	TagIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import type { CoachRow } from "../types";

// Filter configuration using universal column helper
const universalColumnHelper = createUniversalColumnHelper<CoachRow>();

export const coachesFilterConfig = [
	universalColumnHelper.text("name").displayName("Name").icon(UserIcon).build(),
	universalColumnHelper
		.text("email")
		.displayName("Email")
		.icon(MailIcon)
		.build(),
	universalColumnHelper
		.option("user")
		.displayName("User Role")
		.icon(TagIcon)
		.build(),
	universalColumnHelper
		.option("premier_coach_id")
		.displayName("Premier Coach")
		.icon(UsersIcon)
		.build(),
	universalColumnHelper
		.option("contract_type")
		.displayName("Contract Type")
		.icon(FileTextIcon)
		.build(),
	universalColumnHelper
		.date("created_at")
		.displayName("Created Date")
		.icon(CalendarIcon)
		.build(),
];
