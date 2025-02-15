import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  // If accessing root path, redirect to dashboard or login
  if (request.nextUrl.pathname === "/") {
    return token
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access auth pages while logged in, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If trying to access protected pages while logged out, redirect to login
  if (!isAuthPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Add your protected routes here
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/documents/:path*",
    "/tasks/:path*",
    "/settings/:path*",
    "/master-data/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
