export const PLANNER_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;

export const PLANNER_MEALS = ["Breakfast", "Lunch", "Dinner", "Other"] as const;

export type PlannerDay = (typeof PLANNER_DAYS)[number];
export type PlannerMeal = (typeof PLANNER_MEALS)[number];

export function isPlannerDay(value: string): value is PlannerDay {
  return PLANNER_DAYS.includes(value as PlannerDay);
}

export function isPlannerMeal(value: string): value is PlannerMeal {
  return PLANNER_MEALS.includes(value as PlannerMeal);
}

export function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + distanceToMonday);

  return formatDateForInput(monday);
}

export function normalizeWeekStart(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return getCurrentWeekStart();
  }

  return value;
}
