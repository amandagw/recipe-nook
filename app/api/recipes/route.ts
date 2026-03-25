import { NextResponse } from "next/server";
import { recipes } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    recipes
  });
}

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json(
    {
      message: "Recipe received. Persist to MongoDB Atlas in production.",
      recipe: payload
    },
    { status: 201 }
  );
}
