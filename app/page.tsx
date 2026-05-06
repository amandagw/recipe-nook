import { HomePage } from "@/components/home-page";
import { getSession } from "@/lib/auth";
import { recipes as mockRecipes } from "@/lib/mock-data";
import { listRecipeNotesByUser, listRecipesByUser } from "@/lib/repositories/recipes";
import { serializeRecipe, serializeRecipeNote } from "@/lib/serializers";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    return <HomePage recipes={mockRecipes} />;
  }

  const [userRecipes, recipeNotes] = await Promise.all([
    listRecipesByUser(session.userId),
    listRecipeNotesByUser(session.userId)
  ]);
  const notesByRecipeId = new Map<string, ReturnType<typeof serializeRecipeNote>[]>();

  for (const note of recipeNotes) {
    const recipeId = note.recipeId.toString();
    const notes = notesByRecipeId.get(recipeId) ?? [];
    notes.push(serializeRecipeNote(note));
    notesByRecipeId.set(recipeId, notes);
  }

  const recipes =
    userRecipes.length > 0
      ? userRecipes.map((recipe) =>
          serializeRecipe(recipe, notesByRecipeId.get(recipe._id?.toString() ?? "") ?? [])
        )
      : [];

  return <HomePage recipes={recipes} />;
}
