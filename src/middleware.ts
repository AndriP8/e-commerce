import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { csrfProtection } from "./app/utils/csrf";

// List of paths that don't require authentication
const publicPaths = [
  "/login",
  "/register",
  "/",
  "/products",
  "/api/currencies",
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

// Currency middleware function
async function handleCurrencyMiddleware() {
  const response = NextResponse.next();

  const cookieStore = await cookies();
  let currencyCode = cookieStore.get("preferred_currency")?.value;

  // Default to USD if no currency preference found
  if (!currencyCode) {
    currencyCode = "USD";
  }

  // Set the currency code in cookies
  cookieStore.set("preferred_currency", currencyCode);

  return response;
}

// Modified to be Edge-compatible
export async function getPreferenceCurrency(): Promise<string> {
  // If request is provided, get from request cookies
  const cookieStore = await cookies();
  const currencyCode = cookieStore.get("preferred_currency")?.value;
  if (currencyCode) return currencyCode;

  // Default to USD
  return "USD";
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Cross-Site Request Forgery (CSRF) Protection
  const csrfError = csrfProtection(request);
  if (csrfError) {
    return csrfError;
  }

  // API routes for currency conversion
  if (
    path.startsWith("/api/products") ||
    path.startsWith("/api/cart") ||
    path.startsWith("/api/orders") ||
    path.startsWith("/api/checkout")
  ) {
    return handleCurrencyMiddleware();
  }

  // Allow public paths without authentication
  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  return NextResponse.next();
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
