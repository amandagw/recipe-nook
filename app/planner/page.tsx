import Link from "next/link";
import { plannedMeals, recipes } from "@/lib/mock-data";

export default function PlannerPage() {
  return (
    <main className="detail-shell">
      <Link className="text-link" href="/">
        Back to Recipe Nook
      </Link>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Meal Planning</p>
          <h1>Week at a glance</h1>
          <p className="hero-text">
            Assign saved recipes to your week so the shopping list and dinner decisions
            come together in one calm flow.
          </p>
        </div>
      </section>

      <section className="detail-grid">
        {plannedMeals.map((plan) => {
          const recipe = recipes.find((entry) => entry.id === plan.recipeId);

          return (
            <article key={`${plan.day}-${plan.meal}`} className="panel">
              <p className="small-label">
                {plan.day} • {plan.meal}
              </p>
              <h2>{recipe?.title}</h2>
              <p>{plan.note}</p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
