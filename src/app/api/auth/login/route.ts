import { NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import {
  comparePassword,
  generateToken,
  setAuthCookie,
} from "@/app/utils/auth-utils";
import {
  handleApiError,
  BadRequestError,
  UnauthorizedError,
} from "@/app/utils/api-error-handler";
import { validateBody } from "@/app/utils/validation";
import { loginSchema } from "@/app/schemas/auth";

/**
 * POST /api/auth/login
 *
 * Authenticates a user and returns a JWT token
 *
 * Request Body:
 * - email: User's email
 * - password: User's password
 *
 * @returns JSON response with token
 */
export async function POST(request: Request) {
  try {
    // Validate request body with Zod schema
    const { email, password } = await validateBody(request, loginSchema);

    const client = await pool.connect();

    try {
      // Find user by email
      const userQuery = `
        SELECT id, email, password_hash, user_type, is_active 
        FROM users 
        WHERE email = $1
      `;

      const userResult = await client.query(userQuery, [email]);

      if (userResult.rows.length === 0) {
        throw new UnauthorizedError("Invalid email or password");
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new UnauthorizedError("Account is inactive");
      }

      // Verify password
      const isPasswordValid = await comparePassword(
        password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        user_type: user.user_type,
      });

      // Set the token in a cookie
      await setAuthCookie(token);

      // Return success response
      return NextResponse.json(
        {
          message: "Login successful",
          data: {
            user: {
              id: user.id,
              email: user.email,
              user_type: user.user_type,
            },
          },
        },
        { status: 200 },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
