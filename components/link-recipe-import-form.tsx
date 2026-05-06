"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useId, useMemo, useState } from "react";

type LinkRecipeImportFormProps = {
  folderOptions?: string[];
  tagOptions?: string[];
};

type ImportResponse = {
  error?: string;
  message?: string;
  importDetails?: {
    sourceHost: string;
    usedFallback: boolean;
  };
  recipe?: {
    title: string;
    slug: string;
  };
};

function uniqueOptions(options: Array<string | undefined>) {
  return Array.from(
    new Set(
      options
        .map((option) => option?.trim())
        .filter((option): option is string => Boolean(option))
    )
  ).sort((first, second) => first.localeCompare(second));
}

export function LinkRecipeImportForm({
  folderOptions = [],
  tagOptions = []
}: LinkRecipeImportFormProps) {
  const folderListId = useId();
  const tagListId = useId();
  const [url, setUrl] = useState("");
  const [folder, setFolder] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResponse | null>(null);
  const folderSuggestions = useMemo(
    () => uniqueOptions(["Imported Recipes", ...folderOptions]),
    [folderOptions]
  );
  const tagSuggestions = useMemo(() => uniqueOptions(tagOptions), [tagOptions]);
  const availableTagSuggestions = tagSuggestions.filter((tag) => !tags.includes(tag));

  function addTags(value: string) {
    const nextTags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (nextTags.length === 0) {
      return;
    }

    setTags((current) => uniqueOptions([...current, ...nextTags]));
    setTagDraft("");
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((currentTag) => currentTag !== tag));
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTags(tagDraft);
      return;
    }

    if (event.key === "Backspace" && !tagDraft && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/recipes/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          folder,
          tags: uniqueOptions([...tags, ...tagDraft.split(",")])
        })
      });
      const payload = (await response.json()) as ImportResponse;

      if (!response.ok) {
        setError(payload.error ?? "Unable to import that recipe right now.");
        return;
      }

      setResult(payload);
      setUrl("");
      setTagDraft("");
    } catch {
      setError("Unable to import that recipe right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <article className="panel panel-warm">
      <div className="section-heading">
        <p className="eyebrow">Add via URL</p>
        <h2>Import from a link</h2>
      </div>

      <form className="import-fields" onSubmit={handleSubmit}>
        <label className="input-label">
          Recipe link
          <input
            inputMode="url"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/spicy-sesame-noodles"
            required
            type="url"
            value={url}
          />
        </label>

        <label className="input-label">
          <span className="field-label-row">
            Folder <span className="optional-label">Optional</span>
          </span>
          <input
            list={folderListId}
            onChange={(event) => setFolder(event.target.value)}
            placeholder="Imported Recipes"
            value={folder}
          />
          <datalist id={folderListId}>
            {folderSuggestions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>

        {folderSuggestions.length > 0 ? (
          <div className="choice-chip-group">
            <p className="small-label chip-group-label">Saved folders</p>
            <div className="choice-chip-row" aria-label="Saved folder names">
              {folderSuggestions.map((option) => (
                <button
                  className={`choice-chip ${folder === option ? "choice-chip-active" : ""}`}
                  key={option}
                  onClick={() => setFolder(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="input-label">
          <span className="field-label-row">
            Tags <span className="optional-label">Optional</span>
          </span>
          {tags.length > 0 ? (
            <div className="choice-chip-row selected-chip-row" aria-label="Selected tags">
              {tags.map((tag) => (
                <button
                  className="choice-chip choice-chip-active"
                  key={tag}
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
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="quick, dinner, cozy"
              value={tagDraft}
            />
            <button
              className="secondary-button tag-add-button"
              onClick={() => addTags(tagDraft)}
              type="button"
            >
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
                  className="choice-chip"
                  key={tag}
                  onClick={() => addTags(tag)}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button muted" disabled={isPending} type="submit">
          {isPending ? "Importing recipe..." : "Import recipe"}
        </button>
      </form>

      {result?.recipe ? (
        <div className="capture-preview import-result">
          <p className="small-label">
            {result.importDetails?.usedFallback ? "Generated link card" : "Generated recipe card"}
          </p>
          <strong>{result.recipe.title}</strong>
          <span>{result.message}</span>
          <div className="capture-preview-actions">
            <Link className="primary-button muted" href={`/recipes/${result.recipe.slug}`}>
              Open recipe
            </Link>
            <Link className="secondary-button" href={`/recipes/${result.recipe.slug}/edit`}>
              Edit generated card
            </Link>
          </div>
        </div>
      ) : null}
    </article>
  );
}
