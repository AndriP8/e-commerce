import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, setCsrfTokenCookie } from "@/app/utils/csrf";

export async function GET(request: NextRequest) {
  const existingSecret = request.cookies.get("csrf-secret")?.value;
  const { secret, token } = generateCsrfToken(existingSecret);

  const response = NextResponse.json({ csrfToken: token });

  if (!existingSecret) {
    setCsrfTokenCookie(response, secret);
  }

  return response;
}
