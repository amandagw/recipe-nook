import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ManualRecipeForm } from "@/components/manual-recipe-form";
import { getSession } from "@/lib/auth";
import { findRecipeBySlug } from "@/lib/repositories/recipes";

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
  const recipe = await findRecipeBySlug(session.userId, slug);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="detail-shell">
      <div className="detail-topbar">
        <Link className="text-link" href={`/recipes/${recipe.slug}`}>
          Back to recipe
        </Link>
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
            tags: recipe.tags,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            notes: recipe.notes,
            image: recipe.image
          }}
          mode="edit"
        />
      </section>
    </main>
  );
}
