import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/jwt";

// POST - Logout admin (hapus cookie JWT)
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logout berhasil" },
    { status: 200 }
  );

  // Hapus cookie admin_token
  response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
