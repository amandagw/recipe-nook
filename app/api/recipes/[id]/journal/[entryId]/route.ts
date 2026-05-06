import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateRecipeNoteById } from "@/lib/repositories/recipes";
import { Difficulty } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    id: string;
    entryId: string;
  }>;
};

function parseRating(value: unknown) {
  const rating = Number(value);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return Math.floor(rating);
}

function parseDifficulty(value: unknown): Difficulty | null {
  const difficulty = Number(value);

  if (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 5) {
    return null;
  }

  return Math.floor(difficulty) as Difficulty;
}

function parseModifications(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Please log in to edit a cooking journal entry." },
      { status: 401 }
    );
  }

  const { id, entryId } = await context.params;

  if (!ObjectId.isValid(id) || !ObjectId.isValid(entryId)) {
    return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
  }

  const payload = await request.json();
  const rating = parseRating(payload.rating);
  const difficulty = parseDifficulty(payload.difficulty);
  const actualCookingTime = String(payload.actualCookingTime ?? "").trim();
  const notes = String(payload.notes ?? "").trim();
  const modifications = parseModifications(payload.modifications);

  if (!rating) {
    return NextResponse.json(
      { error: "Please choose a recipe rating from 1 to 5." },
      { status: 400 }
    );
  }

  if (!difficulty) {
    return NextResponse.json(
      { error: "Please choose a difficulty rating from 1 to 5." },
      { status: 400 }
    );
  }

  const journalEntry = await updateRecipeNoteById(session.userId, id, entryId, {
    rating,
    wouldMakeAgain: Boolean(payload.wouldMakeAgain),
    notes,
    modifications,
    actualCookingTime,
    difficulty
  });

  if (!journalEntry) {
    return NextResponse.json({ error: "Journal entry not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Cooking journal entry updated."
  });
}
