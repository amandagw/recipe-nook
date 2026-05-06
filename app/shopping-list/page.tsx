import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingListBuilder } from "@/components/shopping-list-builder";
import { getSession } from "@/lib/auth";
import {
  getOrCreateShoppingListByUser,
  listRecipesByUser
} from "@/lib/repositories/recipes";
import {
  normalizeShoppingCategory,
  ShoppingListItem,
  shoppingItemKey
} from "@/lib/shopping-list";

function serializeShoppingItem(item: Partial<ShoppingListItem>): ShoppingListItem | null {
  const name = String(item.name ?? "").trim();
  const category = normalizeShoppingCategory(String(item.category ?? ""));

  if (!name) {
    return null;
  }

  return {
    id: item.id || `manual:${shoppingItemKey({ name, category })}`,
    name,
    category,
    checked: Boolean(item.checked),
    source: item.source === "recipe" ? "recipe" : "manual",
    recipeIds: item.recipeIds ?? []
  };
}

export default async function ShoppingListPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth");
  }

  const [recipes, shoppingList] = await Promise.all([
    listRecipesByUser(session.userId),
    getOrCreateShoppingListByUser(session.userId)
  ]);
  const recipeOptions = recipes.map((recipe) => ({
    id: recipe._id?.toString() ?? "",
    title: recipe.title,
    folder: recipe.folder,
    ingredients: recipe.ingredients
  }));
  const items = shoppingList.items
    .map((item) => serializeShoppingItem(item))
    .filter((item): item is ShoppingListItem => Boolean(item));

  return (
    <main className="detail-shell">
      <Link className="text-link" href="/">
        Back to Recipe Nook
      </Link>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Shopping List</p>
          <h1>Ingredients, grouped and ready</h1>
          <p className="hero-text">
            Select recipes to pull in ingredients, add your own items, and check off
            anything already waiting in the kitchen.
          </p>
        </div>
      </section>

      <ShoppingListBuilder
        initialItems={items}
        initialRecipeIds={shoppingList.recipeIds.map((recipeId) => recipeId.toString())}
        recipes={recipeOptions}
      />
    </main>
  );
}
