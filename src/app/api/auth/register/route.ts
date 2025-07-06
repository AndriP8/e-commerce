import { NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import {
  hashPassword,
  generateToken,
  setAuthCookie,
} from "@/app/utils/auth-utils";
import {
  handleApiError,
  BadRequestError,
  ConflictError,
} from "@/app/utils/api-error-handler";

/**
 * POST /api/auth/register
 *
 * Registers a new user
 *
 * Request Body:
 * - email: User's email
 * - password: User's password
 * - firstName: User's first name (optional)
 * - lastName: User's last name (optional)
 *
 * @returns JSON response with token
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate input parameters
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    if (!password) {
      throw new BadRequestError("Password is required");
    }

    if (password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters long");
    }

    const client = await pool.connect();

    try {
      // Check if user already exists
      const checkUserQuery = `
        SELECT id FROM users WHERE email = $1
      `;

      const checkUserResult = await client.query(checkUserQuery, [email]);

      if (checkUserResult.rows.length > 0) {
        throw new ConflictError("Email already in use");
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Start a transaction
      await client.query("BEGIN");

      // Get the next ID from the sequence
      const getNextIdQuery = `SELECT nextval('users_id_seq')`;
      const nextIdResult = await client.query(getNextIdQuery);
      const userId = nextIdResult.rows[0].nextval;

      // Insert the new user
      const insertUserQuery = `
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, created_at, updated_at, is_active, user_type
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 'buyer')
        RETURNING id, email, user_type
      `;

      const insertUserResult = await client.query(insertUserQuery, [
        userId,
        email,
        hashedPassword,
        firstName || null,
        lastName || null,
      ]);

      // Commit the transaction
      await client.query("COMMIT");

      const newUser = insertUserResult.rows[0];

      // Generate JWT token
      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        user_type: newUser.user_type,
      });

      // Set the token in a cookie
      await setAuthCookie(token);

      // Return success response
      return NextResponse.json(
        {
          message: "Registration successful",
          data: {
            user: {
              id: newUser.id,
              email: newUser.email,
              user_type: newUser.user_type,
            },
          },
        },
        { status: 201 },
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
