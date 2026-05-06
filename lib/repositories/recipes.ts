import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";
import {
  MealPlanDocument,
  RecipeDocument,
  RecipeNoteDocument,
  ShoppingListDocument
} from "@/lib/models";
import { Difficulty } from "@/lib/types";

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

export async function deleteRecipeById(userId: string, recipeId: string) {
  const recipes = await getRecipesCollection();
  const userObjectId = new ObjectId(userId);
  const recipeObjectId = new ObjectId(recipeId);

  const result = await recipes.deleteOne({
    _id: recipeObjectId,
    userId: userObjectId
  });

  if (result.deletedCount === 0) {
    return false;
  }

  const [recipeNotes, mealPlans, shoppingLists] = await Promise.all([
    getRecipeNotesCollection(),
    getMealPlansCollection(),
    getShoppingListsCollection()
  ]);

  await Promise.all([
    recipeNotes.deleteMany({ userId: userObjectId, recipeId: recipeObjectId }),
    mealPlans.deleteMany({ userId: userObjectId, recipeId: recipeObjectId }),
    shoppingLists.updateMany(
      { userId: userObjectId, recipeIds: recipeObjectId },
      { $pull: { recipeIds: recipeObjectId } }
    )
  ]);

  return true;
}

export async function getRecipeNotesCollection() {
  const database = await getDatabase();
  const collection = database.collection<RecipeNoteDocument>("recipeNotes");
  await collection.createIndex({ userId: 1, recipeId: 1, cookedAt: -1 });
  return collection;
}

export async function listRecipeNotesByUser(userId: string) {
  const notes = await getRecipeNotesCollection();
  return notes.find({ userId: new ObjectId(userId) }).sort({ cookedAt: -1 }).toArray();
}

export async function listRecipeNotesByRecipe(userId: string, recipeId: string) {
  const notes = await getRecipeNotesCollection();
  return notes
    .find({
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    })
    .sort({ cookedAt: -1 })
    .toArray();
}

export async function createRecipeNote(
  userId: string,
  recipeId: string,
  input: {
    rating: number;
    wouldMakeAgain: boolean;
    notes: string;
    modifications: string[];
    actualCookingTime: string;
    difficulty: Difficulty;
  }
) {
  const recipes = await getRecipesCollection();
  const recipeNotes = await getRecipeNotesCollection();
  const userObjectId = new ObjectId(userId);
  const recipeObjectId = new ObjectId(recipeId);
  const now = new Date();
  const recipe = await recipes.findOne({
    _id: recipeObjectId,
    userId: userObjectId
  });

  if (!recipe) {
    return null;
  }

  const document: RecipeNoteDocument = {
    userId: userObjectId,
    recipeId: recipeObjectId,
    rating: input.rating,
    wouldMakeAgain: input.wouldMakeAgain,
    notes: input.notes,
    modifications: input.modifications,
    actualCookingTime: input.actualCookingTime,
    difficulty: input.difficulty,
    cookedAt: now,
    createdAt: now,
    updatedAt: now
  };

  const result = await recipeNotes.insertOne(document);
  await recipes.updateOne(
    {
      _id: recipeObjectId,
      userId: userObjectId
    },
    {
      $set: {
        status: "Tried",
        updatedAt: now
      }
    }
  );

  return {
    ...document,
    _id: result.insertedId
  };
}

export async function updateRecipeNoteById(
  userId: string,
  recipeId: string,
  noteId: string,
  input: {
    rating: number;
    wouldMakeAgain: boolean;
    notes: string;
    modifications: string[];
    actualCookingTime: string;
    difficulty: Difficulty;
  }
) {
  const recipeNotes = await getRecipeNotesCollection();

  await recipeNotes.updateOne(
    {
      _id: new ObjectId(noteId),
      userId: new ObjectId(userId),
      recipeId: new ObjectId(recipeId)
    },
    {
      $set: {
        rating: input.rating,
        wouldMakeAgain: input.wouldMakeAgain,
        notes: input.notes,
        modifications: input.modifications,
        actualCookingTime: input.actualCookingTime,
        difficulty: input.difficulty,
        updatedAt: new Date()
      }
    }
  );

  return recipeNotes.findOne({
    _id: new ObjectId(noteId),
    userId: new ObjectId(userId),
    recipeId: new ObjectId(recipeId)
  });
}

export async function getMealPlansCollection() {
  const database = await getDatabase();
  return database.collection<MealPlanDocument>("mealPlans");
}

export async function getShoppingListsCollection() {
  const database = await getDatabase();
  const collection = database.collection<ShoppingListDocument>("shoppingLists");
  await collection.createIndex({ userId: 1 }, { unique: true });
  return collection;
}

export async function getOrCreateShoppingListByUser(userId: string) {
  const shoppingLists = await getShoppingListsCollection();
  const userObjectId = new ObjectId(userId);
  const existingList = await shoppingLists.findOne({ userId: userObjectId });

  if (existingList) {
    return existingList;
  }

  const now = new Date();
  const document: ShoppingListDocument = {
    userId: userObjectId,
    title: "My Shopping List",
    items: [],
    recipeIds: [],
    createdAt: now,
    updatedAt: now
  };
  const result = await shoppingLists.insertOne(document);

  return {
    ...document,
    _id: result.insertedId
  };
}

export async function getShoppingListByUser(userId: string) {
  const shoppingLists = await getShoppingListsCollection();
  return shoppingLists.findOne({ userId: new ObjectId(userId) });
}

export async function updateShoppingListByUser(
  userId: string,
  input: Pick<ShoppingListDocument, "items" | "recipeIds">
) {
  const shoppingLists = await getShoppingListsCollection();
  const userObjectId = new ObjectId(userId);
  const now = new Date();

  await shoppingLists.updateOne(
    { userId: userObjectId },
    {
      $set: {
        title: "My Shopping List",
        items: input.items,
        recipeIds: input.recipeIds,
        updatedAt: now
      },
      $setOnInsert: {
        userId: userObjectId,
        createdAt: now
      }
    },
    { upsert: true }
  );

  return shoppingLists.findOne({ userId: userObjectId });
}

export function toObjectId(value: string) {
  return new ObjectId(value);
}
