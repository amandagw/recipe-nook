import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { recipes as mockRecipes } from "@/lib/mock-data";
import { findRecipeBySlug } from "@/lib/repositories/recipes";
import { serializeRecipe } from "@/lib/serializers";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getSession();

  if (!session) {
    const recipe = mockRecipes.find((entry) => entry.slug === slug);

    if (!recipe) {
      notFound();
    }

    return (
      <main className="detail-shell">
        <Link className="text-link" href="/">
          Back to Recipe Nook
        </Link>

        <section className="detail-hero">
          <div>
            <p className="eyebrow">{recipe.folder}</p>
            <h1>{recipe.title}</h1>
            <p className="hero-text">{recipe.description}</p>
          </div>
          <div className="detail-summary">
            <span>{recipe.prepTime} prep</span>
            <span>{recipe.cookTime} cook</span>
            <span>{recipe.servings} servings</span>
            <span>{recipe.status}</span>
          </div>
        </section>

        <section className="detail-grid">
          <article className="panel">
            <p className="small-label">Ingredients</p>
            <ul>
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <p className="small-label">Method</p>
            <ol>
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="panel panel-warm">
            <p className="small-label">Source & Notes</p>
            <p>{recipe.source}</p>
            <p>{recipe.notes}</p>
          </article>
        </section>
      </main>
    );
  }

  const recipeDocument = await findRecipeBySlug(session.userId, slug);

  if (!recipeDocument) {
    notFound();
  }

  const recipe = serializeRecipe(recipeDocument);

  return (
    <main className="detail-shell">
      <div className="detail-topbar">
        <Link className="text-link" href="/">
          Back to Recipe Nook
        </Link>
        <Link className="secondary-button" href={`/recipes/${recipe.slug}/edit`}>
          Edit recipe
        </Link>
      </div>

      <section className="detail-hero">
        <div>
          <p className="eyebrow">{recipe.folder}</p>
          <h1>{recipe.title}</h1>
          <p className="hero-text">{recipe.description}</p>
        </div>
        <div className="detail-summary">
          <span>{recipe.prepTime || "Prep not set"}</span>
          <span>{recipe.cookTime || "Cook not set"}</span>
          <span>{recipe.servings > 0 ? `${recipe.servings} servings` : "Servings not set"}</span>
          <span>{recipe.status}</span>
        </div>
      </section>

      <section className="detail-grid">
        <article className="panel">
          <p className="small-label">Ingredients</p>
          <ul>
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="small-label">Method</p>
          <ol>
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="panel panel-warm">
          <p className="small-label">Source & Notes</p>
          <p>{recipe.source}</p>
          <p>{recipe.notes || "No notes added yet."}</p>
        </article>
      </section>
    </main>
  );
}
