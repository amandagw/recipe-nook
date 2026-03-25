import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateRecipeById } from "@/lib/repositories/recipes";

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

  const updatedRecipe = await updateRecipeById(session.userId, id, {
    title,
    folder,
    tags,
    ingredients,
    steps,
    notes,
    image,
    description: notes || `${title} saved in ${folder}.`
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
