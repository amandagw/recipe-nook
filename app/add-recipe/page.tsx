import Link from "next/link";
import { redirect } from "next/navigation";
import { ManualRecipeForm } from "@/components/manual-recipe-form";
import { getSession } from "@/lib/auth";
import { listRecipesByUser } from "@/lib/repositories/recipes";

function getSavedRecipeOptions(
  recipes: Awaited<ReturnType<typeof listRecipesByUser>>
) {
  return {
    folders: Array.from(new Set(recipes.map((recipe) => recipe.folder).filter(Boolean))).sort(),
    tags: Array.from(new Set(recipes.flatMap((recipe) => recipe.tags).filter(Boolean))).sort()
  };
}

export default async function AddRecipePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth");
  }

  const savedRecipes = await listRecipesByUser(session.userId);
  const savedOptions = getSavedRecipeOptions(savedRecipes);

  return (
    <main className="detail-shell">
      <Link className="text-link" href="/">
        Back to Recipe Nook
      </Link>

      <section className="detail-hero">
        <div>
          <p className="eyebrow">Recipe Capture</p>
          <h1>Save a new recipe</h1>
          <p className="hero-text">
            Bring in a recipe from a link or build one by hand, then file it into your
            nook with notes, tags, and source details.
          </p>
        </div>
      </section>

      <section className="capture-grid">
        <article className="panel panel-warm">
          <div className="section-heading">
            <p className="eyebrow">Add via URL</p>
            <h2>Import from a link</h2>
          </div>
          <label className="input-label">
            Recipe link
            <input value="https://example.com/spicy-sesame-noodles" readOnly />
          </label>
          <div className="capture-preview">
            <p className="small-label">Extracted preview</p>
            <strong>Spicy Sesame Noodles</strong>
            <span>Ingredients, steps, and title are auto-detected when available.</span>
          </div>
          <div className="tag-row">
            <span>quick</span>
            <span>noodles</span>
            <span>dinner</span>
          </div>
          <button className="primary-button muted">Import recipe</button>
        </article>

        <ManualRecipeForm folderOptions={savedOptions.folders} tagOptions={savedOptions.tags} />
      </section>
    </main>
  );
}
