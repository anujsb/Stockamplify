import { upsertUserForAuth } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    try {
      // Add user to database
      const newUser = await upsertUserForAuth({
        email,
        password,
        username,
        provider: "credentials",
      });

      // Send verification email via Nodemailer
      await sendVerificationEmail(email);

      return NextResponse.json(
        {
          message: "User created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error && error.message === "User already exists") {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
