import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { ManualRecipeForm } from "@/components/manual-recipe-form";
import { getSession } from "@/lib/auth";
import { findRecipeBySlug, listRecipesByUser } from "@/lib/repositories/recipes";

function getSavedRecipeOptions(
  recipes: Awaited<ReturnType<typeof listRecipesByUser>>
) {
  return {
    folders: Array.from(new Set(recipes.map((entry) => entry.folder).filter(Boolean))).sort(),
    tags: Array.from(new Set(recipes.flatMap((entry) => entry.tags).filter(Boolean))).sort()
  };
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditRecipePage({ params }: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/auth");
  }

  const { slug } = await params;
  const [recipe, savedRecipes] = await Promise.all([
    findRecipeBySlug(session.userId, slug),
    listRecipesByUser(session.userId)
  ]);

  if (!recipe) {
    notFound();
  }

  const savedOptions = getSavedRecipeOptions(savedRecipes);
  const recipeId = recipe._id?.toString() ?? "";

  return (
    <main className="detail-shell">
      <div className="detail-topbar">
        <Link className="text-link" href={`/recipes/${recipe.slug}`}>
          Back to recipe
        </Link>
        {recipeId ? (
          <div className="detail-actions">
            <DeleteRecipeButton recipeId={recipeId} recipeTitle={recipe.title} />
          </div>
        ) : null}
      </div>

      <section className="detail-hero">
        <div>
          <p className="eyebrow">Edit Recipe</p>
          <h1>Update {recipe.title}</h1>
          <p className="hero-text">
            Adjust the saved card whenever you tweak ingredients, rewrite the method, or
            swap in a new image.
          </p>
        </div>
      </section>

      <section className="capture-grid">
        <ManualRecipeForm
          initialValues={{
            id: recipe._id?.toString(),
            title: recipe.title,
            folder: recipe.folder,
            servings: recipe.servings,
            tags: recipe.tags,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            notes: recipe.notes,
            image: recipe.image
          }}
          folderOptions={savedOptions.folders}
          tagOptions={savedOptions.tags}
          mode="edit"
        />
      </section>
    </main>
  );
}
