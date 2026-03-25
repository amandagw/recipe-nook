import { RecipeDocument } from "@/lib/models";
import { Recipe } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80";

export function serializeRecipe(recipe: RecipeDocument): Recipe {
  return {
    id: recipe._id?.toString() ?? "",
    slug: recipe.slug,
    title: recipe.title,
    source: recipe.source,
    sourceType: recipe.sourceType,
    folder: recipe.folder,
    status: recipe.status,
    description: recipe.description,
    image: recipe.image || fallbackImage,
    cookTime: recipe.cookTime || "",
    prepTime: recipe.prepTime || "",
    servings: recipe.servings || 0,
    tags: recipe.tags,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    notes: recipe.notes,
    journal: []
  };
}
