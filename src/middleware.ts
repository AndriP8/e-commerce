import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { decrypt } from "@/lib/helpers/session";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Authorization
  if (path.startsWith("/backoffice") || path.startsWith("/login")) {
    const cookie = cookies().get("session")?.value;
    const session = cookie ? await decrypt(cookie) : null;

    if (!session && path.startsWith("/backoffice")) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (session?.id && path === "/login") {
      return NextResponse.redirect(new URL("/backoffice", req.nextUrl));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/backoffice/:path*"],
};
