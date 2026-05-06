"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { JournalEntry } from "@/lib/types";

type CookingJournalSectionProps = {
  recipeId: string;
  entries: JournalEntry[];
};

type JournalFormState = {
  rating: number;
  wouldMakeAgain: boolean;
  actualCookingTime: string;
  difficulty: number;
  notes: string;
  modifications: string;
};

type JournalFieldsProps = {
  form: JournalFormState;
  onChange: <Key extends keyof JournalFormState>(
    key: Key,
    value: JournalFormState[Key]
  ) => void;
};

const emptyJournalForm: JournalFormState = {
  rating: 5,
  wouldMakeAgain: true,
  actualCookingTime: "",
  difficulty: 3,
  notes: "",
  modifications: ""
};

function stars(rating: number) {
  return `${"\u2605".repeat(rating)}${"\u2606".repeat(5 - rating)}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function entryToForm(entry: JournalEntry): JournalFormState {
  return {
    rating: entry.rating,
    wouldMakeAgain: entry.wouldMakeAgain,
    actualCookingTime: entry.actualCookingTime,
    difficulty: entry.difficulty,
    notes: entry.notes,
    modifications: entry.modifications.join("\n")
  };
}

function JournalFields({ form, onChange }: JournalFieldsProps) {
  return (
    <>
      <div className="journal-range-grid">
        <label className="input-label">
          <span className="range-label-row">
            Recipe rating <strong>{form.rating}/5</strong>
          </span>
          <input
            className="journal-range"
            max="5"
            min="1"
            onChange={(event) => onChange("rating", Number(event.target.value))}
            type="range"
            value={form.rating}
          />
        </label>

        <label className="input-label">
          <span className="range-label-row">
            Difficulty <strong>{form.difficulty}/5</strong>
          </span>
          <input
            className="journal-range"
            max="5"
            min="1"
            onChange={(event) => onChange("difficulty", Number(event.target.value))}
            type="range"
            value={form.difficulty}
          />
          <span className="help-text">5 is the most difficult.</span>
        </label>
      </div>

      <label className="toggle-label">
        <input
          checked={form.wouldMakeAgain}
          onChange={(event) => onChange("wouldMakeAgain", event.target.checked)}
          type="checkbox"
        />
        Would make again
      </label>

      <label className="input-label">
        Time spent
        <input
          onChange={(event) => onChange("actualCookingTime", event.target.value)}
          placeholder="45 minutes"
          value={form.actualCookingTime}
        />
      </label>

      <label className="input-label">
        Notes
        <textarea
          onChange={(event) => onChange("notes", event.target.value)}
          placeholder="How did it go? What would you remember for next time?"
          value={form.notes}
        />
      </label>

      <label className="input-label">
        Modifications or adjustments
        <textarea
          onChange={(event) => onChange("modifications", event.target.value)}
          placeholder={"Used less sugar\nAdded lemon zest\nBake 5 minutes longer next time"}
          value={form.modifications}
        />
      </label>
    </>
  );
}

function EditableJournalEntry({ entry, recipeId }: { entry: JournalEntry; recipeId: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => entryToForm(entry));
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  function updateField<Key extends keyof JournalFormState>(
    key: Key,
    value: JournalFormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function cancelEdit() {
    setForm(entryToForm(entry));
    setError("");
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!entry.id) {
      setError("Unable to edit this journal entry right now.");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      const response = await fetch(`/api/recipes/${recipeId}/journal/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to update this journal entry right now.");
        return;
      }

      setIsEditing(false);
      router.refresh();
    } catch {
      setError("Unable to update this journal entry right now.");
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
      <form className="journal-entry-card journal-entry-form" onSubmit={handleSave}>
        <JournalFields form={form} onChange={updateField} />
        {error ? <p className="form-error">{error}</p> : null}
        <div className="journal-edit-actions">
          <button className="primary-button muted" disabled={isPending} type="submit">
            {isPending ? "Saving changes..." : "Save changes"}
          </button>
          <button
            className="secondary-button"
            disabled={isPending}
            onClick={cancelEdit}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="journal-entry-card">
      <div className="journal-entry-header">
        <div>
          <p className="small-label">{formatDate(entry.date)}</p>
          <strong>{stars(entry.rating)}</strong>
        </div>
        <div className="journal-entry-actions">
          <span className="status-pill">
            {entry.wouldMakeAgain ? "Would make again" : "Skip repeat"}
          </span>
          {entry.id ? (
            <button className="secondary-button journal-edit-button" onClick={() => setIsEditing(true)} type="button">
              Edit
            </button>
          ) : null}
        </div>
      </div>

      <div className="journal-stats">
        <span>{entry.actualCookingTime || "Time not logged"}</span>
        <span>Difficulty {entry.difficulty}/5</span>
      </div>

      {entry.notes ? (
        <div className="journal-written-block">
          <p className="small-label">Notes</p>
          <p>{entry.notes}</p>
        </div>
      ) : null}

      {entry.modifications.length > 0 ? (
        <div className="journal-written-block">
          <p className="small-label">Modifications & adjustments</p>
          <p>{entry.modifications.join("\n")}</p>
        </div>
      ) : null}
    </div>
  );
}

export function CookingJournalSection({ recipeId, entries }: CookingJournalSectionProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyJournalForm);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<Key extends keyof JournalFormState>(
    key: Key,
    value: JournalFormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const response = await fetch(`/api/recipes/${recipeId}/journal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to save this journal entry right now.");
        return;
      }

      setSuccess(payload.message ?? "Cooking journal entry saved.");
      setForm(emptyJournalForm);
      router.refresh();
    } catch {
      setError("Unable to save this journal entry right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="journal-section" id="cooking-journal">
      <article className="panel panel-warm journal-form-panel">
        <div className="section-heading">
          <p className="eyebrow">Cooking Journal</p>
          <h2>Add a cooking note</h2>
        </div>

        <form className="journal-entry-form" onSubmit={handleSubmit}>
          <JournalFields form={form} onChange={updateField} />

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button className="primary-button muted" disabled={isPending} type="submit">
            {isPending ? "Saving entry..." : "Save journal entry"}
          </button>
        </form>
      </article>

      <article className="panel journal-history-panel">
        <div className="section-heading">
          <p className="eyebrow">Past Cooks</p>
          <h2>{entries.length > 0 ? "Journal entries" : "No entries yet"}</h2>
        </div>

        {entries.length > 0 ? (
          <div className="journal-entry-list">
            {entries.map((entry) => (
              <EditableJournalEntry entry={entry} key={entry.id ?? entry.date} recipeId={recipeId} />
            ))}
          </div>
        ) : (
          <p className="journal-empty">
            Add the first entry after cooking to track what worked, what changed, and
            whether this recipe deserves a repeat.
          </p>
        )}
      </article>
    </section>
  );
}
