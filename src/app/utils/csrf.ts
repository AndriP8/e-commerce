import { type NextRequest, NextResponse } from "next/server";

export const CSRF_TOKEN_COOKIE = "csrf-secret";
export const CSRF_TOKEN_HEADER = "x-csrf-token";

export function generateCsrfToken(existingSecret?: string): {
  secret: string;
  token: string;
} {
  const secret = existingSecret || crypto.randomUUID();
  return { secret, token: secret };
}

export function verifyCsrfToken(request: NextRequest): boolean {
  const secret = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;
  const token = request.headers.get(CSRF_TOKEN_HEADER);

  if (!secret || !token) {
    return false;
  }

  return secret === token;
}

export function csrfProtection(request: NextRequest): NextResponse | null {
  const statefulMethods = ["POST", "PUT", "DELETE", "PATCH"];

  if (!statefulMethods.includes(request.method)) {
    return null;
  }

  // Skip CSRF check for specific routes
  if (request.nextUrl.pathname === "/api/csrf") {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (origin || referer) {
    // biome-ignore lint/style/noNonNullAssertion: referer checks are guarded
    const originUrl = origin ? new URL(origin) : new URL(referer!);
    if (originUrl.host !== host) {
      return NextResponse.json(
        { error: "Invalid Origin/Referer" },
        { status: 403 },
      );
    }
  }

  if (!verifyCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  return null;
}

export function setCsrfTokenCookie(
  response: NextResponse,
  secret: string,
): NextResponse {
  response.cookies.set(CSRF_TOKEN_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}
