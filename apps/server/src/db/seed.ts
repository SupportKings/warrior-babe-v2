import { db } from "./index";
import { eq } from "drizzle-orm";
import { authUsers } from "./shadow/auth";
import { coachTeams } from "./schema/coach/coach-teams";
import { teamMembers } from "./schema/coach/team-members";

// Factory functions for generating random data
const userFactory = (count: number) => {
  const roles = ["admin", "premier_coach", "coach"];
  const firstNames = ["Sarah", "Mike", "Emma", "Alex", "Jessica", "Chris", "Ashley", "Jordan", "Taylor", "Morgan"];
  const lastNames = ["Johnson", "Rodriguez", "Davis", "Chen", "Martinez", "Wilson", "Brown", "Garcia", "Miller", "Anderson"];
  
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    // Ensure unique email by adding index and timestamp
    const uniqueId = Date.now() + i;
    
    return {
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uniqueId}@example.com`,
      emailVerified: Math.random() > 0.1, // 90% verified
      role: role,
      banned: Math.random() > 0.95, // 5% banned
      bio: Math.random() > 0.5 ? `Certified ${role.toLowerCase()} with extensive experience in fitness and wellness.` : null,
      calendar_link: Math.random() > 0.3 ? `https://calendly.com/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : null,
    };
  });
};

const coachTeamFactory = (count: number) => {
  return Array.from({ length: count }, () => {
    return {
      id: crypto.randomUUID(),
      premier_coach_id: null, // Will update after team_members are created
      coach_id: null, // Will update after team_members are created
    };
  });
};

const teamMemberFactory = (count: number, userData: any[], teamIds: string[]) => {
  const contractTypes = ["W2", "Hourly"] as const;
  
  // Different set of names for team members to make them distinct from users
  const teamMemberFirstNames = ["Lucas", "Sophia", "Ethan", "Isabella", "Mason", "Olivia", "Logan", "Ava", "Jackson", "Mia", "Aiden", "Charlotte", "Owen", "Amelia", "Liam"];
  const teamMemberLastNames = ["Thompson", "White", "Harris", "Martin", "Jackson", "Clark", "Rodriguez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott"];
  
  return Array.from({ length: count }, () => {
    const user = userData[Math.floor(Math.random() * userData.length)];
    const teamId = teamIds[Math.floor(Math.random() * teamIds.length)];
    const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
    
    // Generate random team member name (different from user names)
    const firstName = teamMemberFirstNames[Math.floor(Math.random() * teamMemberFirstNames.length)];
    const lastName = teamMemberLastNames[Math.floor(Math.random() * teamMemberLastNames.length)];
    
    // Generate random onboarding date within last 2 years
    const onboardingDate = new Date(Date.now() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000));
    
    return {
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`, // Generate random name different from user
      user_id: user.id,
      team_id: teamId,
      contract_type: contractType,
      onboarding_date: new Date(onboardingDate), // Keep as Date object for timestamp field
    };
  });
};

async function seed() {
  console.log("🌱 Starting simplified database seeding...");

  try {
    // Configuration - adjust these numbers as needed
    const USER_COUNT = 30;
    const COACH_TEAM_COUNT = 10;
    const TEAM_MEMBER_COUNT = 30;

    // 1. Seed Users
    console.log(`👤 Seeding ${USER_COUNT} users...`);
    const userData = userFactory(USER_COUNT);

    // Add createdAt and updatedAt fields to each user
    const now = new Date();
    const userDataWithTimestamps = userData.map(user => ({
      ...user,
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(authUsers).values(userDataWithTimestamps);
    const userIds = userDataWithTimestamps.map(user => user.id);
    console.log(`✅ Created ${USER_COUNT} users`);

    // 2. Seed Coach Teams (without coach references initially)
    console.log(`🏃 Seeding ${COACH_TEAM_COUNT} coach teams...`);
    const coachTeamData = coachTeamFactory(COACH_TEAM_COUNT);
    await db.insert(coachTeams).values(coachTeamData);
    const teamIds = coachTeamData.map(team => team.id);
    console.log(`✅ Created ${COACH_TEAM_COUNT} coach teams`);

    // 3. Seed Team Members
    console.log(`👥 Seeding ${TEAM_MEMBER_COUNT} team members...`);
    const teamMemberData = teamMemberFactory(TEAM_MEMBER_COUNT, userDataWithTimestamps, teamIds);

    // Convert onboarding_date to string (ISO format) to match DB schema
    const teamMemberDataForInsert = teamMemberData.map(member => ({
      ...member,
      onboarding_date: member.onboarding_date.toISOString(),
    }));

    await db.insert(teamMembers).values(teamMemberDataForInsert);
    const teamMemberIds = teamMemberData.map(member => member.id);
    console.log(`✅ Created ${TEAM_MEMBER_COUNT} team members`);

    // 4. Update Coach Teams with coach references
    console.log(`🔄 Updating coach teams with member references...`);
    for (let i = 0; i < coachTeamData.length; i++) {
      const team = coachTeamData[i];
      const premierCoachId = teamMemberIds[Math.floor(Math.random() * Math.min(teamMemberIds.length, 3))];
      const coachId = teamMemberIds[Math.floor(Math.random() * teamMemberIds.length)];
      
      await db.update(coachTeams)
        .set({ 
          premier_coach_id: premierCoachId,
          coach_id: coachId 
        })
        .where(eq(coachTeams.id, team.id));
    }
    console.log(`✅ Updated coach team references`);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
📊 Summary:
   - Users: ${USER_COUNT}
   - Coach Teams: ${COACH_TEAM_COUNT}  
   - Team Members: ${TEAM_MEMBER_COUNT}
    `);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed().catch(console.error);