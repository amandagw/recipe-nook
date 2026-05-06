"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  makeManualShoppingItem,
  makeRecipeShoppingItem,
  SHOPPING_CATEGORIES,
  ShoppingListItem,
  shoppingItemKey
} from "@/lib/shopping-list";

type ShoppingRecipe = {
  id: string;
  title: string;
  folder: string;
  ingredients: string[];
};

type ShoppingListBuilderProps = {
  recipes: ShoppingRecipe[];
  initialItems: ShoppingListItem[];
  initialRecipeIds: string[];
};

function groupItemsByCategory(items: ShoppingListItem[]) {
  const categories = new Map<string, ShoppingListItem[]>();

  for (const category of SHOPPING_CATEGORIES) {
    categories.set(category, []);
  }

  for (const item of items) {
    const group = categories.get(item.category) ?? [];
    group.push(item);
    categories.set(item.category, group);
  }

  return Array.from(categories.entries()).filter(([, group]) => group.length > 0);
}

function mergeRecipeIntoItems(items: ShoppingListItem[], recipe: ShoppingRecipe) {
  const nextItems = [...items];
  const itemByKey = new Map(nextItems.map((item) => [shoppingItemKey(item), item]));

  for (const ingredient of recipe.ingredients) {
    const recipeItem = makeRecipeShoppingItem(recipe.id, ingredient);
    const key = shoppingItemKey(recipeItem);
    const existingItem = itemByKey.get(key);

    if (existingItem) {
      if (existingItem.source === "recipe") {
        existingItem.recipeIds = Array.from(
          new Set([...(existingItem.recipeIds ?? []), recipe.id])
        );
      }
      continue;
    }

    nextItems.push(recipeItem);
    itemByKey.set(key, recipeItem);
  }

  return nextItems;
}

function removeRecipeFromItems(items: ShoppingListItem[], recipeId: string) {
  return items.flatMap((item) => {
    if (item.source !== "recipe") {
      return [item];
    }

    const recipeIds = (item.recipeIds ?? []).filter((currentId) => currentId !== recipeId);

    return recipeIds.length > 0 ? [{ ...item, recipeIds }] : [];
  });
}

export function ShoppingListBuilder({
  recipes,
  initialItems,
  initialRecipeIds
}: ShoppingListBuilderProps) {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(initialRecipeIds);
  const [items, setItems] = useState(initialItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(SHOPPING_CATEGORIES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const groupedItems = useMemo(() => groupItemsByCategory(items), [items]);
  const checkedCount = items.filter((item) => item.checked).length;

  async function persist(nextItems: ShoppingListItem[], nextRecipeIds: string[]) {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/shopping-list", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: nextItems,
          recipeIds: nextRecipeIds
        })
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to update your shopping list right now.");
        return;
      }

      setSuccess(payload.message ?? "Shopping list updated.");
    } catch {
      setError("Unable to update your shopping list right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateList(nextItems: ShoppingListItem[], nextRecipeIds = selectedRecipeIds) {
    setItems(nextItems);
    setSelectedRecipeIds(nextRecipeIds);
    void persist(nextItems, nextRecipeIds);
  }

  function toggleRecipe(recipe: ShoppingRecipe) {
    if (selectedRecipeIds.includes(recipe.id)) {
      const nextRecipeIds = selectedRecipeIds.filter((recipeId) => recipeId !== recipe.id);
      updateList(removeRecipeFromItems(items, recipe.id), nextRecipeIds);
      return;
    }

    const nextRecipeIds = [...selectedRecipeIds, recipe.id];
    updateList(mergeRecipeIntoItems(items, recipe), nextRecipeIds);
  }

  function toggleItem(itemId: string) {
    updateList(
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              checked: !item.checked
            }
          : item
      )
    );
  }

  function deleteItem(itemId: string) {
    updateList(items.filter((item) => item.id !== itemId));
  }

  function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newItemName.trim();

    if (!name) {
      return;
    }

    const nextItems = [...items, makeManualShoppingItem(name, newItemCategory)];
    setNewItemName("");
    updateList(nextItems);
  }

  return (
    <section className="shopping-builder">
      <article className="panel shopping-recipe-picker">
        <div className="section-heading">
          <p className="eyebrow">Recipe Pull</p>
          <h2>Select recipes</h2>
        </div>

        {recipes.length > 0 ? (
          <div className="shopping-recipe-list">
            {recipes.map((recipe) => (
              <label className="shopping-recipe-option" key={recipe.id}>
                <input
                  checked={selectedRecipeIds.includes(recipe.id)}
                  onChange={() => toggleRecipe(recipe)}
                  type="checkbox"
                />
                <span>
                  <strong>{recipe.title}</strong>
                  <small>{recipe.folder}</small>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="journal-empty">Save a recipe first, then add its ingredients here.</p>
        )}
      </article>

      <article className="panel panel-warm shopping-add-panel">
        <div className="section-heading">
          <p className="eyebrow">Add Item</p>
          <h2>Quick add</h2>
        </div>

        <form className="shopping-add-form" onSubmit={handleAddItem}>
          <label className="input-label">
            Item
            <input
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Olive oil"
              value={newItemName}
            />
          </label>
          <label className="input-label">
            Category
            <select
              onChange={(event) => setNewItemCategory(event.target.value)}
              value={newItemCategory}
            >
              {SHOPPING_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <button className="primary-button muted" disabled={isSaving} type="submit">
            Add to list
          </button>
        </form>
      </article>

      <div className="shopping-status-row">
        <span>
          {checkedCount} of {items.length} checked
        </span>
        {isSaving ? <span>Saving...</span> : null}
        {error ? <span className="form-error">{error}</span> : null}
        {success && !error && !isSaving ? <span className="form-success">{success}</span> : null}
      </div>

      {groupedItems.length > 0 ? (
        <section className="shopping-list-grid">
          {groupedItems.map(([category, group]) => (
            <article className="panel panel-warm shopping-category-card" key={category}>
              <p className="small-label">{category}</p>
              <div className="shopping-item-list">
                {group.map((item) => (
                  <div
                    className={`shopping-item ${item.checked ? "shopping-item-checked" : ""}`}
                    key={item.id}
                  >
                    <label>
                      <input
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        type="checkbox"
                      />
                      <span>{item.name}</span>
                    </label>
                    <button
                      aria-label={`Delete ${item.name}`}
                      className="shopping-delete-button"
                      onClick={() => deleteItem(item.id)}
                      type="button"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <article className="panel panel-warm shopping-empty">
          <p className="eyebrow">Shopping List</p>
          <h2>Your list is empty</h2>
          <p>Select a recipe or add an item to start building your grocery list.</p>
        </article>
      )}
    </section>
  );
}
