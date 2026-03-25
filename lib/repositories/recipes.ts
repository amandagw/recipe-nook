import { getDatabase } from "@/lib/db";
import { MealPlanDocument, RecipeDocument, RecipeNoteDocument, ShoppingListDocument } from "@/lib/models";

export async function getRecipesCollection() {
  const database = await getDatabase();
  return database.collection<RecipeDocument>("recipes");
}

export async function getRecipeNotesCollection() {
  const database = await getDatabase();
  return database.collection<RecipeNoteDocument>("recipeNotes");
}

export async function getMealPlansCollection() {
  const database = await getDatabase();
  return database.collection<MealPlanDocument>("mealPlans");
}

export async function getShoppingListsCollection() {
  const database = await getDatabase();
  return database.collection<ShoppingListDocument>("shoppingLists");
}
