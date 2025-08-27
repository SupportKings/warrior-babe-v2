import { db } from "./index";

// Auth tables
import { authUsers, authSessions, authAccounts, authVerifications, authPasskeys } from "./shadow/auth";

// Client tables
import { clients } from "./schema/clients/clients";
import { clientAssignments } from "./schema/clients/client-assignments";
import { clientActivityPeriods } from "./schema/clients/client-activity-periods";
import { clientGoals } from "./schema/clients/client-goals";
import { clientNps } from "./schema/clients/client-nps";
import { clientTestimonials } from "./schema/clients/client-testimonials";

// Coach tables
import { coachTeams } from "./schema/coach/coach-teams";
import { teamMembers } from "./schema/coach/team-members";
import { coachCapacity } from "./schema/coach/coach-capacity";

// Goal tables
import { goalCategories } from "./schema/goals/goal-categories";
import { goalTypes } from "./schema/goals/goal-types";

// Payment tables
import { payments } from "./schema/payments/payments";
import { paymentPlans } from "./schema/payments/payment-plans";
import { paymentSlots } from "./schema/payments/payment-slots";
import { paymentPlanTemplates } from "./schema/payments/payment-plan-templates";
import { paymentPlanTemplateItems } from "./schema/payments/payment-plan-template-items";
import { coachPayments } from "./schema/payments/coach-payments";

// Product tables
import { products } from "./schema/products/products";

// Win tables
import { clientWins } from "./schema/wins/client-wins";
import { winTags } from "./schema/wins/win-tags";
import { clientWinTags } from "./schema/wins/client-win-tags";

// System tables
import { auditLog } from "./schema/system/audit-log";
import { financialSettings } from "./schema/system/financial-settings";
import { roles } from "./schema/system/roles";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in reverse dependency order)
    console.log("🗑️  Clearing existing data...");
    await db.delete(clientWinTags);
    await db.delete(clientWins);
    await db.delete(winTags);
    await db.delete(coachPayments);
    await db.delete(paymentPlanTemplateItems);
    await db.delete(paymentPlanTemplates);
    await db.delete(paymentSlots);
    await db.delete(paymentPlans);
    await db.delete(payments);
    await db.delete(clientTestimonials);
    await db.delete(clientNps);
    await db.delete(clientGoals);
    await db.delete(clientActivityPeriods);
    await db.delete(clientAssignments);
    await db.delete(clients);
    await db.delete(goalTypes);
    await db.delete(goalCategories);
    await db.delete(products);
    await db.delete(coachCapacity);
    await db.delete(teamMembers);
    await db.delete(coachTeams);
    await db.delete(financialSettings);
    await db.delete(auditLog);
    await db.delete(roles);
    await db.delete(authPasskeys);
    await db.delete(authVerifications);
    await db.delete(authAccounts);
    await db.delete(authSessions);
    await db.delete(authUsers);

    // 1. Seed Auth Users (foundation)
    console.log("👤 Seeding auth users...");
    const userIds = [
      "user-admin-001",
      "user-coach-001", 
      "user-coach-002",
      "user-coach-003",
      "user-coach-004",
      "user-coach-005",
    ];

    await db.insert(authUsers).values([
      {
        id: userIds[0],
        name: "Admin User",
        email: "admin@warriorbabe.com",
        emailVerified: true,
        role: "Administrator, System Manager",
        banned: false,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
      },
      {
        id: userIds[1],
        name: "Sarah Johnson",
        email: "sarah.johnson@warriorbabe.com",
        emailVerified: true,
        role: "Premier Coach, Lead Coach",
        banned: false,
        bio: "Certified fitness coach with 8 years of experience specializing in strength training and nutrition.",
        calendar_link: "https://calendly.com/sarah-johnson",
        createdAt: new Date("2024-01-15T09:00:00Z"),
        updatedAt: new Date("2024-01-15T09:00:00Z"),
      },
      {
        id: userIds[2],
        name: "Mike Rodriguez",
        email: "mike.rodriguez@warriorbabe.com",
        emailVerified: true,
        role: "Coach, Fitness Specialist",
        banned: false,
        bio: "Former athlete turned coach, passionate about helping women achieve their fitness goals.",
        calendar_link: "https://calendly.com/mike-rodriguez",
        createdAt: new Date("2024-01-20T11:30:00Z"),
        updatedAt: new Date("2024-01-20T11:30:00Z"),
      },
      {
        id: userIds[3],
        name: "Emma Davis",
        email: "emma.davis@warriorbabe.com",
        emailVerified: true,
        role: "Coach, Nutrition Coach",
        banned: false,
        bio: "Registered dietitian and certified personal trainer focusing on sustainable lifestyle changes.",
        createdAt: new Date("2024-02-01T14:20:00Z"),
        updatedAt: new Date("2024-02-01T14:20:00Z"),
      },
      {
        id: userIds[4],
        name: "Alex Chen",
        email: "alex.chen@warriorbabe.com",
        emailVerified: true,
        role: "Premier Coach, Team Lead",
        banned: false,
        bio: "CrossFit Level 3 trainer with expertise in Olympic lifting and metabolic conditioning.",
        calendar_link: "https://calendly.com/alex-chen",
        createdAt: new Date("2024-02-10T16:45:00Z"),
        updatedAt: new Date("2024-02-10T16:45:00Z"),
      },
      {
        id: userIds[5],
        name: "Jessica Martinez",
        email: "jessica.martinez@warriorbabe.com",
        emailVerified: true,
        role: "Coach, Mindset Coach",
        banned: false,
        bio: "Psychology background with specialization in fitness mindset and habit formation.",
        createdAt: new Date("2024-02-15T08:15:00Z"),
        updatedAt: new Date("2024-02-15T08:15:00Z"),
      },
    ]);

    // 2. Seed System Tables
    console.log("⚙️  Seeding system tables...");
    
    // Roles
    const roleIds = ["role-001", "role-002", "role-003", "role-004"];
    await db.insert(roles).values([
      {
        id: roleIds[0],
        name: "Administrator",
        description: "Full system access and management capabilities",
        permissions: { 
          users: ["create", "read", "update", "delete"],
          clients: ["create", "read", "update", "delete"],
          payments: ["create", "read", "update", "delete"],
          system: ["configure"]
        },
      },
      {
        id: roleIds[1],
        name: "Premier Coach",
        description: "Senior coach with team leadership responsibilities",
        permissions: {
          clients: ["create", "read", "update"],
          team: ["manage", "assign"],
          goals: ["create", "read", "update"],
          wins: ["create", "read", "update"]
        },
      },
      {
        id: roleIds[2],
        name: "Coach",
        description: "Standard coaching role with client management",
        permissions: {
          clients: ["read", "update"],
          goals: ["create", "read", "update"],
          wins: ["create", "read", "update"]
        },
      },
      {
        id: roleIds[3],
        name: "Fitness Specialist",
        description: "Specialized role focusing on fitness programming",
        permissions: {
          clients: ["read", "update"],
          goals: ["create", "read", "update"],
          programs: ["create", "read", "update"]
        },
      },
    ]);

    // Financial Settings
    const financialSettingIds = ["fin-001", "fin-002", "fin-003"];
    await db.insert(financialSettings).values([
      {
        id: financialSettingIds[0],
        setting_name: "default_commission_rate",
        setting_value: "0.15",
        effective_date: new Date("2024-01-01"),
        created_by: userIds[0],
      },
      {
        id: financialSettingIds[1],
        setting_name: "dispute_fee_amount",
        setting_value: "15.00",
        effective_date: new Date("2024-01-01"),
        created_by: userIds[0],
      },
      {
        id: financialSettingIds[2],
        setting_name: "payment_processing_fee",
        setting_value: "0.029",
        effective_date: new Date("2024-01-01"),
        created_by: userIds[0],
      },
    ]);

    // 3. Seed Reference Tables
    console.log("📚 Seeding reference tables...");
    
    // Goal Categories
    const goalCategoryIds = ["gc-001", "gc-002", "gc-003", "gc-004"];
    await db.insert(goalCategories).values([
      {
        id: goalCategoryIds[0],
        name: "Fitness",
        description: "Physical fitness and exercise related goals",
        is_active: true,
      },
      {
        id: goalCategoryIds[1],
        name: "Nutrition",
        description: "Diet and nutrition related goals",
        is_active: true,
      },
      {
        id: goalCategoryIds[2],
        name: "Mindset",
        description: "Mental health and mindset related goals",
        is_active: true,
      },
      {
        id: goalCategoryIds[3],
        name: "Lifestyle",
        description: "General lifestyle and habit related goals",
        is_active: true,
      },
    ]);

    // Goal Types
    const goalTypeIds = ["gt-001", "gt-002", "gt-003", "gt-004", "gt-005", "gt-006"];
    await db.insert(goalTypes).values([
      {
        id: goalTypeIds[0],
        name: "Weight Loss",
        description: "Target weight loss goal",
        icon: "scale",
        category: "Fitness",
        category_id: goalCategoryIds[0],
        default_duration_days: 90,
        is_measurable: true,
        unit_of_measures: "lbs",
        is_active: true,
      },
      {
        id: goalTypeIds[1],
        name: "Strength Gain",
        description: "Increase in maximum lift capacity",
        icon: "dumbbell",
        category: "Fitness", 
        category_id: goalCategoryIds[0],
        default_duration_days: 60,
        is_measurable: true,
        unit_of_measures: "lbs",
        is_active: true,
      },
      {
        id: goalTypeIds[2],
        name: "Daily Water Intake",
        description: "Consistent daily water consumption",
        icon: "droplet",
        category: "Nutrition",
        category_id: goalCategoryIds[1],
        default_duration_days: 30,
        is_measurable: true,
        unit_of_measures: "oz",
        is_active: true,
      },
      {
        id: goalTypeIds[3],
        name: "Meal Prep Consistency",
        description: "Regular meal preparation habit",
        icon: "chef-hat",
        category: "Nutrition",
        category_id: goalCategoryIds[1],
        default_duration_days: 30,
        is_measurable: true,
        unit_of_measures: "days per week",
        is_active: true,
      },
      {
        id: goalTypeIds[4],
        name: "Daily Meditation",
        description: "Consistent meditation practice",
        icon: "brain",
        category: "Mindset",
        category_id: goalCategoryIds[2],
        default_duration_days: 30,
        is_measurable: true,
        unit_of_measures: "minutes",
        is_active: true,
      },
      {
        id: goalTypeIds[5],
        name: "Sleep Quality",
        description: "Improved sleep duration and quality",
        icon: "moon",
        category: "Lifestyle",
        category_id: goalCategoryIds[3],
        default_duration_days: 30,
        is_measurable: true,
        unit_of_measures: "hours",
        is_active: true,
      },
    ]);

    // Products
    const productIds = ["prod-001", "prod-002", "prod-003", "prod-004"];
    await db.insert(products).values([
      {
        id: productIds[0],
        name: "Warrior Babe Transformation Program",
        description: "Comprehensive 12-week transformation program including nutrition and fitness coaching",
        default_duration_months: 3,
        is_active: true,
        client_unit: 1,
      },
      {
        id: productIds[1],
        name: "Elite Coaching Package",
        description: "Premium 6-month coaching package with 1-on-1 sessions and custom programming",
        default_duration_months: 6,
        is_active: true,
        client_unit: 1,
      },
      {
        id: productIds[2],
        name: "Nutrition Reset Program",
        description: "4-week intensive nutrition coaching and meal planning program",
        default_duration_months: 1,
        is_active: true,
        client_unit: 1,
      },
      {
        id: productIds[3],
        name: "Mindset Mastery Course",
        description: "8-week program focusing on mindset coaching and habit formation",
        default_duration_months: 2,
        is_active: true,
        client_unit: 1,
      },
    ]);

    // Win Tags
    const winTagIds = ["wt-001", "wt-002", "wt-003", "wt-004", "wt-005"];
    await db.insert(winTags).values([
      {
        id: winTagIds[0],
        name: "Weight Loss",
        color: "#10B981", // Green
      },
      {
        id: winTagIds[1],
        name: "Strength Gain",
        color: "#F59E0B", // Amber
      },
      {
        id: winTagIds[2],
        name: "Habit Formation",
        color: "#6366F1", // Indigo
      },
      {
        id: winTagIds[3],
        name: "Mindset Breakthrough",
        color: "#EC4899", // Pink
      },
      {
        id: winTagIds[4],
        name: "Lifestyle Change",
        color: "#8B5CF6", // Violet
      },
    ]);

    // 4. Seed Coach Structure
    console.log("👨‍💼 Seeding coach structure...");
    
    // Coach Teams
    const coachTeamIds = ["ct-001", "ct-002"];
    await db.insert(coachTeams).values([
      {
        id: coachTeamIds[0],
        premier_coach_id: null, // Will be set after team members are created
        coach_id: null,
      },
      {
        id: coachTeamIds[1],
        premier_coach_id: null, // Will be set after team members are created
        coach_id: null,
      },
    ]);

    // Team Members
    const teamMemberIds = ["tm-001", "tm-002", "tm-003", "tm-004", "tm-005"];
    await db.insert(teamMembers).values([
      {
        id: teamMemberIds[0],
        name: "Sarah Johnson",
        user_id: userIds[1],
        team_id: coachTeamIds[0],
        contract_type: "W2",
        onboarding_date: new Date("2024-01-15"),
      },
      {
        id: teamMemberIds[1],
        name: "Mike Rodriguez", 
        user_id: userIds[2],
        team_id: coachTeamIds[0],
        contract_type: "Hourly",
        onboarding_date: new Date("2024-01-20"),
      },
      {
        id: teamMemberIds[2],
        name: "Emma Davis",
        user_id: userIds[3],
        team_id: coachTeamIds[1],
        contract_type: "W2",
        onboarding_date: new Date("2024-02-01"),
      },
      {
        id: teamMemberIds[3],
        name: "Alex Chen",
        user_id: userIds[4],
        team_id: coachTeamIds[1],
        contract_type: "W2",
        onboarding_date: new Date("2024-02-10"),
      },
      {
        id: teamMemberIds[4],
        name: "Jessica Martinez",
        user_id: userIds[5],
        team_id: coachTeamIds[0],
        contract_type: "Hourly",
        onboarding_date: new Date("2024-02-15"),
      },
    ]);

    // Update Coach Teams with premier coaches
    await db.update(coachTeams).set({
      premier_coach_id: teamMemberIds[0],
      coach_id: teamMemberIds[1],
    }).where({ id: coachTeamIds[0] });

    await db.update(coachTeams).set({
      premier_coach_id: teamMemberIds[3],
      coach_id: teamMemberIds[2],
    }).where({ id: coachTeamIds[1] });

    // Coach Capacity
    const coachCapacityIds = ["cc-001", "cc-002", "cc-003", "cc-004", "cc-005"];
    await db.insert(coachCapacity).values([
      {
        id: coachCapacityIds[0],
        coach_id: userIds[1],
        max_total_clients: 25,
        max_client_units: 30,
      },
      {
        id: coachCapacityIds[1],
        coach_id: userIds[2],
        max_total_clients: 20,
        max_client_units: 25,
      },
      {
        id: coachCapacityIds[2],
        coach_id: userIds[3],
        max_total_clients: 20,
        max_client_units: 25,
      },
      {
        id: coachCapacityIds[3],
        coach_id: userIds[4],
        max_total_clients: 30,
        max_client_units: 35,
      },
      {
        id: coachCapacityIds[4],
        coach_id: userIds[5],
        max_total_clients: 15,
        max_client_units: 20,
      },
    ]);

    // 5. Seed Clients
    console.log("👥 Seeding clients...");
    const clientIds = ["client-001", "client-002", "client-003", "client-004", "client-005", "client-006", "client-007", "client-008"];
    await db.insert(clients).values([
      {
        id: clientIds[0],
        name: "Amanda Johnson",
        email: "amanda.johnson@example.com",
        phone: "+1-555-0101",
        vip_terms_signed: true,
        everfit_access: "confirmed",
        onboarding_call_completed: true,
        two_week_check_in_call_completed: true,
        onboarding_notes: "Motivated client, previous fitness experience, goals focused on strength training",
        overall_status: "live",
        onboarding_completed_date: new Date("2024-02-01"),
        team_ids: [coachTeamIds[0]],
      },
      {
        id: clientIds[1],
        name: "Rachel Smith",
        email: "rachel.smith@example.com", 
        phone: "+1-555-0102",
        vip_terms_signed: true,
        everfit_access: "confirmed",
        onboarding_call_completed: true,
        two_week_check_in_call_completed: false,
        onboarding_notes: "New to fitness, needs extra support with form and technique",
        overall_status: "new",
        onboarding_completed_date: new Date("2024-02-15"),
        team_ids: [coachTeamIds[0]],
      },
      {
        id: clientIds[2],
        name: "Lisa Williams",
        email: "lisa.williams@example.com",
        phone: "+1-555-0103",
        vip_terms_signed: true,
        everfit_access: "requested",
        onboarding_call_completed: true,
        two_week_check_in_call_completed: true,
        onboarding_notes: "Experienced with nutrition, needs help with workout programming",
        overall_status: "live",
        onboarding_completed_date: new Date("2024-01-20"),
        team_ids: [coachTeamIds[1]],
      },
      {
        id: clientIds[3],
        name: "Jennifer Brown",
        email: "jennifer.brown@example.com",
        phone: "+1-555-0104", 
        vip_terms_signed: true,
        everfit_access: "confirmed",
        onboarding_call_completed: false,
        two_week_check_in_call_completed: false,
        onboarding_notes: "Busy professional, prefers early morning workouts",
        overall_status: "paused",
        onboarding_completed_date: null,
        team_ids: [coachTeamIds[1]],
      },
      {
        id: clientIds[4],
        name: "Sarah Davis",
        email: "sarah.davis@example.com",
        phone: "+1-555-0105",
        vip_terms_signed: true,
        everfit_access: "confirmed",
        onboarding_call_completed: true,
        two_week_check_in_call_completed: true,
        onboarding_notes: "Postpartum client, cleared for exercise, focusing on core recovery",
        overall_status: "live",
        onboarding_completed_date: new Date("2024-02-05"),
        team_ids: [coachTeamIds[0]],
      },
      {
        id: clientIds[5],
        name: "Michelle Garcia",
        email: "michelle.garcia@example.com",
        phone: "+1-555-0106",
        vip_terms_signed: false,
        everfit_access: "new",
        onboarding_call_completed: false,
        two_week_check_in_call_completed: false,
        onboarding_notes: "Recently signed up, awaiting initial consultation",
        overall_status: "new",
        onboarding_completed_date: null,
        team_ids: [coachTeamIds[1]],
      },
      {
        id: clientIds[6],
        name: "Ashley Miller",
        email: "ashley.miller@example.com",
        phone: "+1-555-0107",
        vip_terms_signed: true,
        everfit_access: "confirmed",
        onboarding_call_completed: true,
        two_week_check_in_call_completed: true,
        onboarding_notes: "Former athlete, high motivation, interested in competition prep",
        overall_status: "live",
        onboarding_completed_date: new Date("2024-01-25"),
        team_ids: [coachTeamIds[0]],
      },
      {
        id: clientIds[7],
        name: "Kimberly Wilson",
        email: "kimberly.wilson@example.com",
        phone: "+1-555-0108",
        vip_terms_signed: true,
        everfit_access: "confirmed", 
        onboarding_call_completed: true,
        two_week_check_in_call_completed: true,
        onboarding_notes: "Previous client returning after break, familiar with program structure",
        overall_status: "churned",
        onboarding_completed_date: new Date("2024-01-10"),
        offboard_date: new Date("2024-02-20"),
        team_ids: [coachTeamIds[1]],
      },
    ]);

    // 6. Seed Client Relationships
    console.log("🔗 Seeding client relationships...");
    
    // Client Assignments
    const clientAssignmentIds = ["ca-001", "ca-002", "ca-003", "ca-004", "ca-005", "ca-006", "ca-007", "ca-008"];
    await db.insert(clientAssignments).values([
      {
        id: clientAssignmentIds[0],
        client_id: clientIds[0],
        user_id: userIds[1], // Sarah Johnson
        assigned_by: userIds[0], // Admin
        assignment_type: "Primary Coach",
        start_date: new Date("2024-02-01"),
        end_date: null,
      },
      {
        id: clientAssignmentIds[1],
        client_id: clientIds[1],
        user_id: userIds[2], // Mike Rodriguez
        assigned_by: userIds[1], // Sarah Johnson
        assignment_type: "Primary Coach",
        start_date: new Date("2024-02-15"),
        end_date: null,
      },
      {
        id: clientAssignmentIds[2],
        client_id: clientIds[2],
        user_id: userIds[4], // Alex Chen
        assigned_by: userIds[0], // Admin
        assignment_type: "Primary Coach",
        start_date: new Date("2024-01-20"),
        end_date: null,
      },
      {
        id: clientAssignmentIds[3],
        client_id: clientIds[3],
        user_id: userIds[3], // Emma Davis
        assigned_by: userIds[4], // Alex Chen
        assignment_type: "Primary Coach",
        start_date: new Date("2024-01-25"),
        end_date: new Date("2024-02-10"), // Paused
      },
      {
        id: clientAssignmentIds[4],
        client_id: clientIds[4],
        user_id: userIds[1], // Sarah Johnson
        assigned_by: userIds[0], // Admin
        assignment_type: "Primary Coach",
        start_date: new Date("2024-02-05"),
        end_date: null,
      },
      {
        id: clientAssignmentIds[5],
        client_id: clientIds[5],
        user_id: userIds[3], // Emma Davis
        assigned_by: userIds[4], // Alex Chen
        assignment_type: "Primary Coach",
        start_date: new Date("2024-02-18"),
        end_date: null,
      },
      {
        id: clientAssignmentIds[6],
        client_id: clientIds[6],
        user_id: userIds[5], // Jessica Martinez
        assigned_by: userIds[1], // Sarah Johnson
        assignment_type: "Primary Coach",
        start_date: new Date("2024-01-25"),
        end_date: null,
      },
      {
        id: clientAssignmentIds[7],
        client_id: clientIds[7],
        user_id: userIds[4], // Alex Chen
        assigned_by: userIds[0], // Admin
        assignment_type: "Primary Coach",
        start_date: new Date("2024-01-10"),
        end_date: new Date("2024-02-20"), // Churned
      },
    ]);

    // Client Activity Periods
    const clientActivityPeriodIds = ["cap-001", "cap-002", "cap-003", "cap-004", "cap-005", "cap-006"];
    await db.insert(clientActivityPeriods).values([
      {
        id: clientActivityPeriodIds[0],
        client_id: clientIds[0],
        coach_id: userIds[1],
        start_date: new Date("2024-02-01"),
        end_date: null,
        active: true,
      },
      {
        id: clientActivityPeriodIds[1],
        client_id: clientIds[2],
        coach_id: userIds[4],
        start_date: new Date("2024-01-20"),
        end_date: null,
        active: true,
      },
      {
        id: clientActivityPeriodIds[2],
        client_id: clientIds[4],
        coach_id: userIds[1],
        start_date: new Date("2024-02-05"),
        end_date: null,
        active: true,
      },
      {
        id: clientActivityPeriodIds[3],
        client_id: clientIds[6],
        coach_id: userIds[5],
        start_date: new Date("2024-01-25"),
        end_date: null,
        active: true,
      },
      {
        id: clientActivityPeriodIds[4],
        client_id: clientIds[3],
        coach_id: userIds[3],
        start_date: new Date("2024-01-25"),
        end_date: new Date("2024-02-10"),
        active: false,
      },
      {
        id: clientActivityPeriodIds[5],
        client_id: clientIds[7],
        coach_id: userIds[4],
        start_date: new Date("2024-01-10"),
        end_date: new Date("2024-02-20"),
        active: false,
      },
    ]);

    // Client Goals
    console.log("🎯 Seeding client goals...");
    const clientGoalIds = ["cg-001", "cg-002", "cg-003", "cg-004", "cg-005", "cg-006", "cg-007", "cg-008"];
    await db.insert(clientGoals).values([
      {
        id: clientGoalIds[0],
        client_id: clientIds[0],
        goal_type_id: goalTypeIds[0], // Weight Loss
        title: "Lose 15 pounds",
        description: "Target weight loss for summer",
        target_value: 15,
        current_value: 8,
        status: "in_progress",
        priority: "high",
        created_by: userIds[1],
        updated_by: userIds[1],
        started_at: new Date("2024-02-01"),
        due_date: new Date("2024-05-01"),
        completed_at: null,
      },
      {
        id: clientGoalIds[1],
        client_id: clientIds[0],
        goal_type_id: goalTypeIds[1], // Strength Gain
        title: "Increase squat to 150lbs",
        description: "Progressive strength goal for lower body",
        target_value: 150,
        current_value: 125,
        status: "in_progress",
        priority: "medium",
        created_by: userIds[1],
        updated_by: userIds[1],
        started_at: new Date("2024-02-01"),
        due_date: new Date("2024-04-01"),
        completed_at: null,
      },
      {
        id: clientGoalIds[2],
        client_id: clientIds[2],
        goal_type_id: goalTypeIds[2], // Daily Water Intake
        title: "Drink 80oz water daily",
        description: "Improve hydration consistency",
        target_value: 80,
        current_value: 65,
        status: "in_progress",
        priority: "medium",
        created_by: userIds[4],
        updated_by: userIds[4],
        started_at: new Date("2024-01-20"),
        due_date: new Date("2024-02-20"),
        completed_at: null,
      },
      {
        id: clientGoalIds[3],
        client_id: clientIds[4],
        goal_type_id: goalTypeIds[0], // Weight Loss
        title: "Lose 10 pounds postpartum",
        description: "Healthy postpartum weight loss",
        target_value: 10,
        current_value: 3,
        status: "in_progress",
        priority: "medium",
        created_by: userIds[1],
        updated_by: userIds[1],
        started_at: new Date("2024-02-05"),
        due_date: new Date("2024-04-05"),
        completed_at: null,
      },
      {
        id: clientGoalIds[4],
        client_id: clientIds[6],
        goal_type_id: goalTypeIds[1], // Strength Gain
        title: "Deadlift 200lbs",
        description: "Competition prep strength goal",
        target_value: 200,
        current_value: 175,
        status: "in_progress",
        priority: "high",
        created_by: userIds[5],
        updated_by: userIds[5],
        started_at: new Date("2024-01-25"),
        due_date: new Date("2024-03-25"),
        completed_at: null,
      },
      {
        id: clientGoalIds[5],
        client_id: clientIds[1],
        goal_type_id: goalTypeIds[4], // Daily Meditation
        title: "Meditate 10 minutes daily",
        description: "Build consistent mindfulness practice",
        target_value: 10,
        current_value: 5,
        status: "pending",
        priority: "low",
        created_by: userIds[2],
        updated_by: userIds[2],
        started_at: null,
        due_date: new Date("2024-03-15"),
        completed_at: null,
      },
      {
        id: clientGoalIds[6],
        client_id: clientIds[2],
        goal_type_id: goalTypeIds[3], // Meal Prep Consistency
        title: "Meal prep 5 days per week",
        description: "Improve nutrition consistency",
        target_value: 5,
        current_value: 7,
        status: "completed",
        priority: "high",
        created_by: userIds[4],
        updated_by: userIds[4],
        started_at: new Date("2024-01-20"),
        due_date: new Date("2024-02-20"),
        completed_at: new Date("2024-02-18"),
      },
      {
        id: clientGoalIds[7],
        client_id: clientIds[7],
        goal_type_id: goalTypeIds[0], // Weight Loss
        title: "Lose 20 pounds",
        description: "Goal was cancelled when client churned",
        target_value: 20,
        current_value: 5,
        status: "cancelled",
        priority: "high",
        created_by: userIds[4],
        updated_by: userIds[4],
        started_at: new Date("2024-01-10"),
        due_date: new Date("2024-04-10"),
        completed_at: null,
      },
    ]);

    // Client NPS
    const clientNpsIds = ["cnps-001", "cnps-002", "cnps-003", "cnps-004"];
    await db.insert(clientNps).values([
      {
        id: clientNpsIds[0],
        nps_score: 9,
        recorded_date: new Date("2024-02-10"),
        recorded_by: userIds[1],
        provided_by: clientIds[0],
        notes: "Very satisfied with coaching and program structure",
      },
      {
        id: clientNpsIds[1], 
        nps_score: 10,
        recorded_date: new Date("2024-02-12"),
        recorded_by: userIds[4],
        provided_by: clientIds[2],
        notes: "Excellent results, would highly recommend",
      },
      {
        id: clientNpsIds[2],
        nps_score: 8,
        recorded_date: new Date("2024-02-05"),
        recorded_by: userIds[5],
        provided_by: clientIds[6],
        notes: "Great coaching, would like more nutrition guidance",
      },
      {
        id: clientNpsIds[3],
        nps_score: 6,
        recorded_date: new Date("2024-02-15"),
        recorded_by: userIds[3],
        provided_by: clientIds[3],
        notes: "Program is good but scheduling conflicts make it challenging",
      },
    ]);

    // Client Testimonials
    const clientTestimonialIds = ["ct-001", "ct-002", "ct-003"];
    await db.insert(clientTestimonials).values([
      {
        id: clientTestimonialIds[0],
        client_id: clientIds[0],
        testimonial_type: "Written",
        content: "The Warrior Babe program completely transformed my relationship with fitness. Sarah's coaching style is incredibly motivating and she helped me build sustainable habits that I can maintain long-term.",
        recorded_date: new Date("2024-02-14"),
        recorded_by: userIds[1],
      },
      {
        id: clientTestimonialIds[1],
        client_id: clientIds[2],
        testimonial_type: "Video",
        testimonial_url: "https://youtube.com/watch?v=testimonial-lisa",
        content: "I've tried many programs before but nothing compares to the personalized attention and expertise I received here. Alex helped me break through plateaus I never thought possible.",
        recorded_date: new Date("2024-02-08"),
        recorded_by: userIds[4],
      },
      {
        id: clientTestimonialIds[2],
        client_id: clientIds[6],
        testimonial_type: "Written",
        content: "As a former athlete, I was skeptical about online coaching, but Jessica exceeded all expectations. The program helped me regain my competitive edge while balancing my busy life.",
        recorded_date: new Date("2024-02-16"),
        recorded_by: userIds[5],
      },
    ]);

    // 7. Seed Payments and Plans
    console.log("💳 Seeding payments and plans...");
    
    // Payment Plan Templates
    const paymentPlanTemplateIds = ["ppt-001", "ppt-002", "ppt-003", "ppt-004"];
    await db.insert(paymentPlanTemplates).values([
      {
        id: paymentPlanTemplateIds[0],
        product_id: productIds[0], // Transformation Program
        name: "PIF", // Pay In Full
        default_total_amount_owed: 1497,
      },
      {
        id: paymentPlanTemplateIds[1],
        product_id: productIds[0], // Transformation Program
        name: "2-Pay",
        default_total_amount_owed: 1597,
      },
      {
        id: paymentPlanTemplateIds[2],
        product_id: productIds[1], // Elite Coaching
        name: "PIF",
        default_total_amount_owed: 2497,
      },
      {
        id: paymentPlanTemplateIds[3],
        product_id: productIds[2], // Nutrition Reset
        name: "PIF",
        default_total_amount_owed: 497,
      },
    ]);

    // Payment Plan Template Items
    const paymentPlanTemplateItemIds = ["ppti-001", "ppti-002", "ppti-003"];
    await db.insert(paymentPlanTemplateItems).values([
      {
        id: paymentPlanTemplateItemIds[0],
        payment_plan_template_id: paymentPlanTemplateIds[0], // Transformation PIF
        amount_due: 1497,
        months_to_delay: 0,
      },
      {
        id: paymentPlanTemplateItemIds[1],
        payment_plan_template_id: paymentPlanTemplateIds[1], // Transformation 2-Pay
        amount_due: 798.50,
        months_to_delay: 0,
      },
      {
        id: paymentPlanTemplateItemIds[2],
        payment_plan_template_id: paymentPlanTemplateIds[1], // Transformation 2-Pay
        amount_due: 798.50,
        months_to_delay: 1,
      },
    ]);

    // Payment Plans (for clients)
    const paymentPlanIds = ["pp-001", "pp-002", "pp-003", "pp-004", "pp-005"];
    await db.insert(paymentPlans).values([
      {
        id: paymentPlanIds[0],
        client_id: clientIds[0], // Amanda Johnson
        product_id: productIds[0], // Transformation Program
        type: "PIF",
        name: "Transformation Program - Pay in Full",
        term_start_date: new Date("2024-02-01"),
        term_end_date: new Date("2024-05-01"),
        total_amount: 1497,
        total_amount_paid: 1497,
        subscription_id: "sub_amanda_001",
        platform: "Stripe",
      },
      {
        id: paymentPlanIds[1],
        client_id: clientIds[2], // Lisa Williams
        product_id: productIds[1], // Elite Coaching
        type: "PIF",
        name: "Elite Coaching Package - Pay in Full",
        term_start_date: new Date("2024-01-20"),
        term_end_date: new Date("2024-07-20"),
        total_amount: 2497,
        total_amount_paid: 2497,
        subscription_id: "sub_lisa_001",
        platform: "Stripe",
      },
      {
        id: paymentPlanIds[2],
        client_id: clientIds[4], // Sarah Davis
        product_id: productIds[0], // Transformation Program
        type: "2-Pay",
        name: "Transformation Program - 2 Payment Plan",
        term_start_date: new Date("2024-02-05"),
        term_end_date: new Date("2024-05-05"),
        total_amount: 1597,
        total_amount_paid: 798.50,
        subscription_id: "sub_sarah_001",
        platform: "Stripe",
      },
      {
        id: paymentPlanIds[3],
        client_id: clientIds[6], // Ashley Miller
        product_id: productIds[0], // Transformation Program
        type: "PIF",
        name: "Transformation Program - Pay in Full",
        term_start_date: new Date("2024-01-25"),
        term_end_date: new Date("2024-04-25"),
        total_amount: 1497,
        total_amount_paid: 1497,
        subscription_id: "sub_ashley_001",
        platform: "Stripe",
      },
      {
        id: paymentPlanIds[4],
        client_id: clientIds[1], // Rachel Smith
        product_id: productIds[2], // Nutrition Reset
        type: "PIF",
        name: "Nutrition Reset Program - Pay in Full",
        term_start_date: new Date("2024-02-15"),
        term_end_date: new Date("2024-03-15"),
        total_amount: 497,
        total_amount_paid: 497,
        subscription_id: "sub_rachel_001",
        platform: "Stripe",
      },
    ]);

    // Payments
    const paymentIds = ["pay-001", "pay-002", "pay-003", "pay-004", "pay-005", "pay-006", "pay-007"];
    await db.insert(payments).values([
      {
        id: paymentIds[0],
        amount: 1497,
        payment_date: new Date("2024-02-01"),
        payment_method: "Credit Card",
        stripe_transaction_id: "pi_amanda_transformation_001",
        status: "Completed",
        platform: "Stripe",
        disputed_status: "Not Disputed",
      },
      {
        id: paymentIds[1],
        amount: 2497,
        payment_date: new Date("2024-01-20"),
        payment_method: "Credit Card", 
        stripe_transaction_id: "pi_lisa_elite_001",
        status: "Completed",
        platform: "Stripe",
        disputed_status: "Not Disputed",
      },
      {
        id: paymentIds[2],
        amount: 798.50,
        payment_date: new Date("2024-02-05"),
        payment_method: "Credit Card",
        stripe_transaction_id: "pi_sarah_transformation_001",
        status: "Completed",
        platform: "Stripe",
        disputed_status: "Not Disputed",
      },
      {
        id: paymentIds[3],
        amount: 798.50,
        payment_date: new Date("2024-03-05"),
        payment_method: "Credit Card",
        stripe_transaction_id: "pi_sarah_transformation_002",
        status: "Pending",
        platform: "Stripe",
        disputed_status: "Not Disputed",
      },
      {
        id: paymentIds[4],
        amount: 1497,
        payment_date: new Date("2024-01-25"),
        payment_method: "Credit Card",
        stripe_transaction_id: "pi_ashley_transformation_001",
        status: "Completed",
        platform: "Stripe",
        disputed_status: "Not Disputed",
      },
      {
        id: paymentIds[5],
        amount: 497,
        payment_date: new Date("2024-02-15"),
        payment_method: "Credit Card",
        stripe_transaction_id: "pi_rachel_nutrition_001",
        status: "Completed",
        platform: "Stripe",
        disputed_status: "Not Disputed",
      },
      {
        id: paymentIds[6],
        amount: 1200,
        payment_date: new Date("2024-01-15"),
        payment_method: "Credit Card",
        stripe_transaction_id: "pi_disputed_payment_001",
        status: "Disputed",
        platform: "Stripe",
        disputed_status: "Disputed",
        dispute_fee: 15,
      },
    ]);

    // Payment Slots
    const paymentSlotIds = ["ps-001", "ps-002", "ps-003", "ps-004", "ps-005", "ps-006"];
    await db.insert(paymentSlots).values([
      {
        id: paymentSlotIds[0],
        payment_plan_id: paymentPlanIds[0], // Amanda's PIF
        payment_id: paymentIds[0],
        due_date: new Date("2024-02-01"),
        amount_due: 1497,
        amount_paid: 1497,
      },
      {
        id: paymentSlotIds[1],
        payment_plan_id: paymentPlanIds[1], // Lisa's Elite PIF
        payment_id: paymentIds[1],
        due_date: new Date("2024-01-20"),
        amount_due: 2497,
        amount_paid: 2497,
      },
      {
        id: paymentSlotIds[2],
        payment_plan_id: paymentPlanIds[2], // Sarah's 2-Pay first payment
        payment_id: paymentIds[2],
        due_date: new Date("2024-02-05"),
        amount_due: 798.50,
        amount_paid: 798.50,
      },
      {
        id: paymentSlotIds[3],
        payment_plan_id: paymentPlanIds[2], // Sarah's 2-Pay second payment
        payment_id: paymentIds[3],
        due_date: new Date("2024-03-05"),
        amount_due: 798.50,
        amount_paid: 0,
        notes: "Scheduled for auto-payment",
      },
      {
        id: paymentSlotIds[4],
        payment_plan_id: paymentPlanIds[3], // Ashley's PIF
        payment_id: paymentIds[4],
        due_date: new Date("2024-01-25"),
        amount_due: 1497,
        amount_paid: 1497,
      },
      {
        id: paymentSlotIds[5],
        payment_plan_id: paymentPlanIds[4], // Rachel's Nutrition PIF
        payment_id: paymentIds[5],
        due_date: new Date("2024-02-15"),
        amount_due: 497,
        amount_paid: 497,
      },
    ]);

    // Coach Payments (commissions)
    const coachPaymentIds = ["cp-001", "cp-002", "cp-003", "cp-004", "cp-005"];
    await db.insert(coachPayments).values([
      {
        id: coachPaymentIds[0],
        coach_id: userIds[1], // Sarah Johnson
        client_activity_period_id: clientActivityPeriodIds[0], // Amanda Johnson
        amount: 224.55, // 15% of $1497
      },
      {
        id: coachPaymentIds[1],
        coach_id: userIds[4], // Alex Chen
        client_activity_period_id: clientActivityPeriodIds[1], // Lisa Williams
        amount: 374.55, // 15% of $2497
      },
      {
        id: coachPaymentIds[2],
        coach_id: userIds[1], // Sarah Johnson
        client_activity_period_id: clientActivityPeriodIds[2], // Sarah Davis
        amount: 239.55, // 15% of $1597
      },
      {
        id: coachPaymentIds[3],
        coach_id: userIds[5], // Jessica Martinez
        client_activity_period_id: clientActivityPeriodIds[3], // Ashley Miller
        amount: 224.55, // 15% of $1497
      },
      {
        id: coachPaymentIds[4],
        coach_id: userIds[2], // Mike Rodriguez
        amount: 74.55, // 15% of $497
      },
    ]);

    // 8. Seed Client Wins
    console.log("🏆 Seeding client wins...");
    
    // Client Wins
    const clientWinIds = ["cw-001", "cw-002", "cw-003", "cw-004", "cw-005", "cw-006"];
    await db.insert(clientWins).values([
      {
        id: clientWinIds[0],
        client_id: clientIds[0], // Amanda Johnson
        title: "Lost 8 pounds in first month",
        description: "Exceeded expectations for month 1, staying consistent with nutrition and workouts",
        win_date: new Date("2024-02-28"),
        recorded_by: userIds[1], // Sarah Johnson
      },
      {
        id: clientWinIds[1],
        client_id: clientIds[0], // Amanda Johnson
        title: "First unassisted pull-up",
        description: "Achieved major strength milestone after 6 weeks of training",
        win_date: new Date("2024-03-10"),
        recorded_by: userIds[1], // Sarah Johnson
      },
      {
        id: clientWinIds[2],
        client_id: clientIds[2], // Lisa Williams
        title: "Completed meal prep challenge",
        description: "Successfully meal prepped for 4 weeks straight, improving nutrition consistency",
        win_date: new Date("2024-02-18"),
        recorded_by: userIds[4], // Alex Chen
      },
      {
        id: clientWinIds[3],
        client_id: clientIds[4], // Sarah Davis
        title: "Returned to pre-pregnancy strength",
        description: "Safely regained core strength and overall fitness after postpartum recovery",
        win_date: new Date("2024-02-25"),
        recorded_by: userIds[1], // Sarah Johnson
      },
      {
        id: clientWinIds[4],
        client_id: clientIds[6], // Ashley Miller
        title: "Deadlifted 175 lbs",
        description: "New personal record, 25 lbs increase from starting weight",
        win_date: new Date("2024-02-20"),
        recorded_by: userIds[5], // Jessica Martinez
      },
      {
        id: clientWinIds[5],
        client_id: clientIds[6], // Ashley Miller
        title: "Mindset breakthrough session",
        description: "Overcame mental barriers around competition prep, feeling confident and motivated",
        win_date: new Date("2024-02-22"),
        recorded_by: userIds[5], // Jessica Martinez
      },
    ]);

    // Client Win Tags (junction table)
    const clientWinTagIds = ["cwt-001", "cwt-002", "cwt-003", "cwt-004", "cwt-005", "cwt-006", "cwt-007"];
    await db.insert(clientWinTags).values([
      {
        id: clientWinTagIds[0],
        win_id: clientWinIds[0], // Amanda's weight loss
        tag_id: winTagIds[0], // Weight Loss
      },
      {
        id: clientWinTagIds[1],
        win_id: clientWinIds[1], // Amanda's pull-up
        tag_id: winTagIds[1], // Strength Gain
      },
      {
        id: clientWinTagIds[2],
        win_id: clientWinIds[2], // Lisa's meal prep
        tag_id: winTagIds[2], // Habit Formation
      },
      {
        id: clientWinTagIds[3],
        win_id: clientWinIds[3], // Sarah's postpartum recovery
        tag_id: winTagIds[1], // Strength Gain
      },
      {
        id: clientWinTagIds[4],
        win_id: clientWinIds[3], // Sarah's postpartum recovery
        tag_id: winTagIds[4], // Lifestyle Change
      },
      {
        id: clientWinTagIds[5],
        win_id: clientWinIds[4], // Ashley's deadlift PR
        tag_id: winTagIds[1], // Strength Gain
      },
      {
        id: clientWinTagIds[6],
        win_id: clientWinIds[5], // Ashley's mindset breakthrough
        tag_id: winTagIds[3], // Mindset Breakthrough
      },
    ]);

    // 9. Seed remaining system tables
    console.log("📋 Seeding audit logs...");
    const auditLogIds = ["al-001", "al-002"];
    await db.insert(auditLog).values([
      {
        id: auditLogIds[0],
      },
      {
        id: auditLogIds[1],
      },
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log("📊 Seeded data summary:");
    console.log(`   • ${userIds.length} users`);
    console.log(`   • ${roleIds.length} roles`);
    console.log(`   • ${clientIds.length} clients`);
    console.log(`   • ${teamMemberIds.length} team members`);
    console.log(`   • ${coachTeamIds.length} coach teams`);
    console.log(`   • ${productIds.length} products`);
    console.log(`   • ${paymentPlanIds.length} payment plans`);
    console.log(`   • ${paymentIds.length} payments`);
    console.log(`   • ${clientGoalIds.length} client goals`);
    console.log(`   • ${clientWinIds.length} client wins`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});