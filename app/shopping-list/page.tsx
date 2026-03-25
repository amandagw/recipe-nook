import Link from "next/link";
import { shoppingList } from "@/lib/mock-data";

export default function ShoppingListPage() {
  return (
    <main className="detail-shell">
      <Link className="text-link" href="/">
        Back to Recipe Nook
      </Link>
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Shopping List</p>
          <h1>Ingredients, grouped and ready</h1>
          <p className="hero-text">
            Generated from planned recipes so you can edit once and shop without
            duplicate ingredients.
          </p>
        </div>
      </section>

      <section className="detail-grid">
        {shoppingList.map((group) => (
          <article key={group.category} className="panel panel-warm">
            <p className="small-label">{group.category}</p>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
