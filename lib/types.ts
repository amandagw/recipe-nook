export type RecipeStatus = "To Try" | "Tried";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type JournalEntry = {
  id?: string;
  date: string;
  rating: number;
  wouldMakeAgain: boolean;
  notes: string;
  modifications: string[];
  actualCookingTime: string;
  difficulty: Difficulty;
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  source: string;
  sourceType: "URL Import" | "Manual Entry";
  folder: string;
  status: RecipeStatus;
  description: string;
  image: string;
  cookTime: string;
  prepTime: string;
  servings: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  notes: string;
  journal: JournalEntry[];
};

export type PlannedMeal = {
  day: string;
  meal: string;
  recipeId: string;
  note: string;
};
