import { NextResponse } from "next/server";
import { handleApiError } from "@/app/utils/api-error-handler";
import { clearAuthCookie } from "@/app/utils/auth-utils";

export async function POST() {
  try {
    // Clear the authentication cookie
    await clearAuthCookie();

    // Return success response
    return NextResponse.json(
      {
        message: "Logout successful",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout error:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
