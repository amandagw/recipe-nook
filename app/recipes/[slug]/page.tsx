import Link from "next/link";
import { notFound } from "next/navigation";
import { recipes } from "@/lib/mock-data";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = recipes.find((entry) => entry.slug === slug);

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
