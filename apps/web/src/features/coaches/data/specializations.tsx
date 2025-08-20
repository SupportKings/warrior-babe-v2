import {
  Apple,
  Baby,
  BicepsFlexed,
  Brain,
  Briefcase,
  Dumbbell,
  Heart,
  type LucideIcon,
  Moon,
  Salad,
  Target,
  Users,
} from "lucide-react";

export const specializationIcons: Record<string, LucideIcon> = {
  // Fitness & Training
  "Strength Training": BicepsFlexed,
  "Weight Loss": Dumbbell,
  "Athletic Performance": Target,
  "Group Fitness": Users,

  // Health & Wellness
  Nutrition: Apple,
  "Mental Health": Brain,
  "Sleep Optimization": Moon,
  "Stress Management": Heart,
  "Nutrition & Wellness": Salad,

  // Specialized
  "Prenatal/Postnatal": Baby,
  "Corporate Wellness": Briefcase,

  // Add more mappings as needed
};

export function getSpecializationIcon(
  specialization: string
): LucideIcon | null {
  return specializationIcons[specialization] || null;
}
