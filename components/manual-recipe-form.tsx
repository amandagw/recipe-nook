"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type ManualRecipeFormProps = {
  initialValues?: {
    id?: string;
    title?: string;
    folder?: string;
    tags?: string[];
    ingredients?: string[];
    steps?: string[];
    notes?: string;
    image?: string;
  };
  mode?: "create" | "edit";
};

const emptyFormState = {
  title: "",
  folder: "",
  tags: "",
  ingredients: "",
  steps: "",
  notes: "",
  image: ""
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

function buildInitialFormState(initialValues?: ManualRecipeFormProps["initialValues"]) {
  if (!initialValues) {
    return emptyFormState;
  }

  return {
    title: initialValues.title ?? "",
    folder: initialValues.folder ?? "",
    tags: initialValues.tags?.join(", ") ?? "",
    ingredients: initialValues.ingredients?.join("\n") ?? "",
    steps: initialValues.steps?.join("\n") ?? "",
    notes: initialValues.notes ?? "",
    image: initialValues.image ?? ""
  };
}

export function ManualRecipeForm({
  initialValues,
  mode = "create"
}: ManualRecipeFormProps) {
  const initialFormState = buildInitialFormState(initialValues);
  const [form, setForm] = useState(initialFormState);
  const [previewUrl, setPreviewUrl] = useState(initialValues?.image ?? "");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<Key extends keyof typeof emptyFormState>(
    key: Key,
    value: (typeof emptyFormState)[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 1_500_000) {
      setError("Please choose an image under 1.5 MB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      updateField("image", dataUrl);
      setPreviewUrl(dataUrl);
    } catch {
      setError("Unable to load that image. Please try another file.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const endpoint =
        mode === "edit" && initialValues?.id
          ? `/api/recipes/${initialValues.id}`
          : "/api/recipes";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to save your recipe right now.");
        return;
      }

      setSuccess(
        payload.message ??
          (mode === "edit" ? "Recipe updated successfully." : "Recipe saved.")
      );

      if (mode === "create") {
        setForm(emptyFormState);
        setPreviewUrl("");
      }
    } catch {
      setError("Unable to save your recipe right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <article className="panel">
      <div className="section-heading">
        <p className="eyebrow">Manual Entry</p>
        <h2>{mode === "edit" ? "Update your recipe card" : "Build a recipe card by hand"}</h2>
      </div>

      <form className="manual-fields" onSubmit={handleSubmit}>
        <label className="input-label">
          Recipe title
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Grandma's Sunday Chili"
            required
          />
        </label>

        <label className="input-label">
          Folder
          <input
            value={form.folder}
            onChange={(event) => updateField("folder", event.target.value)}
            placeholder="Family Favorites"
            required
          />
        </label>

        <label className="input-label">
          Tags
          <input
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="cozy, spicy, dinner"
          />
        </label>

        <label className="input-label">
          Ingredients
          <textarea
            value={form.ingredients}
            onChange={(event) => updateField("ingredients", event.target.value)}
            placeholder={"1 lb ground beef\n2 cans beans\n1 onion"}
            required
          />
        </label>

        <label className="input-label">
          Method / instructions
          <textarea
            value={form.steps}
            onChange={(event) => updateField("steps", event.target.value)}
            placeholder={"Brown the beef.\nSaute the onion.\nSimmer for 30 minutes."}
            required
          />
        </label>

        <label className="input-label">
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Add smoked paprika and a splash of coffee to deepen the flavor."
          />
        </label>

        <label className="input-label">
          Image
          <input accept="image/*" onChange={handleImageChange} type="file" />
        </label>

        {previewUrl ? (
          <div className="manual-image-preview">
            <div
              className="manual-image-preview-frame"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
            <p className="small-label">Image preview</p>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}

        <button className="primary-button muted" disabled={isPending} type="submit">
          {isPending
            ? mode === "edit"
              ? "Updating recipe..."
              : "Saving recipe..."
            : mode === "edit"
              ? "Update recipe"
              : "Save recipe"}
        </button>
      </form>
    </article>
  );
}
