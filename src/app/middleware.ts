import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/auth-utils";

// List of paths that don't require authentication
const publicPaths = [
  "/login",
  "/register",
  "/",
  "/api/auth/login",
  "/api/auth/register",
];

// Function to check if the path is public
function isPublicPath(path: string) {
  return publicPaths.some((publicPath) => {
    if (publicPath === "/") {
      return path === "/";
    }
    return path.startsWith(publicPath);
  });
}

// Function to check if the path is an API route
function isApiRoute(path: string) {
  return path.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths without authentication
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get("token")?.value;

  // If no token and trying to access protected route
  if (!token) {
    // For API routes, return unauthorized response
    if (isApiRoute(path)) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // For non-API routes, redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the token
    await verifyToken(token);

    // If token is valid, proceed
    return NextResponse.next();
  } catch (error) {
    // If token is invalid
    // For API routes, return unauthorized response
    if (isApiRoute(path)) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    // For non-API routes, redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
