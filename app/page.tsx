import { HomePage } from "@/components/home-page";
import { getSession } from "@/lib/auth";
import { recipes as mockRecipes } from "@/lib/mock-data";
import { listRecipesByUser } from "@/lib/repositories/recipes";
import { serializeRecipe } from "@/lib/serializers";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    return <HomePage recipes={mockRecipes} />;
  }

  const userRecipes = await listRecipesByUser(session.userId);
  const recipes = userRecipes.length > 0 ? userRecipes.map(serializeRecipe) : [];

  return <HomePage recipes={recipes} />;
}
