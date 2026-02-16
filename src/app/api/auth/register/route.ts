import { NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import { ConflictError, handleApiError } from "@/app/utils/api-error-handler";
import {
  generateToken,
  hashPassword,
  setAuthCookie,
} from "@/app/utils/auth-utils";

import { registerSchema } from "@/schemas/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input parameters using Zod
    const { email, password, firstName, lastName } = registerSchema.parse(body);

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
      const token = await generateToken({
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
