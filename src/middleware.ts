import createMiddleware from "next-intl/middleware";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { csrfProtection } from "./app/utils/csrf";
import { routing } from "./i18n/routing";

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
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  return publicPaths.some((publicPath) => {
    if (publicPath === "/") {
      return pathWithoutLocale === "/";
    }
    return pathWithoutLocale.startsWith(publicPath);
  });
}

// Currency middleware function
async function handleCurrencyMiddleware() {
  const response = NextResponse.next();

  const cookieStore = await cookies();
  let currencyCode = cookieStore.get("preferred_currency")?.value;

  if (!currencyCode) {
    currencyCode = "USD";
  }

  cookieStore.set("preferred_currency", currencyCode);

  return response;
}

export async function getPreferenceCurrency(): Promise<string> {
  const cookieStore = await cookies();
  const currencyCode = cookieStore.get("preferred_currency")?.value;
  if (currencyCode) return currencyCode;

  return "USD";
}

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const path = request.nextUrl.pathname;

  if (path === "/products" || path.match(/^\/[a-z]{2}\/products$/)) {
    const locale = path.match(/^\/([a-z]{2})\//)?.[1] || "";
    const redirectPath = locale ? `/${locale}` : "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

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

  if (isPublicPath(path)) {
    return response;
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
