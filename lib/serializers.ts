import { RecipeDocument, RecipeNoteDocument } from "@/lib/models";
import { Difficulty, JournalEntry, Recipe } from "@/lib/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80";

function normalizeDifficulty(value: unknown): Difficulty {
  const difficulty = Number(value);

  if (difficulty >= 1 && difficulty <= 5) {
    return Math.floor(difficulty) as Difficulty;
  }

  return 3;
}

export function serializeRecipeNote(note: RecipeNoteDocument): JournalEntry {
  return {
    id: note._id?.toString(),
    date: note.cookedAt.toISOString(),
    rating: note.rating,
    wouldMakeAgain: note.wouldMakeAgain,
    notes: note.notes,
    modifications: note.modifications,
    actualCookingTime: note.actualCookingTime,
    difficulty: normalizeDifficulty(note.difficulty)
  };
}

export function serializeRecipe(
  recipe: RecipeDocument,
  journal: JournalEntry[] = []
): Recipe {
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
    journal
  };
}
