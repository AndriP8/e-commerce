import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/app/utils/auth-utils";
import { handleApiError } from "@/app/utils/api-error-handler";

/**
 * POST /api/auth/logout
 *
 * Logs out a user by clearing the authentication cookie
 *
 * @returns JSON response with success message
 */
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
