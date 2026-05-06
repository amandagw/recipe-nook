import { ObjectId } from "mongodb";
import { Difficulty, RecipeStatus } from "@/lib/types";

export type UserDocument = {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RecipeDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  slug: string;
  description: string;
  source: string;
  sourceType: "URL Import" | "Manual Entry";
  folder: string;
  status: RecipeStatus;
  image: string;
  cookTime: string;
  prepTime: string;
  servings: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RecipeNoteDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  recipeId: ObjectId;
  rating: number;
  wouldMakeAgain: boolean;
  notes: string;
  modifications: string[];
  actualCookingTime: string;
  difficulty: Difficulty;
  cookedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MealPlanDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  weekStart: string;
  day: string;
  meal: string;
  recipeId: ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ShoppingListDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  items: Array<{
    id: string;
    name: string;
    category: string;
    checked: boolean;
    source: "recipe" | "manual";
    recipeIds?: string[];
  }>;
  recipeIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};
