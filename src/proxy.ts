import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/verifyToken";

// Runs on every request matching `config.matcher`
export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isNotesRoute = pathname.startsWith("/notes");
  const isAuthRoute = pathname === "/login";

  let isAuthenticated = false;

  if (token) {
    try {
      await verifyToken(token);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (isNotesRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("token");
    return res;
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/notes", req.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Apply proxy only to these routes
export const config = {
  matcher: ["/notes/:path*", "/login", "/register"],
};
