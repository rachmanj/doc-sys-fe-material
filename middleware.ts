import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  // If accessing root path, allow access to landing page
  if (request.nextUrl.pathname === "/") {
    // If user is authenticated, redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // If not authenticated, allow access to landing page
    return NextResponse.next();
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
