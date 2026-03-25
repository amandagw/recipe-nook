import Link from "next/link";

export default function AddRecipePage() {
  return (
    <main className="detail-shell">
      <Link className="text-link" href="/">
        Back to Recipe Nook
      </Link>

      <section className="detail-hero">
        <div>
          <p className="eyebrow">Recipe Capture</p>
          <h1>Save a new recipe</h1>
          <p className="hero-text">
            Bring in a recipe from a link or build one by hand, then file it into your
            nook with notes, tags, and source details.
          </p>
        </div>
      </section>

      <section className="capture-grid">
        <article className="panel panel-warm">
          <div className="section-heading">
            <p className="eyebrow">Add via URL</p>
            <h2>Import from a link</h2>
          </div>
          <label className="input-label">
            Recipe link
            <input value="https://example.com/spicy-sesame-noodles" readOnly />
          </label>
          <div className="capture-preview">
            <p className="small-label">Extracted preview</p>
            <strong>Spicy Sesame Noodles</strong>
            <span>Ingredients, steps, and title are auto-detected when available.</span>
          </div>
          <div className="tag-row">
            <span>quick</span>
            <span>noodles</span>
            <span>dinner</span>
          </div>
          <button className="primary-button muted">Import recipe</button>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Manual Entry</p>
            <h2>Build a recipe card by hand</h2>
          </div>
          <div className="manual-fields">
            <label className="input-label">
              Title
              <input value="Grandma's Sunday Chili" readOnly />
            </label>
            <label className="input-label">
              Folder
              <input value="Family Favorites" readOnly />
            </label>
            <label className="input-label">
              Notes
              <textarea
                value="Add smoked paprika and a splash of coffee to deepen the flavor."
                readOnly
              />
            </label>
          </div>
          <button className="secondary-button">Save draft</button>
        </article>
      </section>
    </main>
  );
}
