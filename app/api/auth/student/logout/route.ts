import { NextResponse } from "next/server";
import { STUDENT_TOKEN_COOKIE } from "@/lib/jwt";

// POST - Logout student (hapus cookie JWT)
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logout berhasil" },
    { status: 200 }
  );

  // Hapus cookie student_token
  response.cookies.set(STUDENT_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}