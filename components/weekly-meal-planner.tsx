"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { PLANNER_DAYS, PLANNER_MEALS, PlannerDay, PlannerMeal } from "@/lib/meal-planner";

type PlannerRecipe = {
  id: string;
  title: string;
  slug: string;
};

type PlannerEntry = {
  day: PlannerDay;
  meal: PlannerMeal;
  recipeId: string;
};

type WeeklyMealPlannerProps = {
  recipes: PlannerRecipe[];
  entries: PlannerEntry[];
  weekStart: string;
};

function slotKey(day: PlannerDay, meal: PlannerMeal) {
  return `${day}:${meal}`;
}

function buildAssignments(entries: PlannerEntry[]) {
  return entries.reduce<Record<string, string[]>>((assignments, entry) => {
    const key = slotKey(entry.day, entry.meal);
    assignments[key] = Array.from(new Set([...(assignments[key] ?? []), entry.recipeId]));
    return assignments;
  }, {});
}

export function WeeklyMealPlanner({ recipes, entries, weekStart }: WeeklyMealPlannerProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState(() => buildAssignments(entries));
  const [editingSlot, setEditingSlot] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const recipesById = useMemo(
    () => new Map(recipes.map((recipe) => [recipe.id, recipe])),
    [recipes]
  );

  useEffect(() => {
    setAssignments(buildAssignments(entries));
    setEditingSlot("");
    setError("");
    setSuccess("");
  }, [entries, weekStart]);

  function serializeAssignments(nextAssignments: Record<string, string[]>) {
    return PLANNER_DAYS.flatMap((day) =>
      PLANNER_MEALS.flatMap((meal) => {
        const recipeIds = nextAssignments[slotKey(day, meal)] ?? [];

        return recipeIds.map((recipeId) => ({
          day,
          meal,
          recipeId
        }));
      })
    );
  }

  async function persist(nextAssignments: Record<string, string[]>) {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/meal-planner", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          weekStart,
          entries: serializeAssignments(nextAssignments)
        })
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to update your meal planner right now.");
        return;
      }

      setSuccess(payload.message ?? "Meal planner updated.");
    } catch {
      setError("Unable to update your meal planner right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleSlotRecipe(day: PlannerDay, meal: PlannerMeal, recipeId: string) {
    const key = slotKey(day, meal);
    const currentRecipeIds = assignments[key] ?? [];
    const nextRecipeIds = currentRecipeIds.includes(recipeId)
      ? currentRecipeIds.filter((currentRecipeId) => currentRecipeId !== recipeId)
      : [...currentRecipeIds, recipeId];
    const nextAssignments = {
      ...assignments
    };

    if (nextRecipeIds.length > 0) {
      nextAssignments[key] = nextRecipeIds;
    } else {
      delete nextAssignments[key];
    }

    setAssignments(nextAssignments);
    void persist(nextAssignments);
  }

  function clearSlot(day: PlannerDay, meal: PlannerMeal) {
    const key = slotKey(day, meal);
    const nextAssignments = {
      ...assignments
    };

    delete nextAssignments[key];
    setAssignments(nextAssignments);
    setEditingSlot("");
    void persist(nextAssignments);
  }

  function handleWeekChange(event: ChangeEvent<HTMLInputElement>) {
    const nextWeek = event.target.value;

    if (nextWeek) {
      router.push(`/planner?week=${nextWeek}`);
    }
  }

  return (
    <section className="weekly-planner-section">
      <div className="weekly-planner-heading">
        <div>
          <p className="eyebrow">Weekly Meal Planner</p>
          <h2>Week at a glance</h2>
        </div>
        <label className="week-picker">
          Week of
          <input onChange={handleWeekChange} type="date" value={weekStart} />
        </label>
      </div>

      <div className="planner-save-status">
        {isSaving ? <span>Saving...</span> : null}
        {error ? <span className="form-error">{error}</span> : null}
        {success && !error && !isSaving ? <span className="form-success">{success}</span> : null}
      </div>

      <div className="weekly-planner-table-wrap">
        <table className="weekly-planner-grid" aria-label="Weekly meal planner">
          <thead>
            <tr>
              <th className="weekly-planner-header" scope="col">
                Day
              </th>
              {PLANNER_MEALS.map((meal) => (
                <th className="weekly-planner-header" key={meal} scope="col">
                  {meal}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANNER_DAYS.map((day) => (
              <tr className="weekly-planner-row" key={day}>
                <th className="weekly-planner-day" scope="row">
                  {day}
                </th>
                {PLANNER_MEALS.map((meal) => {
                  const key = slotKey(day, meal);
                  const recipeIds = assignments[key] ?? [];
                  const selectedRecipes = recipeIds
                    .map((recipeId) => recipesById.get(recipeId))
                    .filter((recipe): recipe is PlannerRecipe => Boolean(recipe));

                  return (
                    <td className="weekly-planner-cell" key={key}>
                      {recipes.length > 0 ? (
                        <div className="planner-cell-content">
                          {selectedRecipes.length > 0 ? (
                            <div className="planner-recipe-list">
                              {selectedRecipes.map((recipe) => (
                                <Link
                                  className="planner-recipe-link"
                                  href={`/recipes/${recipe.slug}`}
                                  key={recipe.id}
                                >
                                  {recipe.title}
                                </Link>
                              ))}
                            </div>
                          ) : null}

                          <details
                            className="planner-multi-select"
                            onToggle={(event) => {
                              setEditingSlot(event.currentTarget.open ? key : "");
                            }}
                            open={editingSlot === key}
                          >
                            <summary>
                              {selectedRecipes.length > 0 ? "Edit recipes" : "Add recipes"}
                            </summary>
                            <div className="planner-multi-menu">
                              {recipes.map((option) => (
                                <label className="planner-multi-option" key={option.id}>
                                  <input
                                    checked={recipeIds.includes(option.id)}
                                    onChange={() => toggleSlotRecipe(day, meal, option.id)}
                                    type="checkbox"
                                  />
                                  <span>{option.title}</span>
                                </label>
                              ))}
                              {selectedRecipes.length > 0 ? (
                                <button
                                  className="planner-cell-action"
                                  onClick={() => clearSlot(day, meal)}
                                  type="button"
                                >
                                  Clear meal
                                </button>
                              ) : null}
                              <button
                                className="secondary-button planner-done-button"
                                onClick={() => setEditingSlot("")}
                                type="button"
                              >
                                Done
                              </button>
                            </div>
                          </details>
                        </div>
                      ) : (
                        <span className="planner-empty-text">No recipes yet</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
