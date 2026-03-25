import Link from "next/link";
import { plannedMeals, recipes, shoppingList } from "@/lib/mock-data";

export default function PlanPage() {
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
          <div className="shopping-columns">
            {shoppingList.map((group) => (
              <div key={group.category}>
                <p className="small-label">{group.category}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link className="text-link" href="/shopping-list">
            Open shopping list builder
          </Link>
        </article>
      </section>
    </main>
  );
}
