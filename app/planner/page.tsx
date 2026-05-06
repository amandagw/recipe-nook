import Link from "next/link";
import { redirect } from "next/navigation";
import { WeeklyMealPlanner } from "@/components/weekly-meal-planner";
import { getSession } from "@/lib/auth";
import {
  listMealPlanEntriesByWeek,
  listRecipesByUser
} from "@/lib/repositories/recipes";
import {
  isPlannerDay,
  isPlannerMeal,
  normalizeWeekStart,
  PlannerDay,
  PlannerMeal
} from "@/lib/meal-planner";

type PlannerPageProps = {
  searchParams?: Promise<{
    week?: string;
  }>;
};

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/auth");
  }

  const resolvedSearchParams = await searchParams;
  const weekStart = normalizeWeekStart(resolvedSearchParams?.week);
  const [recipes, mealPlanEntries] = await Promise.all([
    listRecipesByUser(session.userId),
    listMealPlanEntriesByWeek(session.userId, weekStart)
  ]);
  const recipeOptions = recipes
    .map((recipe) => ({
      id: recipe._id?.toString() ?? "",
      title: recipe.title,
      slug: recipe.slug
    }))
    .filter((recipe) => recipe.id);
  const entries = mealPlanEntries.flatMap((entry) => {
    if (!isPlannerDay(entry.day) || !isPlannerMeal(entry.meal)) {
      return [];
    }

    return [
      {
        day: entry.day as PlannerDay,
        meal: entry.meal as PlannerMeal,
        recipeId: entry.recipeId.toString()
      }
    ];
  });

  return (
    <main className="detail-shell">
      <Link className="text-link" href="/">
        Back to Recipe Nook
      </Link>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Meal Planning</p>
          <h1>Weekly meal planner</h1>
          <p className="hero-text">
            Add saved recipes to breakfast, lunch, dinner, or other. Leave blanks
            open and reuse favorites across as many days as you like.
          </p>
        </div>
      </section>

      <WeeklyMealPlanner entries={entries} recipes={recipeOptions} weekStart={weekStart} />
    </main>
  );
}
