import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  listRecipesByUser,
  updateShoppingListByUser
} from "@/lib/repositories/recipes";
import { normalizeShoppingCategory, ShoppingListItem } from "@/lib/shopping-list";

type ShoppingListItemPayload = {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  checked?: unknown;
  source?: unknown;
  recipeIds?: unknown;
};

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item)).filter(Boolean);
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to update your shopping list." },
      { status: 401 }
    );
  }

  const [payload, recipes] = await Promise.all([request.json(), listRecipesByUser(session.userId)]);
  const allowedRecipeIds = new Set(recipes.map((recipe) => recipe._id?.toString()).filter(Boolean));
  const selectedRecipeIds = parseStringArray(payload.recipeIds).filter(
    (recipeId) => ObjectId.isValid(recipeId) && allowedRecipeIds.has(recipeId)
  );
  const selectedRecipeIdSet = new Set(selectedRecipeIds);
  const rawItems = Array.isArray(payload.items) ? (payload.items as ShoppingListItemPayload[]) : [];
  const items: ShoppingListItem[] = rawItems
    .map((item): ShoppingListItem | null => {
      const name = String(item.name ?? "").trim();
      const id = String(item.id ?? "").trim();
      const source: ShoppingListItem["source"] =
        item.source === "recipe" ? "recipe" : "manual";
      const recipeIds =
        source === "recipe"
          ? parseStringArray(item.recipeIds).filter((recipeId) =>
              selectedRecipeIdSet.has(recipeId)
            )
          : [];

      if (!name || !id || (source === "recipe" && recipeIds.length === 0)) {
        return null;
      }

      return {
        id,
        name,
        category: normalizeShoppingCategory(String(item.category ?? "")),
        checked: Boolean(item.checked),
        source,
        recipeIds
      };
    })
    .filter((item): item is ShoppingListItem => item !== null);

  const updatedList = await updateShoppingListByUser(session.userId, {
    items,
    recipeIds: selectedRecipeIds.map((recipeId) => new ObjectId(recipeId))
  });

  return NextResponse.json({
    message: "Shopping list updated.",
    shoppingList: {
      id: updatedList?._id?.toString(),
      itemCount: updatedList?.items.length ?? 0
    }
  });
}
