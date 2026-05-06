import { PlannedMeal, Recipe } from "@/lib/types";

export const recipes: Recipe[] = [
  {
    id: "rec-001",
    slug: "brown-butter-tomato-pasta",
    title: "Brown Butter Tomato Pasta",
    source: "https://www.themodernproper.com",
    sourceType: "URL Import",
    folder: "Weeknight Dinner",
    status: "Tried",
    description:
      "Comforting rigatoni with blistered cherry tomatoes, sage, and a silky brown butter finish.",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
    cookTime: "30 min",
    prepTime: "10 min",
    servings: 4,
    tags: ["quick", "pasta", "cozy", "vegetarian"],
    ingredients: [
      "12 oz rigatoni",
      "3 cups cherry tomatoes",
      "6 tbsp unsalted butter",
      "2 garlic cloves, sliced",
      "8 sage leaves",
      "1/2 cup grated parmesan",
      "1 tsp chili flakes",
      "Salt and black pepper"
    ],
    steps: [
      "Boil pasta until just shy of al dente and reserve 1 cup pasta water.",
      "Brown butter with garlic and sage until nutty and fragrant.",
      "Add tomatoes and chili flakes, cooking until blistered and jammy.",
      "Toss pasta, parmesan, and pasta water into the pan until glossy.",
      "Finish with black pepper and extra parmesan."
    ],
    notes:
      "Best when tomatoes are very ripe. Add lemon zest if the sauce needs brightness.",
    journal: [
      {
        date: "2026-03-11",
        rating: 5,
        wouldMakeAgain: true,
        notes: "Total keeper. Sauce felt restaurant-level with barely any effort.",
        modifications: [
          "Used spinach rigatoni",
          "Added lemon zest at the end"
        ],
        actualCookingTime: "35 min",
        difficulty: 2
      }
    ]
  },
  {
    id: "rec-002",
    slug: "gochujang-sheet-pan-chicken",
    title: "Gochujang Sheet Pan Chicken",
    source: "Manual recipe notes",
    sourceType: "Manual Entry",
    folder: "Meal Prep",
    status: "To Try",
    description:
      "A sweet-spicy tray bake with roasted chicken thighs, carrots, and charred scallions.",
    image:
      "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80",
    cookTime: "45 min",
    prepTime: "15 min",
    servings: 5,
    tags: ["spicy", "high-protein", "meal prep", "sheet pan"],
    ingredients: [
      "6 chicken thighs",
      "2 tbsp gochujang",
      "2 tbsp soy sauce",
      "1 tbsp honey",
      "1 tbsp sesame oil",
      "5 carrots, sliced",
      "1 bunch scallions",
      "Cooked jasmine rice"
    ],
    steps: [
      "Whisk gochujang, soy sauce, honey, and sesame oil into a glaze.",
      "Coat chicken and carrots on a sheet pan.",
      "Roast at 425F for 35 minutes, adding scallions in the last 10 minutes.",
      "Broil briefly for caramelized edges and serve over rice."
    ],
    notes: "Planning to try with tofu too for a vegetarian version.",
    journal: []
  },
  {
    id: "rec-003",
    slug: "cardamom-pear-baked-oatmeal",
    title: "Cardamom Pear Baked Oatmeal",
    source: "https://www.bonappetit.com",
    sourceType: "URL Import",
    folder: "Breakfast Basket",
    status: "Tried",
    description:
      "Soft baked oats layered with pears, maple, and cardamom for slow mornings.",
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    cookTime: "40 min",
    prepTime: "15 min",
    servings: 6,
    tags: ["breakfast", "make ahead", "sweet", "vegetarian"],
    ingredients: [
      "2 cups rolled oats",
      "2 ripe pears, sliced",
      "2 eggs",
      "1 3/4 cups milk",
      "1/4 cup maple syrup",
      "1 tsp cardamom",
      "1 tsp vanilla",
      "Pinch of salt"
    ],
    steps: [
      "Whisk eggs, milk, maple, vanilla, cardamom, and salt.",
      "Layer pears and oats in a buttered baking dish.",
      "Pour custard over oats and rest for 10 minutes.",
      "Bake at 375F until golden and just set."
    ],
    notes: "Would be lovely with chopped pistachios on top.",
    journal: [
      {
        date: "2026-03-18",
        rating: 4,
        wouldMakeAgain: true,
        notes: "Great for weekday breakfasts but I want more texture next time.",
        modifications: ["Added toasted walnuts", "Reduced maple syrup slightly"],
        actualCookingTime: "45 min",
        difficulty: 2
      }
    ]
  }
];

export const plannedMeals: PlannedMeal[] = [
  {
    day: "Monday",
    meal: "Dinner",
    recipeId: "rec-001",
    note: "Serve with arugula salad."
  },
  {
    day: "Wednesday",
    meal: "Dinner",
    recipeId: "rec-002",
    note: "Double batch for leftovers."
  },
  {
    day: "Saturday",
    meal: "Brunch",
    recipeId: "rec-003",
    note: "Bake the night before."
  }
];

export const folders = [
  "Weeknight Dinner",
  "Meal Prep",
  "Breakfast Basket",
  "Dessert Drawer"
];

export const shoppingList = [
  {
    category: "Produce",
    items: ["Cherry tomatoes", "Pears", "Scallions", "Carrots"]
  },
  {
    category: "Dairy",
    items: ["Parmesan", "Unsalted butter", "Milk"]
  },
  {
    category: "Pantry",
    items: ["Rigatoni", "Rolled oats", "Gochujang", "Maple syrup"]
  }
];
