"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useId, useMemo, useState } from "react";

type ManualRecipeFormProps = {
  initialValues?: {
    id?: string;
    title?: string;
    folder?: string;
    servings?: number;
    tags?: string[];
    ingredients?: string[];
    steps?: string[];
    notes?: string;
    image?: string;
  };
  folderOptions?: string[];
  tagOptions?: string[];
  mode?: "create" | "edit";
};

type ManualRecipeFormState = {
  title: string;
  folder: string;
  servings: string;
  tags: string[];
  ingredients: string;
  steps: string;
  notes: string;
  image: string;
};

const emptyFormState: ManualRecipeFormState = {
  title: "",
  folder: "",
  servings: "",
  tags: [],
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
    servings:
      typeof initialValues.servings === "number" && initialValues.servings > 0
        ? String(initialValues.servings)
        : "",
    tags: initialValues.tags ?? [],
    ingredients: initialValues.ingredients?.join("\n") ?? "",
    steps: initialValues.steps?.join("\n") ?? "",
    notes: initialValues.notes ?? "",
    image: initialValues.image ?? ""
  };
}

function uniqueOptions(options: Array<string | undefined>) {
  return Array.from(
    new Set(
      options
        .map((option) => option?.trim())
        .filter((option): option is string => Boolean(option))
    )
  ).sort((first, second) => first.localeCompare(second));
}

export function ManualRecipeForm({
  initialValues,
  folderOptions = [],
  tagOptions = [],
  mode = "create"
}: ManualRecipeFormProps) {
  const folderListId = useId();
  const tagListId = useId();
  const initialFormState = buildInitialFormState(initialValues);
  const [form, setForm] = useState(initialFormState);
  const [tagDraft, setTagDraft] = useState("");
  const [previewUrl, setPreviewUrl] = useState(initialValues?.image ?? "");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const folderSuggestions = useMemo(
    () => uniqueOptions([initialValues?.folder, ...folderOptions]),
    [folderOptions, initialValues?.folder]
  );
  const tagSuggestions = useMemo(
    () => uniqueOptions([...(initialValues?.tags ?? []), ...tagOptions]),
    [initialValues?.tags, tagOptions]
  );
  const availableTagSuggestions = tagSuggestions.filter((tag) => !form.tags.includes(tag));

  function updateField<Key extends keyof ManualRecipeFormState>(
    key: Key,
    value: ManualRecipeFormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function addTags(value: string) {
    const nextTags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (nextTags.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      tags: uniqueOptions([...current.tags, ...nextTags])
    }));
    setTagDraft("");
  }

  function removeTag(tag: string) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((currentTag) => currentTag !== tag)
    }));
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTags(tagDraft);
      return;
    }

    if (event.key === "Backspace" && !tagDraft && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1]);
    }
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
      const payload = {
        ...form,
        tags: uniqueOptions([...form.tags, ...tagDraft.split(",")])
      };
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
        body: JSON.stringify(payload)
      });

      const responsePayload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(responsePayload.error ?? "Unable to save your recipe right now.");
        return;
      }

      setSuccess(
        responsePayload.message ??
          (mode === "edit" ? "Recipe updated successfully." : "Recipe saved.")
      );

      if (mode === "create") {
        setForm(emptyFormState);
        setTagDraft("");
        setPreviewUrl("");
      } else {
        setForm(payload);
        setTagDraft("");
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
          <span className="field-label-row">
            Servings <span className="optional-label">Optional</span>
          </span>
          <input
            min="0"
            step="1"
            type="number"
            value={form.servings}
            onChange={(event) => updateField("servings", event.target.value)}
            placeholder="8"
          />
        </label>

        <label className="input-label">
          <span className="field-label-row">
            Folder <span className="optional-label">Optional</span>
          </span>
          <input
            list={folderListId}
            value={form.folder}
            onChange={(event) => updateField("folder", event.target.value)}
            placeholder="Family Favorites"
          />
          <datalist id={folderListId}>
            {folderSuggestions.map((folder) => (
              <option key={folder} value={folder} />
            ))}
          </datalist>
        </label>
        {folderSuggestions.length > 0 ? (
          <div className="choice-chip-group">
            <p className="small-label chip-group-label">Saved folders</p>
            <div className="choice-chip-row" aria-label="Saved folder names">
              {folderSuggestions.map((folder) => (
                <button
                  key={folder}
                  className={`choice-chip ${form.folder === folder ? "choice-chip-active" : ""}`}
                  onClick={() => updateField("folder", folder)}
                  type="button"
                >
                  {folder}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="input-label">
          <span className="field-label-row">
            Tags <span className="optional-label">Optional</span>
          </span>
          {form.tags.length > 0 ? (
            <div className="choice-chip-row selected-chip-row" aria-label="Selected tags">
              {form.tags.map((tag) => (
                <button
                  key={tag}
                  className="choice-chip choice-chip-active"
                  onClick={() => removeTag(tag)}
                  type="button"
                >
                  {tag}
                  <span aria-hidden="true">x</span>
                </button>
              ))}
            </div>
          ) : null}
          <div className="tag-entry-row">
            <input
              list={tagListId}
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="cozy, spicy, dinner"
            />
            <button className="secondary-button tag-add-button" onClick={() => addTags(tagDraft)} type="button">
              Add
            </button>
          </div>
          <datalist id={tagListId}>
            {availableTagSuggestions.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
        {availableTagSuggestions.length > 0 ? (
          <div className="choice-chip-group">
            <p className="small-label chip-group-label">Favorite tags</p>
            <div className="choice-chip-row" aria-label="Saved tag names">
              {availableTagSuggestions.map((tag) => (
                <button
                  key={tag}
                  className="choice-chip"
                  onClick={() => addTags(tag)}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}

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
          <span className="field-label-row">
            Notes <span className="optional-label">Optional</span>
          </span>
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
