import { NextRequest, NextResponse } from "next/server";

// Nama cookie JWT admin (harus sama dengan ADMIN_TOKEN_COOKIE di lib/jwt.ts)
const ADMIN_TOKEN_COOKIE = "admin_token";

// Route yang membutuhkan autentikasi admin
const PROTECTED_PATHS = ["/dashboard", "/dsh"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected) {
    const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;

    if (!token) {
      // Belum login, redirect ke halaman login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dsh/:path*"],
};
