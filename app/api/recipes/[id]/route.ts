import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteRecipeById, updateRecipeById } from "@/lib/repositories/recipes";

const DEFAULT_FOLDER = "Unfiled";

function parseTags(value: unknown) {
  const tags = Array.isArray(value) ? value : String(value ?? "").split(",");

  return Array.from(
    new Set(
      tags
        .map((item) => String(item).trim())
        .filter(Boolean)
    )
  );
}

function parseServings(value: unknown) {
  const servings = Number(value);

  if (!Number.isFinite(servings) || servings < 0) {
    return 0;
  }

  return Math.floor(servings);
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Please log in to edit a recipe." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const title = String(payload.title ?? "").trim();
  const folder = String(payload.folder ?? "").trim() || DEFAULT_FOLDER;
  const notes = String(payload.notes ?? "").trim();
  const image = String(payload.image ?? "").trim();
  const servings = parseServings(payload.servings);

  const ingredients = String(payload.ingredients ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const steps = String(payload.steps ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const tags = parseTags(payload.tags);

  if (!title) {
    return NextResponse.json({ error: "Please add a recipe title." }, { status: 400 });
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

  const updatedRecipe = await updateRecipeById(session.userId, id, {
    title,
    folder,
    servings,
    tags,
    ingredients,
    steps,
    notes,
    image,
    description: notes
  });

  if (!updatedRecipe) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Recipe updated successfully.",
    recipe: {
      id: updatedRecipe._id?.toString(),
      slug: updatedRecipe.slug
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Please log in to delete a recipe." }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteRecipeById(session.userId, id);

  if (!deleted) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Recipe deleted successfully."
  });
}
