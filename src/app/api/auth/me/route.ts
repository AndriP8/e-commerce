import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/app/utils/auth-utils";
import { handleApiError } from "@/app/utils/api-error-handler";

/**
 * GET /api/auth/me
 *
 * Retrieves the current authenticated user's information
 *
 * @returns JSON response with user information or null
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    // Get the token from cookies
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          data: {
            user: null,
          },
        },
        { status: 200 },
      );
    }

    // Get the current user from the token
    const user = await getCurrentUser(token);

    // Return the user information
    return NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userType: user.user_type,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get current user error:", error);
    const apiError = handleApiError(error);

    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
