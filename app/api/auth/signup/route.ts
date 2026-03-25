import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/repositories/users";
import { isValidEmail, validatePassword } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter a name with at least 2 characters." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      name,
      email,
      passwordHash
    });

    await setSessionCookie({
      userId: user._id!.toString(),
      email: user.email,
      name: user.name
    });

    return NextResponse.json({
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create your account right now." },
      { status: 500 }
    );
  }
}
