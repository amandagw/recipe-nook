import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { importRecipeFromUrl } from "@/lib/recipe-import";
import {
  countRecipesBySlug,
  createRecipe,
  toObjectId
} from "@/lib/repositories/recipes";

export const runtime = "nodejs";

const DEFAULT_IMPORT_FOLDER = "Imported Recipes";

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

function makeSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "recipe"
  );
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Please log in to import a recipe." }, { status: 401 });
  }

  const payload = await request.json();
  const sourceUrl = String(payload.url ?? "").trim();
  const folder = String(payload.folder ?? "").trim() || DEFAULT_IMPORT_FOLDER;
  const userTags = parseTags(payload.tags);

  if (!sourceUrl) {
    return NextResponse.json({ error: "Please paste a recipe link." }, { status: 400 });
  }

  try {
    const importedRecipe = await importRecipeFromUrl(sourceUrl);
    const baseSlug = makeSlug(importedRecipe.title);
    const existingCount = await countRecipesBySlug(session.userId, baseSlug);
    const slug = existingCount > 0 ? `${baseSlug}-${existingCount + 1}` : baseSlug;
    const tags = Array.from(new Set([...userTags, ...importedRecipe.tags]));

    const recipe = await createRecipe({
      userId: toObjectId(session.userId),
      title: importedRecipe.title,
      slug,
      description: importedRecipe.description,
      source: sourceUrl,
      sourceType: "URL Import",
      folder,
      status: "To Try",
      image: importedRecipe.image,
      cookTime: importedRecipe.cookTime,
      prepTime: importedRecipe.prepTime,
      servings: importedRecipe.servings,
      tags,
      ingredients: importedRecipe.ingredients,
      steps: importedRecipe.steps,
      notes: importedRecipe.usedFallback
        ? `Imported from ${importedRecipe.sourceHost}. Review this card and edit any missing details from the original link.`
        : ""
    });

    return NextResponse.json(
      {
        message: importedRecipe.usedFallback
          ? "Recipe card created from the link. Some details may need a quick edit."
          : "Recipe imported successfully.",
        importDetails: {
          ingredientsFound: !importedRecipe.usedFallback || importedRecipe.ingredients.length > 1,
          stepsFound: !importedRecipe.usedFallback || importedRecipe.steps.length > 1,
          sourceHost: importedRecipe.sourceHost,
          usedFallback: importedRecipe.usedFallback
        },
        recipe: {
          id: recipe._id?.toString(),
          title: recipe.title,
          slug: recipe.slug
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import that recipe right now."
      },
      { status: 400 }
    );
  }
}
