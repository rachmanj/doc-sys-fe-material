import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password } = body;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
