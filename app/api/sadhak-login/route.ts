import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password;

  if (!process.env.SADHAK_PASSWORD) {
    return NextResponse.json(
      { error: "Sadhak password is not configured." },
      { status: 500 }
    );
  }

  if (password !== process.env.SADHAK_PASSWORD) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const cookieStore = await cookies();

  cookieStore.set("sadhak_access", "true", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ success: true });
}