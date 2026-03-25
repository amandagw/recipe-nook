import { NextResponse } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/lib/repositories/users";
import { isValidEmail } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Please enter your password." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

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
  } catch {
    return NextResponse.json(
      { error: "Unable to log you in right now." },
      { status: 500 }
    );
  }
}
