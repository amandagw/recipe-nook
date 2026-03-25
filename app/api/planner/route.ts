import { NextResponse } from "next/server";
import { plannedMeals, recipes, shoppingList } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    plannedMeals,
    linkedRecipes: recipes.filter((recipe) =>
      plannedMeals.some((plan) => plan.recipeId === recipe.id)
    ),
    shoppingList
  });
}
