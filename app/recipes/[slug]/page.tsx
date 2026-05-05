import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { getSession } from "@/lib/auth";
import { recipes as mockRecipes } from "@/lib/mock-data";
import { findRecipeBySlug } from "@/lib/repositories/recipes";
import { serializeRecipe } from "@/lib/serializers";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type RecipeDescriptionInput = {
  title: string;
  folder: string;
  description: string;
};

function getDisplayDescription(recipe: RecipeDescriptionInput) {
  const generatedDescriptions = [
    `${recipe.title} saved in ${recipe.folder}.`,
    `${recipe.title} saved to your recipe nook.`
  ];

  return generatedDescriptions.includes(recipe.description) ? "" : recipe.description;
}

function getServingsLabel(servings: number) {
  if (servings <= 0) {
    return "";
  }

  return `Serves ${servings}`;
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getSession();

  if (!session) {
    const recipe = mockRecipes.find((entry) => entry.slug === slug);

    if (!recipe) {
      notFound();
    }

    const description = getDisplayDescription(recipe);
    const servings = getServingsLabel(recipe.servings);

    return (
      <main className="detail-shell">
        <Link className="text-link" href="/">
          Back to Recipe Nook
        </Link>

        <section className="detail-hero">
          <div>
            <p className="eyebrow">{recipe.folder}</p>
            <h1>{recipe.title}</h1>
            {description ? <p className="hero-text">{description}</p> : null}
            {servings ? <p className="recipe-fact-line">{servings}</p> : null}
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
            <ul className="step-list">
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </article>

          <article className="panel panel-warm">
            <p className="small-label">Source & Notes</p>
            <p>{recipe.source}</p>
            {recipe.notes ? <p>{recipe.notes}</p> : null}
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
  const description = getDisplayDescription(recipe);
  const servings = getServingsLabel(recipe.servings);

  return (
    <main className="detail-shell">
      <div className="detail-topbar">
        <Link className="text-link" href="/">
          Back to Recipe Nook
        </Link>
        <div className="detail-actions">
          <Link className="secondary-button" href={`/recipes/${recipe.slug}/edit`}>
            Edit recipe
          </Link>
          <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.title} />
        </div>
      </div>

      <section className="detail-hero">
        <div>
          <p className="eyebrow">{recipe.folder}</p>
          <h1>{recipe.title}</h1>
          {description ? <p className="hero-text">{description}</p> : null}
          {servings ? <p className="recipe-fact-line">{servings}</p> : null}
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
          <ul className="step-list">
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <article className="panel panel-warm">
          <p className="small-label">Source & Notes</p>
          <p>{recipe.source}</p>
          {recipe.notes ? <p>{recipe.notes}</p> : null}
        </article>
      </section>
    </main>
  );
}
