import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import {
  MealPlanDocument,
  RecipeDocument,
  RecipeNoteDocument,
  ShoppingListDocument
} from "@/lib/models";

export async function getRecipesCollection() {
  const database = await getDatabase();
  const collection = database.collection<RecipeDocument>("recipes");
  await collection.createIndex({ userId: 1, createdAt: -1 });
  await collection.createIndex({ userId: 1, slug: 1 }, { unique: true });
  return collection;
}

export async function createRecipe(
  input: Omit<RecipeDocument, "_id" | "createdAt" | "updatedAt">
) {
  const recipes = await getRecipesCollection();
  const now = new Date();

  const document: RecipeDocument = {
    ...input,
    createdAt: now,
    updatedAt: now
  };

  const result = await recipes.insertOne(document);

  return {
    ...document,
    _id: result.insertedId
  };
}

export async function listRecipesByUser(userId: string) {
  const recipes = await getRecipesCollection();
  return recipes.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
}

export async function countRecipesBySlug(userId: string, slug: string) {
  const recipes = await getRecipesCollection();
  return recipes.countDocuments({
    userId: new ObjectId(userId),
    slug
  });
}

export async function findRecipeBySlug(userId: string, slug: string) {
  const recipes = await getRecipesCollection();
  return recipes.findOne({
    userId: new ObjectId(userId),
    slug
  });
}

export async function updateRecipeById(
  userId: string,
  recipeId: string,
  input: Partial<Omit<RecipeDocument, "_id" | "userId" | "createdAt" | "updatedAt">>
) {
  const recipes = await getRecipesCollection();

  await recipes.updateOne(
    {
      _id: new ObjectId(recipeId),
      userId: new ObjectId(userId)
    },
    {
      $set: {
        ...input,
        updatedAt: new Date()
      }
    }
  );

  return recipes.findOne({
    _id: new ObjectId(recipeId),
    userId: new ObjectId(userId)
  });
}

export async function getRecipeNotesCollection() {
  const database = await getDatabase();
  return database.collection<RecipeNoteDocument>("recipeNotes");
}

export async function getMealPlansCollection() {
  const database = await getDatabase();
  return database.collection<MealPlanDocument>("mealPlans");
}

export async function getShoppingListsCollection() {
  const database = await getDatabase();
  return database.collection<ShoppingListDocument>("shoppingLists");
}

export function toObjectId(value: string) {
  return new ObjectId(value);
}
