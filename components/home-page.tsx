"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { recipes } from "@/lib/mock-data";
import { Difficulty, Recipe, RecipeStatus } from "@/lib/types";

const filters: Array<RecipeStatus | "All"> = ["All", "To Try", "Tried"];
const difficultyFilters: Array<Difficulty | "Any"> = [
  "Any",
  "Easy",
  "Medium",
  "Project"
];

function stars(rating: number) {
  return `${"\u2605".repeat(rating)}${"\u2606".repeat(5 - rating)}`;
}

export function HomePage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RecipeStatus | "All">("All");
  const [folder, setFolder] = useState("All folders");
  const [difficulty, setDifficulty] = useState<Difficulty | "Any">("Any");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeId, setActiveId] = useState(recipes[0]?.id ?? "");

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const term = query.toLowerCase();
      const matchesQuery =
        recipe.title.toLowerCase().includes(term) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(term));
      const matchesStatus = status === "All" || recipe.status === status;
      const matchesFolder = folder === "All folders" || recipe.folder === folder;
      const latestJournal = recipe.journal[0];
      const matchesDifficulty =
        difficulty === "Any" ||
        (latestJournal ? latestJournal.difficulty === difficulty : false);

      return matchesQuery && matchesStatus && matchesFolder && matchesDifficulty;
    });
  }, [difficulty, folder, query, status]);

  const activeRecipe =
    filteredRecipes.find((recipe) => recipe.id === activeId) ?? filteredRecipes[0] ?? recipes[0];

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">The Recipe Nook</p>
          <h1>The Recipe Nook</h1>
          <p className="hero-text">
            A cozy place to search, save, and revisit the recipes you actually want to
            make again.
          </p>
          <div className="hero-actions">
            <a href="#library" className="primary-button">
              Browse recipes
            </a>
            <Link href="/add-recipe" className="secondary-button">
              Save a new recipe
            </Link>
            <Link href="/plan" className="secondary-button">
              Meal planning & shopping
            </Link>
          </div>
        </div>

        <div className="hero-card collage">
          <div className="pinboard-photo photo-main">
            <span className="pin" />
            <div
              className="photo-image"
              style={{ backgroundImage: `url(${recipes[0]?.image})` }}
            />
            <p>Weeknight favorite</p>
          </div>
          <div className="pinboard-photo photo-secondary">
            <span className="pin" />
            <div
              className="photo-image"
              style={{ backgroundImage: `url(${recipes[2]?.image})` }}
            />
            <p>Slow morning bake</p>
          </div>
          <div className="doodle doodle-heart" />
          <div className="doodle doodle-spark" />
          <div className="doodle doodle-swirl" />
        </div>
      </section>

      <section id="library" className="library-layout">
        <div className="library-header">
          <div className="section-heading">
            <p className="eyebrow">Recipe Library</p>
            <h2>Search, filter, and revisit favorites</h2>
          </div>
          <div className="view-switcher">
            <button
              className={view === "grid" ? "view-active" : ""}
              onClick={() => setView("grid")}
            >
              Grid
            </button>
            <button
              className={view === "list" ? "view-active" : ""}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
        </div>

        <div className="filters">
          <label className="input-label">
            Search
            <input
              placeholder="Search by title or tag"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="input-label">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as RecipeStatus | "All")}
            >
              {filters.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="input-label">
            Folder
            <select value={folder} onChange={(event) => setFolder(event.target.value)}>
              <option>All folders</option>
              {Array.from(new Set(recipes.map((recipe) => recipe.folder))).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="input-label">
            Difficulty
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty | "Any")}
            >
              {difficultyFilters.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="library-content">
          <div className={view === "grid" ? "recipe-grid" : "recipe-list"}>
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                className={`recipe-card ${activeRecipe?.id === recipe.id ? "recipe-card-active" : ""}`}
                onClick={() => setActiveId(recipe.id)}
              >
                <div
                  className="recipe-card-image"
                  style={{ backgroundImage: `url(${recipe.image})` }}
                />
                <div className="recipe-card-body">
                  <div className="recipe-card-meta">
                    <span>{recipe.folder}</span>
                    <span>{recipe.status}</span>
                  </div>
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                  <div className="tag-row">
                    {recipe.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {activeRecipe ? <RecipeInspector recipe={activeRecipe} /> : null}
        </div>
      </section>
    </main>
  );
}

function RecipeInspector({ recipe }: { recipe: Recipe }) {
  const latestJournal = recipe.journal[0];

  return (
    <aside className="recipe-inspector">
      <div className="inspector-image" style={{ backgroundImage: `url(${recipe.image})` }} />
      <div className="inspector-body">
        <div className="section-heading">
          <p className="eyebrow">Recipe Detail</p>
          <h2>{recipe.title}</h2>
        </div>

        <div className="inspector-meta">
          <span>{recipe.prepTime} prep</span>
          <span>{recipe.cookTime} cook</span>
          <span>{recipe.servings} servings</span>
          <span>{recipe.sourceType}</span>
        </div>

        <p className="inspector-description">{recipe.description}</p>

        <div className="inspector-columns">
          <div>
            <p className="small-label">Ingredients</p>
            <ul>
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="small-label">Steps</p>
            <ol>
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="journal-card">
          <div className="journal-header">
            <div>
              <p className="small-label">Cooking Journal</p>
              <strong>{latestJournal ? stars(latestJournal.rating) : "Not cooked yet"}</strong>
            </div>
            <span className={`status-pill status-${recipe.status.toLowerCase().replace(" ", "-")}`}>
              {recipe.status}
            </span>
          </div>

          {latestJournal ? (
            <>
              <p>{latestJournal.notes}</p>
              <div className="journal-stats">
                <span>{latestJournal.actualCookingTime}</span>
                <span>{latestJournal.difficulty}</span>
                <span>{latestJournal.wouldMakeAgain ? "Would make again" : "Skip repeat"}</span>
              </div>
              <div className="tag-row">
                {latestJournal.modifications.map((modification) => (
                  <span key={modification}>{modification}</span>
                ))}
              </div>
            </>
          ) : (
            <p>Add your first journal entry after cooking to track rating, time, and tweaks.</p>
          )}
        </div>

        <div className="inspector-actions">
          <Link href={`/recipes/${recipe.slug}`} className="primary-button muted">
            Open full recipe page
          </Link>
          <button className="secondary-button">Share recipe</button>
        </div>
      </div>
    </aside>
  );
}
