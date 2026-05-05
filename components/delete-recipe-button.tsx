"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteRecipeButtonProps = {
  recipeId: string;
  recipeTitle: string;
};

export function DeleteRecipeButton({ recipeId, recipeTitle }: DeleteRecipeButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${recipeTitle}"? This will permanently remove it from your Recipe Nook.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsPending(true);

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to delete this recipe right now.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to delete this recipe right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="delete-recipe-control">
      <button
        className="danger-button"
        disabled={isPending}
        onClick={handleDelete}
        type="button"
      >
        {isPending ? "Deleting..." : "Delete recipe"}
      </button>
      {error ? <p className="form-error delete-recipe-error">{error}</p> : null}
    </div>
  );
}
