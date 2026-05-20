import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, STUDENT_TOKEN_COOKIE } from "./lib/jwt";


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
