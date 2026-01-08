import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/app/utils/auth-utils";
import {
  updateUserPreferredCurrency,
  getUserPreferredCurrency,
  getCurrencyByCode,
} from "@/app/utils/currency-utils";
import { handleApiError, BadRequestError } from "@/app/utils/api-error-handler";

/**
 * GET /api/user/currency-preference
 *
 * Retrieves the current user's currency preference
 *
 * @returns JSON response with the user's preferred currency code
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const preferred_currency = cookieStore.get("preferred_currency")?.value || "USD";

    // If user is authenticated, get their preference from database
    if (token) {
      const user = await getCurrentUser(token);
      const currency = await getUserPreferredCurrency(user.id);

      return NextResponse.json({
        currency,
        is_authenticated: true,
      });
    } else {
      const currency = await getCurrencyByCode(preferred_currency);
      return NextResponse.json({
        currency,
        is_authenticated: false,
      });
    }
  } catch (error) {
    console.error("Error fetching currency preference:", error);
    const apiError = handleApiError(error);

    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

/**
 * POST /api/user/currency-preference
 *
 * Updates the user's currency preference
 *
 * Request Body:
 * - currencyCode: The ISO currency code to set as preference
 *
 * @returns JSON response with success message
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { currencyCode } = await request.json();

    if (!currencyCode) {
      throw new BadRequestError("Currency code is required");
    }

    // Always set the cookie for all users
    cookieStore.set("preferred_currency", currencyCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // If user is authenticated, also update in database
    const token = cookieStore.get("token")?.value;
    if (token) {
      try {
        const user = await getCurrentUser(token);
        await updateUserPreferredCurrency(user.id, currencyCode);

        return NextResponse.json({
          message: "Currency preference updated successfully",
          is_authenticated: true,
        });
      } catch (error) {
        // If database update fails but cookie is set, still return success
        console.error("Error updating database currency preference:", error);
        return NextResponse.json({
          message: "Currency preference updated in session only",
          is_authenticated: false,
        });
      }
    }

    // For non-authenticated users, just return success for cookie update
    return NextResponse.json({
      message: "Currency preference updated successfully",
      is_authenticated: false,
    });
  } catch (error) {
    console.error("Error updating currency preference:", error);
    const apiError = handleApiError(error);

    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
