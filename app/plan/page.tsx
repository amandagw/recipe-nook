import Link from "next/link";
import { getSession } from "@/lib/auth";
import { plannedMeals, recipes, shoppingList } from "@/lib/mock-data";
import { getShoppingListByUser } from "@/lib/repositories/recipes";
import { SHOPPING_CATEGORIES, type ShoppingListItem } from "@/lib/shopping-list";

type ShoppingPreviewGroup = {
  category: string;
  items: Array<{
    id: string;
    name: string;
    checked: boolean;
  }>;
  hiddenCount: number;
};

function groupShoppingItems(items: ShoppingListItem[]): ShoppingPreviewGroup[] {
  const groupedItems = new Map<string, ShoppingListItem[]>();

  for (const category of SHOPPING_CATEGORIES) {
    groupedItems.set(category, []);
  }

  for (const item of items) {
    const category = SHOPPING_CATEGORIES.includes(item.category) ? item.category : "Other";
    const group = groupedItems.get(category) ?? [];
    group.push(item);
    groupedItems.set(category, group);
  }

  return Array.from(groupedItems.entries())
    .filter(([, group]) => group.length > 0)
    .slice(0, 3)
    .map(([category, group]) => ({
      category,
      items: group.slice(0, 4).map((item) => ({
        id: item.id || `${category}-${item.name}`,
        name: item.name,
        checked: item.checked
      })),
      hiddenCount: Math.max(group.length - 4, 0)
    }));
}

function getMockShoppingPreview(): ShoppingPreviewGroup[] {
  return shoppingList.slice(0, 3).map((group) => ({
    category: group.category,
    items: group.items.slice(0, 4).map((item) => ({
      id: `${group.category}-${item}`,
      name: item,
      checked: false
    })),
    hiddenCount: Math.max(group.items.length - 4, 0)
  }));
}

export default async function PlanPage() {
  const session = await getSession();
  const userShoppingList = session ? await getShoppingListByUser(session.userId) : null;
  const shoppingPreview = userShoppingList
    ? groupShoppingItems(userShoppingList.items)
    : getMockShoppingPreview();
  const shoppingItemCount = userShoppingList?.items.length ?? 0;
  const checkedItemCount = userShoppingList?.items.filter((item) => item.checked).length ?? 0;

  return (
    <main className="detail-shell">
      <Link className="text-link" href="/">
        Back to Recipe Nook
      </Link>

      <section className="detail-hero">
        <div>
          <p className="eyebrow">Plan & Shop</p>
          <h1>Meal planning and shopping lists</h1>
          <p className="hero-text">
            Organize the week, pair saved recipes with specific days, and keep your
            shopping list grouped and easy to scan.
          </p>
        </div>
      </section>

      <section className="planning-grid">
        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Meal Planning</p>
            <h2>Weekly calendar</h2>
          </div>
          <div className="planner-list">
            {plannedMeals.map((plan) => {
              const recipe = recipes.find((entry) => entry.id === plan.recipeId);

              return (
                <div key={`${plan.day}-${plan.meal}`} className="planner-item">
                  <div>
                    <strong>{plan.day}</strong>
                    <span>{plan.meal}</span>
                  </div>
                  <div>
                    <strong>{recipe?.title}</strong>
                    <span>{plan.note}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link className="text-link" href="/planner">
            Open meal planner
          </Link>
        </article>

        <article className="panel panel-warm">
          <div className="section-heading">
            <p className="eyebrow">Shopping List</p>
            <h2>Combined ingredient roundup</h2>
          </div>
          {userShoppingList ? (
            <p className="shopping-preview-count">
              {checkedItemCount} of {shoppingItemCount} checked
            </p>
          ) : null}
          {shoppingPreview.length > 0 ? (
            <div className="shopping-columns">
              {shoppingPreview.map((group) => (
                <div key={group.category}>
                  <p className="small-label">{group.category}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li
                        className={item.checked ? "shopping-preview-item-checked" : ""}
                        key={item.id}
                      >
                        {item.name}
                      </li>
                    ))}
                    {group.hiddenCount > 0 ? (
                      <li className="shopping-preview-more">+{group.hiddenCount} more</li>
                    ) : null}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="shopping-preview-empty">
              Your shopping list is empty. Open the builder to pull in recipe ingredients
              or add a quick item.
            </p>
          )}
          <Link className="text-link" href="/shopping-list">
            Open shopping list builder
          </Link>
        </article>
      </section>
    </main>
  );
}
