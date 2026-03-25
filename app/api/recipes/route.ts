import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createRecipe, listRecipesByUser, countRecipesBySlug, toObjectId } from "@/lib/repositories/recipes";
import { recipes } from "@/lib/mock-data";

export async function GET() {
  const session = await getSession();

  if (session) {
    const userRecipes = await listRecipesByUser(session.userId);

    return NextResponse.json({
      recipes: userRecipes.map((recipe) => ({
        id: recipe._id?.toString(),
        title: recipe.title,
        slug: recipe.slug,
        folder: recipe.folder,
        tags: recipe.tags,
        image: recipe.image,
        notes: recipe.notes,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        createdAt: recipe.createdAt
      }))
    });
  }

  return NextResponse.json({
    recipes
  });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Please log in to save a recipe." }, { status: 401 });
  }

  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const folder = String(payload.folder ?? "").trim();
  const notes = String(payload.notes ?? "").trim();
  const image = String(payload.image ?? "").trim();

  const ingredients = String(payload.ingredients ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const steps = String(payload.steps ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const tags = String(payload.tags ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!title) {
    return NextResponse.json({ error: "Please add a recipe title." }, { status: 400 });
  }

  if (!folder) {
    return NextResponse.json({ error: "Please choose a folder name." }, { status: 400 });
  }

  if (ingredients.length === 0) {
    return NextResponse.json(
      { error: "Please add at least one ingredient." },
      { status: 400 }
    );
  }

  if (steps.length === 0) {
    return NextResponse.json(
      { error: "Please add at least one instruction step." },
      { status: 400 }
    );
  }

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "recipe";

  const existingCount = await countRecipesBySlug(session.userId, baseSlug);
  const slug = existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;

  const recipe = await createRecipe({
    userId: toObjectId(session.userId),
    title,
    slug,
    description: notes || `${title} saved in ${folder}.`,
    source: "Manual entry",
    sourceType: "Manual Entry",
    folder,
    status: "To Try",
    image,
    cookTime: "",
    prepTime: "",
    servings: 0,
    tags,
    ingredients,
    steps,
    notes
  });

  return NextResponse.json(
    {
      message: "Recipe saved to your nook.",
      recipe: {
        id: recipe._id?.toString(),
        title: recipe.title,
        slug: recipe.slug
      }
    },
    { status: 201 }
  );
}
