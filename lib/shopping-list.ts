import { ShoppingListDocument } from "@/lib/models";

export const SHOPPING_CATEGORIES = [
  "Produce",
  "Meat & Seafood",
  "Dairy",
  "Bakery",
  "Pantry",
  "Spices",
  "Frozen",
  "Other"
];

export type ShoppingListItem = ShoppingListDocument["items"][number];

const categoryKeywords: Array<{ category: string; keywords: string[] }> = [
  {
    category: "Produce",
    keywords: [
      "apple",
      "arugula",
      "avocado",
      "banana",
      "basil",
      "broccoli",
      "carrot",
      "cilantro",
      "garlic",
      "ginger",
      "herb",
      "lemon",
      "lime",
      "lettuce",
      "mushroom",
      "onion",
      "orange",
      "parsley",
      "pear",
      "bell pepper",
      "potato",
      "scallion",
      "spinach",
      "tomato",
      "zest"
    ]
  },
  {
    category: "Meat & Seafood",
    keywords: [
      "beef",
      "chicken",
      "fish",
      "pork",
      "salmon",
      "sausage",
      "shrimp",
      "steak",
      "thigh",
      "turkey"
    ]
  },
  {
    category: "Dairy",
    keywords: [
      "butter",
      "cheddar",
      "cheese",
      "cream",
      "egg",
      "feta",
      "milk",
      "mozzarella",
      "parmesan",
      "yogurt"
    ]
  },
  {
    category: "Bakery",
    keywords: ["bagel", "bread", "bun", "croissant", "pita", "roll", "tortilla"]
  },
  {
    category: "Frozen",
    keywords: ["frozen", "ice cream", "peas"]
  },
  {
    category: "Spices",
    keywords: [
      "cardamom",
      "chili",
      "cinnamon",
      "cumin",
      "flake",
      "oregano",
      "paprika",
      "pepper",
      "sage",
      "salt",
      "spice",
      "thyme"
    ]
  }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeShoppingCategory(category: string) {
  return SHOPPING_CATEGORIES.includes(category) ? category : "Other";
}

export function categorizeIngredient(ingredient: string) {
  const value = ingredient.toLowerCase();

  for (const group of categoryKeywords) {
    if (group.keywords.some((keyword) => value.includes(keyword))) {
      return group.category;
    }
  }

  return "Pantry";
}

export function shoppingItemKey(item: Pick<ShoppingListItem, "name" | "category">) {
  return `${slugify(item.category)}:${slugify(item.name)}`;
}

export function makeRecipeShoppingItem(recipeId: string, ingredient: string): ShoppingListItem {
  const category = categorizeIngredient(ingredient);

  return {
    id: `recipe:${shoppingItemKey({ name: ingredient, category })}`,
    name: ingredient,
    category,
    checked: false,
    source: "recipe",
    recipeIds: [recipeId]
  };
}

export function makeManualShoppingItem(name: string, category: string): ShoppingListItem {
  const safeCategory = normalizeShoppingCategory(category);
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: `manual:${slugify(name)}:${suffix}`,
    name,
    category: safeCategory,
    checked: false,
    source: "manual",
    recipeIds: []
  };
}
