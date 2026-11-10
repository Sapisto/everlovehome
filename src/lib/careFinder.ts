/** Care-plan builder: maps what a family says they need to suggested services. */

export const needs = [
  { id: "bathing", label: "Bathing & dressing", services: ["Personal Care"] },
  { id: "lonely", label: "Feeling lonely", services: ["Companion Care"] },
  { id: "meals", label: "Eating well", services: ["Meal Preparation"] },
  { id: "meds", label: "Remembering medications", services: ["Medication Reminders"] },
  { id: "home", label: "Keeping the house tidy", services: ["Light Housekeeping"] },
  { id: "rides", label: "Getting to appointments", services: ["Errands & Transportation"] },
  { id: "hospital", label: "Coming home from hospital", services: ["Personal Care", "Meal Preparation", "Medication Reminders"] },
  { id: "break", label: "Family needs a break", services: ["Respite Care", "Companion Care"] },
] as const;

export const frequencies = [
  { value: "A few hours a week", label: "A few hours a week" },
  { value: "Daily visits", label: "Daily visits" },
  { value: "Overnight care", label: "Overnight" },
  { value: "Around-the-clock care", label: "Around the clock" },
] as const;

export type NeedId = (typeof needs)[number]["id"];
export type Frequency = (typeof frequencies)[number]["value"];

export interface CarePlan {
  needs: string[];
  services: string[];
  frequency: Frequency | null;
}

export function buildPlan(selected: readonly NeedId[], frequency: Frequency | null): CarePlan {
  const chosen = needs.filter((n) => selected.includes(n.id));
  const services = [...new Set(chosen.flatMap((n) => n.services))];
  return { needs: chosen.map((n) => n.label), services, frequency };
}

export function planToMessage(plan: CarePlan): string {
  const lines = ["Hi EverLove team, here's what we're looking for:"];
  if (plan.needs.length) lines.push(`• Help with: ${plan.needs.join(", ")}`);
  if (plan.frequency) lines.push(`• How often: ${plan.frequency}`);
  return lines.join("\n");
}
