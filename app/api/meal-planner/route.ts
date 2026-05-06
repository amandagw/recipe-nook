import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  listRecipesByUser,
  updateMealPlanEntriesByWeek
} from "@/lib/repositories/recipes";
import {
  isPlannerDay,
  isPlannerMeal,
  normalizeWeekStart
} from "@/lib/meal-planner";

type PlannerEntryPayload = {
  day?: unknown;
  meal?: unknown;
  recipeId?: unknown;
};

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to update your meal planner." },
      { status: 401 }
    );
  }

  const [payload, recipes] = await Promise.all([request.json(), listRecipesByUser(session.userId)]);
  const weekStart = normalizeWeekStart(String(payload.weekStart ?? ""));
  const allowedRecipeIds = new Set(recipes.map((recipe) => recipe._id?.toString()).filter(Boolean));
  const rawEntries = Array.isArray(payload.entries)
    ? (payload.entries as PlannerEntryPayload[])
    : [];
  const entries = rawEntries
    .map((entry) => {
      const day = String(entry.day ?? "");
      const meal = String(entry.meal ?? "");
      const recipeId = String(entry.recipeId ?? "");

      if (
        !isPlannerDay(day) ||
        !isPlannerMeal(meal) ||
        !ObjectId.isValid(recipeId) ||
        !allowedRecipeIds.has(recipeId)
      ) {
        return null;
      }

      return {
        day,
        meal,
        recipeId
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  await updateMealPlanEntriesByWeek(session.userId, weekStart, entries);

  return NextResponse.json({
    message: "Meal planner updated.",
    entryCount: entries.length
  });
}
